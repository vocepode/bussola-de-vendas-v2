import { adminProcedure, publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import bcrypt from "bcryptjs";

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

      // Lições internas do workspace (1 por subetapa) para salvar rascunhos separadamente.
      const workspaceLessons = [
        // Onde você está
        { slug: "ws-norte-onde-voce-esta-minha-empresa", title: "NORTE • Onde você está • Minha empresa", orderIndex: 900 },
        { slug: "ws-norte-onde-voce-esta-concorrentes", title: "NORTE • Onde você está • Concorrentes", orderIndex: 901 },

        // Sua audiência
        { slug: "ws-norte-audiencia-faixa-etaria", title: "NORTE • Sua audiência • Faixa etária", orderIndex: 910 },
        { slug: "ws-norte-audiencia-localizacao", title: "NORTE • Sua audiência • Localização", orderIndex: 911 },
        { slug: "ws-norte-audiencia-nivel-educacao", title: "NORTE • Sua audiência • Nível de educação", orderIndex: 912 },
        { slug: "ws-norte-audiencia-faixa-renda", title: "NORTE • Sua audiência • Faixa de renda", orderIndex: 913 },
        { slug: "ws-norte-audiencia-quem-nao-e", title: "NORTE • Sua audiência • Quem não é", orderIndex: 914 },
        { slug: "ws-norte-audiencia-interesses", title: "NORTE • Sua audiência • Interesses", orderIndex: 915 },
        { slug: "ws-norte-audiencia-hobbies", title: "NORTE • Sua audiência • Hobbies", orderIndex: 916 },
        { slug: "ws-norte-audiencia-buscas", title: "NORTE • Sua audiência • Principais buscas na internet", orderIndex: 917 },
        { slug: "ws-norte-audiencia-preferencias", title: "NORTE • Sua audiência • Preferências de conteúdo", orderIndex: 918 },
        { slug: "ws-norte-audiencia-compra", title: "NORTE • Sua audiência • Comportamento de compra", orderIndex: 919 },
        { slug: "ws-norte-audiencia-objetivos", title: "NORTE • Sua audiência • Objetivos de vida", orderIndex: 920 },
        { slug: "ws-norte-audiencia-desafios", title: "NORTE • Sua audiência • Desafios", orderIndex: 921 },
        { slug: "ws-norte-audiencia-valores-medos", title: "NORTE • Sua audiência • Valores e medos", orderIndex: 922 },
        { slug: "ws-norte-audiencia-desejos", title: "NORTE • Sua audiência • Desejos", orderIndex: 923 },
        { slug: "ws-norte-audiencia-dores", title: "NORTE • Sua audiência • Dores", orderIndex: 924 },
        { slug: "ws-norte-audiencia-objecoes", title: "NORTE • Sua audiência • Objeções", orderIndex: 925 },

        // Posicionamento
        { slug: "ws-norte-posicionamento-laddering", title: "NORTE • Posicionamento • Laddering", orderIndex: 930 },
        { slug: "ws-norte-posicionamento-quadro", title: "NORTE • Posicionamento • Quadro", orderIndex: 931 },
        { slug: "ws-norte-posicionamento-proposta-atual", title: "NORTE • Posicionamento • Minha proposta de valor", orderIndex: 932 },
        { slug: "ws-norte-posicionamento-reflexao", title: "NORTE • Posicionamento • Perguntas de reflexão", orderIndex: 933 },
        { slug: "ws-norte-posicionamento-proposta-nova", title: "NORTE • Posicionamento • Sua nova proposta de valor", orderIndex: 934 },
      ] as const;

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

      // Lições do workspace Marco Zero (match por lessonTitleIncludes no front: "Marco Zero" e "1. Diagnóstico")
      const workspaceLessons = [
        { slug: "ws-marco-zero-jornada", title: "Marco Zero - Sua Jornada até aqui", orderIndex: 100 },
        { slug: "ws-marco-zero-diagnostico", title: "1. Diagnóstico do negócio", orderIndex: 101 },
      ] as const;

      await db.ensureWorkspaceLessons({
        moduleId: marcoZero.id,
        lessons: workspaceLessons.map((l) => ({ ...l, description: null })),
      });

      return { ok: true as const, moduleId: marcoZero.id };
    }),

    getProgressBySlug: protectedProcedure
      .input(z.object({ slug: z.enum(["marco-zero", "norte"]) }))
      .query(async ({ ctx, input }) => {
        const mod = await db.getModuleBySlug(input.slug);
        if (!mod) return { completed: 0, total: 0, percentage: 0 };
        return await db.getWorkspaceProgressByModule(ctx.user.id, mod.id);
      }),

    getWorkspaceStateBySlug: protectedProcedure
      .input(z.object({ slug: z.enum(["marco-zero", "norte"]) }))
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
        return await db.completeLessonUserState({ userId: ctx.user.id, lessonId: input.lessonId });
      }),

    reset: protectedProcedure
      .input(z.object({ lessonId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.resetLessonUserState({ userId: ctx.user.id, lessonId: input.lessonId });
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
      const moduleProgress = await db.getUserModuleProgress(ctx.user.id);
      const userBadges = await db.getUserBadges(ctx.user.id);
      const submissions = await db.getUserSubmissions(ctx.user.id);
      
      // Calcular progresso geral
      const modules = await db.getAllModules();
      const totalProgress = moduleProgress.reduce((sum, p) => sum + p.progressPercentage, 0);
      const overallProgress = modules.length > 0 ? Math.round(totalProgress / modules.length) : 0;
      const completedCount = moduleProgress.filter((p) => p.status === "completed").length;
      const pillarsRemaining = Math.max(modules.length - completedCount, 0);
      const lessonCounts = await db.getLessonCountsByModuleIds(modules.map((m) => m.id));
      
      return {
        overallProgress,
        moduleProgress,
        pillarsCompleted: completedCount,
        pillarsRemaining,
        lessonCounts,
        badgesCount: userBadges.length,
        submissionsCount: submissions.length,
      };
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

  contentIdeas: router({
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        theme: z.string().optional(),
        topic: z.enum(["dicas", "principais_desejos", "perguntas_comuns", "mitos", "historias", "erros_comuns", "feedbacks", "diferencial_marca", "nossos_produtos"]),
        funnel: z.enum(["c1", "c2", "c3"]),
        format: z.enum(["video_curto", "video", "carrossel", "imagem", "estatico", "live", "stories"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const ideaId = await db.createContentIdea({
          userId: ctx.user.id,
          title: input.title,
          theme: input.theme || null,
          topic: input.topic,
          funnel: input.funnel,
          format: input.format,
        });
        return { id: ideaId };
      }),

    list: protectedProcedure
      .input(z.object({
        funnel: z.enum(["c1", "c2", "c3"]).optional(),
        format: z.enum(["video_curto", "video", "carrossel", "imagem", "estatico", "live", "stories"]).optional(),
        theme: z.string().optional(),
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
