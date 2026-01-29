import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("Modules System", () => {
  let testUserId: number;

  beforeAll(async () => {
    testUserId = 1;
  });

  it("should list all active modules", async () => {
    const ctx = createAuthContext(testUserId);
    const caller = appRouter.createCaller(ctx);

    const modules = await caller.modules.list();

    expect(modules).toBeDefined();
    expect(Array.isArray(modules)).toBe(true);
    expect(modules.length).toBeGreaterThan(0);
    
    // Verificar estrutura do módulo
    const firstModule = modules[0];
    expect(firstModule).toHaveProperty("id");
    expect(firstModule).toHaveProperty("slug");
    expect(firstModule).toHaveProperty("title");
    expect(firstModule).toHaveProperty("orderIndex");
  });

  it("should get module by slug", async () => {
    const ctx = createAuthContext(testUserId);
    const caller = appRouter.createCaller(ctx);

    const module = await caller.modules.getBySlug({ slug: "marco-zero" });

    expect(module).toBeDefined();
    expect(module?.slug).toBe("marco-zero");
    expect(module?.title).toBe("Marco Zero");
  });

  it("should track module progress", async () => {
    const ctx = createAuthContext(testUserId);
    const caller = appRouter.createCaller(ctx);

    // Inicializar progresso
    await db.upsertModuleProgress({
      userId: testUserId,
      moduleId: 1,
      status: "in_progress",
      progressPercentage: 50,
    });

    const progress = await caller.modules.getProgress();

    expect(progress).toBeDefined();
    expect(Array.isArray(progress)).toBe(true);
    
    const moduleProgress = progress.find(p => p.moduleId === 1);
    expect(moduleProgress).toBeDefined();
    expect(moduleProgress?.status).toBe("in_progress");
    expect(moduleProgress?.progressPercentage).toBe(50);
  });
});

describe("Lessons System", () => {
  it("should list lessons by module", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const lessons = await caller.lessons.listByModule({ moduleId: 1 });

    expect(lessons).toBeDefined();
    expect(Array.isArray(lessons)).toBe(true);
    
    if (lessons.length > 0) {
      const firstLesson = lessons[0];
      expect(firstLesson).toHaveProperty("id");
      expect(firstLesson).toHaveProperty("title");
      expect(firstLesson).toHaveProperty("contentType");
      expect(firstLesson).toHaveProperty("moduleId");
      expect(firstLesson.moduleId).toBe(1);
    }
  });

  it("should mark lesson progress", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lessons.markProgress({
      lessonId: 1,
      status: "completed",
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);

    // Verificar se o progresso foi salvo
    const progress = await caller.lessons.getProgress({ lessonId: 1 });
    expect(progress).toBeDefined();
    expect(progress?.status).toBe("completed");
  });
});

describe("Exercises System", () => {
  it("should list exercises by lesson", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const exercises = await caller.exercises.listByLesson({ lessonId: 2 });

    expect(exercises).toBeDefined();
    expect(Array.isArray(exercises)).toBe(true);
  });

  it("should submit exercise answer", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.exercises.submit({
      exerciseId: 1,
      answer: "Esta é minha resposta de teste para o exercício",
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.submissionId).toBeGreaterThan(0);

    // Verificar se a submission foi salva
    const submission = await caller.exercises.getSubmission({ exerciseId: 1 });
    expect(submission).toBeDefined();
    expect(submission?.answer).toContain("teste");
  });
});

describe("Dashboard System", () => {
  it("should get dashboard overview", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const dashboard = await caller.dashboard.getOverview();

    expect(dashboard).toBeDefined();
    expect(dashboard).toHaveProperty("overallProgress");
    expect(dashboard).toHaveProperty("moduleProgress");
    expect(dashboard).toHaveProperty("badgesCount");
    expect(dashboard).toHaveProperty("submissionsCount");
    
    expect(typeof dashboard.overallProgress).toBe("number");
    expect(dashboard.overallProgress).toBeGreaterThanOrEqual(0);
    expect(dashboard.overallProgress).toBeLessThanOrEqual(100);
  });
});
