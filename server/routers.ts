import { TRPCError } from "@trpc/server";
import { adminProcedure, publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import bcrypt from "bcryptjs";

async function getOverviewData(userId: number) {
  const tableProgress = await db.getUserModuleProgress(userId);
  const userBadges = await db.getUserBadges(userId);
  const submissions = await db.getUserSubmissions(userId);
  const modules = await db.getAllModules();

  const progressByModuleId = new Map(tableProgress.map((p) => [p.moduleId, p]));
  const mergedProgress: typeof tableProgress = [];
  for (const mod of modules) {
    const ws = await db.getWorkspaceProgressByModule(userId, mod.id);
    const row = progressByModuleId.get(mod.id);
    const tablePct = row?.progressPercentage ?? 0;
    const pct = Math.max(tablePct, ws.percentage);
    const status = pct === 100 ? "completed" : pct > 0 ? "in_progress" : "locked";
    if (row) {
      mergedProgress.push({ ...row, progressPercentage: pct, status });
    } else {
      mergedProgress.push({
        id: 0,
        userId,
        moduleId: mod.id,
        status,
        progressPercentage: pct,
        startedAt: pct > 0 ? new Date() : null,
        completedAt: pct === 100 ? new Date() : null,
      } as (typeof tableProgress)[0]);
    }
  }

  const lessonCounts = await db.getLessonCountsByModuleIds(modules.map((m) => m.id));

  const RAIO_X_SECTIONS_COUNT = 3;
  let raioXPct = 0;
  try {
    const raioXRow = await db.getRaioXByUserId(userId);
    raioXPct = raioXRow?.progressoGeral ?? 0;
  } catch (err) {
    console.warn("[dashboard.getOverview] Erro ao carregar Raio-X (verifique migrations):", err);
  }
  const raioXCompletedSections = Math.round((raioXPct / 100) * RAIO_X_SECTIONS_COUNT);
  const raioXOverview = {
    sectionCount: RAIO_X_SECTIONS_COUNT,
    progressPercentage: raioXPct,
    completedSections: Math.min(raioXCompletedSections, RAIO_X_SECTIONS_COUNT),
  };

  const raioXModule = modules.find((m) => m.slug === "raio-x");
  if (raioXModule) {
    lessonCounts[raioXModule.id] = RAIO_X_SECTIONS_COUNT;
    const raioXProgressIdx = mergedProgress.findIndex((p) => p.moduleId === raioXModule.id);
    if (raioXProgressIdx >= 0) {
      mergedProgress[raioXProgressIdx] = {
        ...mergedProgress[raioXProgressIdx],
        progressPercentage: raioXPct,
        status: raioXPct === 100 ? "completed" : raioXPct > 0 ? "in_progress" : "locked",
      };
    }
  }

  let mapaPct = 0;
  try {
    mapaPct = await db.getMapaProgressPercentage(userId);
  } catch (err) {
    console.warn("[dashboard.getOverview] Erro ao carregar progresso MAPA:", err);
  }
  const mapaModule = modules.find((m) => m.slug === "mapa");
  const MAPA_SECTIONS_COUNT = 4; // editoriais, temas, temas por editoria, ideias
  if (mapaModule) {
    lessonCounts[mapaModule.id] = MAPA_SECTIONS_COUNT;
    const mapaProgressIdx = mergedProgress.findIndex((p) => p.moduleId === mapaModule.id);
    if (mapaProgressIdx >= 0) {
      mergedProgress[mapaProgressIdx] = {
        ...mergedProgress[mapaProgressIdx],
        progressPercentage: mapaPct,
        status: mapaPct === 100 ? "completed" : mapaPct > 0 ? "in_progress" : "locked",
      };
    }
  }

  const PILLAR_SLUGS = ["marco-zero", "norte", "raio-x", "mapa", "rota"] as const;
  const progressBySlug = new Map(
    PILLAR_SLUGS.map((slug) => {
      if (slug === "raio-x") return [slug, raioXPct] as const;
      if (slug === "mapa") return [slug, mapaPct] as const;
      const mod = modules.find((m) => m.slug === slug);
      const entry = mod ? mergedProgress.find((p) => p.moduleId === mod.id) : null;
      return [slug, entry?.progressPercentage ?? 0] as const;
    })
  );
  const pillarPercentages = PILLAR_SLUGS.map((s) => progressBySlug.get(s) ?? 0);
  const overallProgress =
    pillarPercentages.length > 0
      ? Math.round(pillarPercentages.reduce((a, b) => a + b, 0) / pillarPercentages.length)
      : 0;
  const completedCount = pillarPercentages.filter((p) => p === 100).length;
  const pillarsRemaining = Math.max(PILLAR_SLUGS.length - completedCount, 0);

  const mapaCompletedSections = Math.min(Math.round((mapaPct / 100) * MAPA_SECTIONS_COUNT), MAPA_SECTIONS_COUNT);
  const mapaOverview = {
    sectionCount: MAPA_SECTIONS_COUNT,
    progressPercentage: mapaPct,
    completedSections: mapaCompletedSections,
  };

  return {
    overallProgress,
    moduleProgress: mergedProgress,
    pillarsCompleted: completedCount,
    pillarsRemaining,
    lessonCounts,
    raioXOverview,
    mapaOverview,
    badgesCount: userBadges.length,
    submissionsCount: submissions.length,
  };
}

export const appRouter = router({
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    // No Next/Vercel, o logout (limpeza de cookie) será feito via rota HTTP dedicada.
    logout: publicProcedure.mutation(() => ({ success: true } as const)),
    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().trim().min(1, "Nome obrigatório").max(120),
          avatarUrl: z.string().url().max(512).nullable().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfileName(ctx.user.id, input.name);
        if (input.avatarUrl !== undefined) {
          await db.updateUserProfileAvatarUrl(ctx.user.id, input.avatarUrl);
        }
        return { success: true as const };
      }),
    changePassword: protectedProcedure
      .input(
        z.object({
          currentPassword: z.string().min(1),
          newPassword: z.string().min(8),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user) {
          throw new Error("Usuário não encontrado");
        }

        const currentOk = await bcrypt.compare(input.currentPassword, user.passwordHash);
        if (!currentOk) {
          throw new Error("Senha atual inválida");
        }

        const samePassword = await bcrypt.compare(input.newPassword, user.passwordHash);
        if (samePassword) {
          throw new Error("A nova senha deve ser diferente da senha atual");
        }

        const newHash = await bcrypt.hash(input.newPassword, 10);
        await db.updateUserPasswordHash(ctx.user.id, newHash);
        return { success: true as const };
      }),
  }),

  modules: router({
    list: publicProcedure.query(async () => {
      return await db.getAllModules();
    }),
    
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return (await db.getModuleBySlug(input.slug)) ?? null;
      }),
    
    getProgress: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserModuleProgress(ctx.user.id);
    }),
  }),

  sections: router({
    listTreeByModule: publicProcedure
      .input(z.object({ moduleId: z.number() }))
      .query(async ({ input }) => {
        const [allSections, allLessons] = await Promise.all([
          db.getSectionsByModuleId(input.moduleId),
          db.getLessonsByModuleIdForTree(input.moduleId),
        ]);

        const nodeById = new Map<
          number,
          {
            section: (typeof allSections)[number];
            children: any[];
            lessons: (typeof allLessons)[number][];
          }
        >();

        for (const s of allSections) {
          nodeById.set(s.id, { section: s, children: [], lessons: [] });
        }

        const roots: any[] = [];
        for (const s of allSections) {
          const node = nodeById.get(s.id);
          if (!node) continue;

          if (s.parentSectionId) {
            const parent = nodeById.get(s.parentSectionId);
            if (parent) parent.children.push(node);
            else roots.push(node);
          } else {
            roots.push(node);
          }
        }

        const rootLessons: (typeof allLessons)[number][] = [];
        for (const l of allLessons) {
          if (!l.sectionId) {
            rootLessons.push(l);
            continue;
          }
          const node = nodeById.get(l.sectionId);
          if (node) node.lessons.push(l);
          else rootLessons.push(l);
        }

        return { roots, rootLessons };
      }),
  }),

  workspaces: router({
    ensureNorthWorkspaceLessons: protectedProcedure.mutation(async () => {
      const norte = await db.ensureModule({
        slug: "norte",
        title: "NORTE - Estratégia",
        orderIndex: 1,
        description: "Defina a estratégia de vendas e o direcionamento do seu negócio",
      });

      // Lições internas do workspace (1 por sub-seção) — 7 sub-seções v2: Matrioska (1.1, 1.2), Sua Audiência (2.1, 2.2, 2.3), Posicionamento (3.1, 3.2).
      const workspaceLessons = [
        { slug: "ws-norte-matrioska-meu-negocio", title: "NORTE • Matrioska do Meu Negócio", orderIndex: 1 },
        { slug: "ws-norte-matrioska-concorrentes", title: "NORTE • Matrioska dos Concorrentes", orderIndex: 2 },
        { slug: "ws-norte-dados-demograficos", title: "NORTE • Dados Demográficos", orderIndex: 3 },
        { slug: "ws-norte-os-sentimentos", title: "NORTE • Os Sentimentos", orderIndex: 4 },
        { slug: "ws-norte-atitudes-interesses", title: "NORTE • Atitudes e Interesses", orderIndex: 5 },
        { slug: "ws-norte-laddering", title: "NORTE • Laddering", orderIndex: 6 },
        { slug: "ws-norte-proposta-valor", title: "NORTE • Proposta de Valor", orderIndex: 7 },
      ] as const;

      await db.deleteModuleLessons(norte.id);
      await db.ensureWorkspaceLessons({
        moduleId: norte.id,
        lessons: workspaceLessons.map((l) => ({ ...l, description: null })),
      });

      return { ok: true as const, moduleId: norte.id };
    }),

    ensureMarcoZeroWorkspaceLessons: protectedProcedure.mutation(async () => {
      const marcoZero = await db.ensureModule({
        slug: "marco-zero",
        title: "Marco Zero",
        orderIndex: 0,
        description: "Diagnóstico e jornada inicial do negócio",
      });

      const workspaceLessons = [
        { slug: "ws-marco-zero-jornada", title: "Sua Jornada até Aqui", orderIndex: 100 },
        { slug: "ws-marco-zero-desafios", title: "Seus Desafios Hoje", orderIndex: 101 },
        { slug: "ws-marco-zero-diagnostico", title: "Diagnóstico do Negócio", orderIndex: 102 },
        { slug: "ws-marco-zero-produtos", title: "Produtos e Serviços", orderIndex: 103 },
        { slug: "ws-marco-zero-identidade", title: "Identidade e Direção", orderIndex: 104 },
      ] as const;

      await db.ensureWorkspaceLessons({
        moduleId: marcoZero.id,
        lessons: workspaceLessons.map((l) => ({ ...l, description: null })),
      });

      return { ok: true as const, moduleId: marcoZero.id };
    }),

    ensureComecePorAquiWorkspaceLessons: protectedProcedure.mutation(async () => {
      const comece = await db.ensureModule({
        slug: "comece-por-aqui",
        title: "Comece por Aqui",
        orderIndex: -1,
        description: "Primeiros passos e informações iniciais",
      });

      const workspaceLessons = [
        { slug: "ws-comece-por-aqui-inicial", title: "Comece por Aqui", orderIndex: 0 },
      ] as const;

      await db.ensureWorkspaceLessons({
        moduleId: comece.id,
        lessons: workspaceLessons.map((l) => ({ ...l, description: null })),
      });

      return { ok: true as const, moduleId: comece.id };
    }),

    getProgressBySlug: protectedProcedure
      .input(z.object({ slug: z.enum(["marco-zero", "norte", "comece-por-aqui", "mapa"]) }))
      .query(async ({ ctx, input }) => {
        if (input.slug === "mapa") {
          const percentage = await db.getMapaProgressPercentage(ctx.user.id);
          const total = 4; // editoriais, temas, temas por editoria, ideias
          const completed = Math.round((percentage / 100) * total);
          return { completed, total, percentage };
        }
        const mod = await db.getModuleBySlug(input.slug);
        if (!mod) return { completed: 0, total: 0, percentage: 0 };
        return await db.getWorkspaceProgressByModule(ctx.user.id, mod.id);
      }),

    getWorkspaceStateBySlug: protectedProcedure
      .input(z.object({ slug: z.enum(["marco-zero", "norte", "comece-por-aqui"]) }))
      .query(async ({ ctx, input }) => {
        const mod = await db.getModuleBySlug(input.slug);
        if (!mod) return { steps: [] };
        const moduleLessons = await db.getLessonsByModuleId(mod.id);
        if (moduleLessons.length === 0) return { steps: [] };
        const lessonIds = moduleLessons.map((l) => l.id);
        const states = await db.getLessonUserStatesByLessonIds(ctx.user.id, lessonIds);
        const stateByLessonId = new Map(states.map((s) => [s.lessonId, s]));
        const steps = moduleLessons.map((lesson) => {
          const state = stateByLessonId.get(lesson.id);
          return {
            lessonId: lesson.id,
            title: lesson.title,
            status: (state?.status ?? "draft") as string,
            data: (state?.data ?? {}) as Record<string, unknown>,
            createdAt: state?.createdAt ?? null,
          };
        });
        return { steps };
      }),
  }),

  lessonState: router({
    get: protectedProcedure
      .input(z.object({ lessonId: z.number() }))
      .query(async ({ ctx, input }) => {
        const row = await db.getLessonUserState(ctx.user.id, input.lessonId);
        return (
          row ?? {
            userId: ctx.user.id,
            lessonId: input.lessonId,
            data: {},
            status: "draft" as const,
            updatedAt: null as Date | null,
          }
        );
      }),

    upsertDraft: protectedProcedure
      .input(
        z.object({
          lessonId: z.number(),
          // Zod v4: z.record precisa de keySchema + valueSchema
          patch: z.record(z.string(), z.unknown()),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.upsertLessonUserDraft({
          userId: ctx.user.id,
          lessonId: input.lessonId,
          patch: input.patch,
        });
      }),

    complete: protectedProcedure
      .input(z.object({ lessonId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.completeLessonUserState({ userId: ctx.user.id, lessonId: input.lessonId });
        // Sincronizar com lessonProgress e moduleProgress para o dashboard e a bússola refletirem a conclusão
        const lesson = await db.getLessonById(input.lessonId);
        if (lesson) {
          await db.upsertLessonProgress({
            userId: ctx.user.id,
            lessonId: input.lessonId,
            status: "completed",
          });
          const progressPercentage = await db.calculateModuleProgress(ctx.user.id, lesson.moduleId);
          const status = progressPercentage === 100 ? "completed" : "in_progress";
          await db.upsertModuleProgress({
            userId: ctx.user.id,
            moduleId: lesson.moduleId,
            status,
            progressPercentage,
          });
        }
        return result;
      }),

    reset: protectedProcedure
      .input(z.object({ lessonId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.resetLessonUserState({ userId: ctx.user.id, lessonId: input.lessonId });
        // Sincronizar lessonProgress e moduleProgress para o dashboard refletir
        const lesson = await db.getLessonById(input.lessonId);
        if (lesson) {
          await db.upsertLessonProgress({
            userId: ctx.user.id,
            lessonId: input.lessonId,
            status: "in_progress",
          });
          const progressPercentage = await db.calculateModuleProgress(ctx.user.id, lesson.moduleId);
          const status = progressPercentage === 100 ? "completed" : progressPercentage > 0 ? "in_progress" : "locked";
          await db.upsertModuleProgress({
            userId: ctx.user.id,
            moduleId: lesson.moduleId,
            status,
            progressPercentage,
          });
        }
        return result;
      }),
  }),

  lessons: router({
    listByModule: publicProcedure
      .input(z.object({ moduleId: z.number() }))
      .query(async ({ input }) => {
        return await db.getLessonsByModuleId(input.moduleId);
      }),
    
    getById: publicProcedure
      .input(z.object({ lessonId: z.number() }))
      .query(async ({ input }) => {
        return (await db.getLessonById(input.lessonId)) ?? null;
      }),
    
    getProgress: protectedProcedure
      .input(z.object({ lessonId: z.number() }))
      .query(async ({ ctx, input }) => {
        const progress = await db.getUserLessonProgress(ctx.user.id, input.lessonId);
        // Retornar objeto padrão se não houver progresso
        return progress || { status: "not_started" as const, userId: ctx.user.id, lessonId: input.lessonId };
      }),
    
    markProgress: protectedProcedure
      .input(z.object({
        lessonId: z.number(),
        status: z.enum(["not_started", "in_progress", "completed"]),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertLessonProgress({
          userId: ctx.user.id,
          lessonId: input.lessonId,
          status: input.status,
        });
        
        // Recalcular progresso do módulo
        const lesson = await db.getLessonById(input.lessonId);
        if (lesson) {
          const progressPercentage = await db.calculateModuleProgress(ctx.user.id, lesson.moduleId);
          const status = progressPercentage === 100 ? "completed" : progressPercentage > 0 ? "in_progress" : "locked";
          
          await db.upsertModuleProgress({
            userId: ctx.user.id,
            moduleId: lesson.moduleId,
            status,
            progressPercentage,
          });
          
          // Verificar badges
          if (status === "completed") {
            await checkAndAwardBadges(ctx.user.id, lesson.moduleId);
          }
        }
        
        return { success: true };
      }),
  }),

  exercises: router({
    listByLesson: publicProcedure
      .input(z.object({ lessonId: z.number() }))
      .query(async ({ input }) => {
        return await db.getExercisesByLessonId(input.lessonId);
      }),
    
    getById: publicProcedure
      .input(z.object({ exerciseId: z.number() }))
      .query(async ({ input }) => {
        return await db.getExerciseById(input.exerciseId);
      }),
    
    submit: protectedProcedure
      .input(z.object({
        exerciseId: z.number(),
        answer: z.string().optional(),
        fileUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const exercise = await db.getExerciseById(input.exerciseId);
        if (!exercise) {
          throw new Error("Exercise not found");
        }
        
        // Criar submission
        const submissionId = await db.createSubmission({
          userId: ctx.user.id,
          exerciseId: input.exerciseId,
          answer: input.answer,
          fileUrl: input.fileUrl,
        });
        
        // Marcar lição como em progresso ou completa
        await db.upsertLessonProgress({
          userId: ctx.user.id,
          lessonId: exercise.lessonId,
          status: "completed",
        });
        
        // Recalcular progresso do módulo
        const lesson = await db.getLessonById(exercise.lessonId);
        if (lesson) {
          const progressPercentage = await db.calculateModuleProgress(ctx.user.id, lesson.moduleId);
          const status = progressPercentage === 100 ? "completed" : "in_progress";
          
          await db.upsertModuleProgress({
            userId: ctx.user.id,
            moduleId: lesson.moduleId,
            status,
            progressPercentage,
          });
        }
        
        return { success: true, submissionId };
      }),
    
    getSubmission: protectedProcedure
      .input(z.object({ exerciseId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getSubmissionByUserAndExercise(ctx.user.id, input.exerciseId);
      }),
  }),

  badges: router({
    list: publicProcedure.query(async () => {
      return await db.getAllBadges();
    }),
    
    getUserBadges: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserBadges(ctx.user.id);
    }),
  }),

  resources: router({
    listByModule: publicProcedure
      .input(z.object({ moduleId: z.number().nullable() }))
      .query(async ({ input }) => {
        return await db.getResourcesByModuleId(input.moduleId);
      }),
  }),

  dashboard: router({
    getOverview: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await getOverviewData(ctx.user.id);
      } catch (err) {
        console.error("[dashboard.getOverview] Erro:", err);
        return {
          overallProgress: 0,
          moduleProgress: [],
          pillarsCompleted: 0,
          pillarsRemaining: 5,
          lessonCounts: {} as Record<number, number>,
          raioXOverview: { sectionCount: 3, progressPercentage: 0, completedSections: 0 },
          badgesCount: 0,
          submissionsCount: 0,
        };
      }
    }),
  }),

  admin: router({
    listUsers: adminProcedure.query(async () => {
      return await db.listUsersForAdmin();
    }),

    createUser: adminProcedure
      .input(
        z.object({
          name: z.string().min(1).optional(),
          email: z.string().email(),
          password: z.string().min(8),
          role: z.enum(["admin", "user"]).default("user"),
          isActive: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        const email = input.email.trim().toLowerCase();
        const existing = await db.getUserByEmail(email);
        if (existing) {
          throw new Error("Email já cadastrado");
        }

        const passwordHash = await bcrypt.hash(input.password, 10);
        const userId = await db.createUser({
          name: input.name ?? null,
          email,
          passwordHash,
          role: input.role,
          isActive: input.isActive,
        });

        return { success: true as const, userId };
      }),

    setUserAccess: adminProcedure
      .input(
        z.object({
          userId: z.number(),
          isActive: z.boolean(),
        })
      )
      .mutation(async ({ input }) => {
        await db.setUserAccess(input.userId, input.isActive);
        return { success: true as const };
      }),

    generatePasswordResetLink: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        const token = await db.createPasswordResetTokenForUser(input.userId, 60);
        return {
          success: true as const,
          resetUrl: `/redefinir-senha?token=${encodeURIComponent(token)}`,
        };
      }),
  }),

  mapa: router({
    editoriais: router({
      list: protectedProcedure.query(async ({ ctx }) => db.listMapaEditoriais(ctx.user.id)),
      create: protectedProcedure
        .input(z.object({ name: z.string().min(1), whyExplore: z.string().nullable().optional(), context: z.string().nullable().optional() }))
        .mutation(async ({ ctx, input }) => ({ id: await db.createMapaEditorial(ctx.user.id, input) })),
      update: protectedProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          whyExplore: z.string().nullable().optional(),
          context: z.string().nullable().optional(),
          orderIndex: z.number().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          const { id, ...data } = input;
          await db.updateMapaEditorial(id, ctx.user.id, data);
          return { success: true };
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          await db.deleteMapaEditorial(input.id, ctx.user.id);
          return { success: true };
        }),
    }),
    temas: router({
      list: protectedProcedure
        .input(z.object({ editorialId: z.number().optional() }).optional())
        .query(async ({ ctx, input }) => db.listMapaTemas(ctx.user.id, input?.editorialId)),
      create: protectedProcedure
        .input(z.object({ editorialId: z.number(), name: z.string().min(1), context: z.string().nullable().optional() }))
        .mutation(async ({ ctx, input }) => ({ id: await db.createMapaTema(ctx.user.id, input) })),
      update: protectedProcedure
        .input(z.object({
          id: z.number(),
          editorialId: z.number().optional(),
          name: z.string().min(1).optional(),
          context: z.string().nullable().optional(),
          orderIndex: z.number().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          const { id, ...data } = input;
          await db.updateMapaTema(id, ctx.user.id, data);
          return { success: true };
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          await db.deleteMapaTema(input.id, ctx.user.id);
          return { success: true };
        }),
    }),
  }),

  contentIdeas: router({
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        theme: z.string().optional(),
        themeId: z.number().optional(),
        topic: z.enum(["dicas", "principais_desejos", "perguntas_comuns", "mitos", "historias", "erros_comuns", "feedbacks", "diferencial_marca", "nossos_produtos"]),
        funnel: z.enum(["c1", "c2", "c3"]),
        format: z.enum(["video_curto", "video", "carrossel", "imagem", "estatico", "live", "stories"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const ideaId = await db.createContentIdea({
          userId: ctx.user.id,
          title: input.title,
          theme: input.theme || null,
          themeId: input.themeId ?? null,
          topic: input.topic,
          funnel: input.funnel,
          format: input.format ?? "estatico",
        });
        return { id: ideaId };
      }),

    list: protectedProcedure
      .input(z.object({
        funnel: z.enum(["c1", "c2", "c3"]).optional(),
        format: z.enum(["video_curto", "video", "carrossel", "imagem", "estatico", "live", "stories"]).optional(),
        theme: z.string().optional(),
        themeId: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return await db.listContentIdeas(ctx.user.id, input);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getContentIdeaById(input.id, ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        theme: z.string().optional(),
        themeId: z.number().nullable().optional(),
        topic: z.enum(["dicas", "principais_desejos", "perguntas_comuns", "mitos", "historias", "erros_comuns", "feedbacks", "diferencial_marca", "nossos_produtos"]).optional(),
        funnel: z.enum(["c1", "c2", "c3"]).optional(),
        format: z.enum(["video_curto", "video", "carrossel", "imagem", "estatico", "live", "stories"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateContentIdea(id, ctx.user.id, data);
        return { success: true };
      }),
  }),

  contentScripts: router({
    create: protectedProcedure
      .input(z.object({
        contentIdeaId: z.number(),
        deadlinePlanning: z.string().optional(),
        strategy: z.enum(["vendas", "atracao", "autoridade", "branding"]).optional(),
        ladderingAttributes: z.array(z.string()).optional(),
        ladderingFunctionalBenefits: z.array(z.string()).optional(),
        ladderingEmotionalBenefits: z.array(z.string()).optional(),
        funnelGoal: z.enum(["seguidores", "branding", "leads", "venda", "autoridade", "quebrar_objecao", "inspirar", "gerar_leads", "prova_social"]).optional(),
        progressStatus: z.enum(["ideia", "a_fazer", "planejando_roteiro", "gravacao", "design", "aprovacao", "programado", "publicado"]).optional(),
        platforms: z.array(z.string()).optional(),
        scriptFields: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const scriptId = await db.createContentScript({
          userId: ctx.user.id,
          contentIdeaId: input.contentIdeaId,
          deadlinePlanning: input.deadlinePlanning ? new Date(input.deadlinePlanning) : null,
          strategy: input.strategy || null,
          ladderingAttributes: input.ladderingAttributes || null,
          ladderingFunctionalBenefits: input.ladderingFunctionalBenefits || null,
          ladderingEmotionalBenefits: input.ladderingEmotionalBenefits || null,
          funnelGoal: input.funnelGoal || null,
          progressStatus: input.progressStatus || "ideia",
          platforms: input.platforms || null,
          scriptFields: input.scriptFields || null,
        });
        return { id: scriptId };
      }),

    getByIdeaId: protectedProcedure
      .input(z.object({ contentIdeaId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getContentScriptByIdeaId(input.contentIdeaId, ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        deadlinePlanning: z.string().optional(),
        strategy: z.enum(["vendas", "atracao", "autoridade", "branding"]).optional(),
        ladderingAttributes: z.array(z.string()).optional(),
        ladderingFunctionalBenefits: z.array(z.string()).optional(),
        ladderingEmotionalBenefits: z.array(z.string()).optional(),
        funnelGoal: z.enum(["seguidores", "branding", "leads", "venda", "autoridade", "quebrar_objecao", "inspirar", "gerar_leads", "prova_social"]).optional(),
        progressStatus: z.enum(["ideia", "a_fazer", "planejando_roteiro", "gravacao", "design", "aprovacao", "programado", "publicado"]).optional(),
        platforms: z.array(z.string()).optional(),
        scriptFields: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, deadlinePlanning, ...rest } = input;
        const data = {
          ...rest,
          deadlinePlanning: deadlinePlanning ? new Date(deadlinePlanning) : undefined,
        };
        await db.updateContentScript(id, ctx.user.id, data);
        return { success: true };
      }),

    listWithIdeas: protectedProcedure
      .input(z.object({
        funnel: z.enum(["c1", "c2", "c3"]).optional(),
        progressStatus: z.enum(["ideia", "a_fazer", "planejando_roteiro", "gravacao", "design", "aprovacao", "programado", "publicado"]).optional(),
        platform: z.string().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return await db.listContentScriptsWithIdeas(ctx.user.id, input);
      }),
  }),

  raioX: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      try {
        // Trava Norte desativada para validação; reativar depois exigindo Norte 100%
        let norteCompleto = false;
        const norteMod = await db.getModuleBySlug("norte");
        if (norteMod) {
          const progress = await db.getWorkspaceProgressByModule(ctx.user.id, norteMod.id);
          norteCompleto = progress.percentage === 100;
        }
        const norteData: Record<string, unknown> | null = null;
        let row = await db.getRaioXByUserId(ctx.user.id);
        if (!row) {
          row = await db.createRaioXIfNotExists(ctx.user.id, norteCompleto, norteData);
        }
        const etapasConcluidas = Array.isArray((row as { etapasConcluidas?: string[] }).etapasConcluidas)
          ? (row as { etapasConcluidas: string[] }).etapasConcluidas
          : [];
        return {
          bloqueado: false as const,
          data: {
            id: row.id,
            userId: row.userId,
            version: row.version,
            secaoRedesSociais: row.secaoRedesSociais ?? undefined,
            secaoWeb: row.secaoWeb ?? undefined,
            secaoAnalise: row.secaoAnalise ?? undefined,
            etapasConcluidas,
            progressoGeral: row.progressoGeral ?? 0,
            concluido: row.concluido ?? false,
            norteCompleto: row.norteCompleto ?? false,
            norteData: row.norteData ?? undefined,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
          },
          norteData: row.norteData ?? undefined,
        };
      } catch (err) {
        console.error("[raioX.get]", err);
        const msg = err instanceof Error ? err.message : String(err);
        const isTableMissing = /relation "raio_x" does not exist|table "raio_x" does not exist/i.test(msg);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: isTableMissing
            ? "Tabela raio_x não existe. Execute: yarn db:push (ou aplique a migration 0006_raio_x.sql no banco)."
            : `Erro ao carregar Raio-X: ${msg}`,
        });
      }
    }),

    saveSecao: protectedProcedure
      .input(
        z.object({
          secao: z.enum(["redes_sociais", "web", "analise"]),
          data: z.record(z.string(), z.unknown()),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { updatedAt } = await db.upsertRaioXSecao(ctx.user.id, input.secao, input.data);
        return { success: true, updatedAt: updatedAt.toISOString() };
      }),

    concluirEtapa: protectedProcedure
      .input(z.object({ secao: z.enum(["redes_sociais", "web", "analise"]) }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.concluirEtapaRaioX(ctx.user.id, input.secao);
        return { success: true, updatedAt: result.updatedAt.toISOString(), etapasConcluidas: result.etapasConcluidas };
      }),

    updateProgress: protectedProcedure
      .input(z.object({ progresso: z.number().min(0).max(100) }))
      .mutation(async ({ ctx, input }) => {
        await db.updateRaioXProgress(ctx.user.id, input.progresso);
        return { success: true };
      }),

    concluir: protectedProcedure.mutation(async ({ ctx }) => {
      const row = await db.getRaioXByUserId(ctx.user.id);
      const secaoAnalise = row?.secaoAnalise as { meses?: unknown[] } | undefined;
      const meses = Array.isArray(secaoAnalise?.meses) ? secaoAnalise.meses : [];
      if (meses.length < 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Preencha pelo menos um mês na Análise para concluir o Raio-X.",
        });
      }
      await db.setRaioXConcluido(ctx.user.id);
      return { success: true };
    }),
  }),
});

// Helper para verificar e conceder badges
async function checkAndAwardBadges(userId: number, moduleId: number) {
  const allBadges = await db.getAllBadges();
  
  for (const badge of allBadges) {
    if (badge.criteria && typeof badge.criteria === 'object') {
      const criteria = badge.criteria as { type: string; moduleId?: number };
      
      if (criteria.type === "module_complete" && criteria.moduleId === moduleId) {
        await db.awardBadge(userId, badge.id);
      }
    }
  }
}

export type AppRouter = typeof appRouter;
