import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  modules: router({
    list: publicProcedure.query(async () => {
      return await db.getAllModules();
    }),
    
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getModuleBySlug(input.slug);
      }),
    
    getProgress: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserModuleProgress(ctx.user.id);
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
        return await db.getLessonById(input.lessonId);
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
      
      return {
        overallProgress,
        moduleProgress,
        badgesCount: userBadges.length,
        submissionsCount: submissions.length,
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
