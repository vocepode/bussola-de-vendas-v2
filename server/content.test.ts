import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { Context } from "./_core/context";

// Mock user para testes
const mockUser = {
  id: 1,
  openId: "test-user-123",
  name: "Test User",
  email: "test@example.com",
  role: "user" as const,
  loginMethod: null,
  createdAt: new Date(),
};

// Mock context
const createMockContext = (): Context => ({
  user: mockUser,
  req: {} as any,
  res: {} as any,
});

describe("Content Ideas API", () => {
  let createdIdeaId: number;

  it("should create a new content idea", async () => {
    const caller = appRouter.createCaller(createMockContext());
    
    const result = await caller.contentIdeas.create({
      title: "Teste: Como aumentar vendas",
      theme: "Vendas",
      topic: "dicas",
      funnel: "c1",
      format: "video_curto",
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
    createdIdeaId = result.id;
  });

  it("should list content ideas", async () => {
    const caller = appRouter.createCaller(createMockContext());
    
    const ideas = await caller.contentIdeas.list();
    
    expect(Array.isArray(ideas)).toBe(true);
    expect(ideas.length).toBeGreaterThan(0);
  });

  it("should filter ideas by funnel", async () => {
    const caller = appRouter.createCaller(createMockContext());
    
    const c1Ideas = await caller.contentIdeas.list({ funnel: "c1" });
    
    expect(Array.isArray(c1Ideas)).toBe(true);
    c1Ideas.forEach(idea => {
      expect(idea.funnel).toBe("c1");
    });
  });

  it("should get idea by id", async () => {
    const caller = appRouter.createCaller(createMockContext());
    
    const idea = await caller.contentIdeas.getById({ id: createdIdeaId });
    
    expect(idea).toBeTruthy();
    expect(idea?.title).toBe("Teste: Como aumentar vendas");
    expect(idea?.topic).toBe("dicas");
  });

  it("should update content idea", async () => {
    const caller = appRouter.createCaller(createMockContext());
    
    const result = await caller.contentIdeas.update({
      id: createdIdeaId,
      title: "Teste: Como aumentar vendas (atualizado)",
    });
    
    expect(result.success).toBe(true);
    
    const updated = await caller.contentIdeas.getById({ id: createdIdeaId });
    expect(updated?.title).toBe("Teste: Como aumentar vendas (atualizado)");
  });
});

describe("Content Scripts API", () => {
  let testIdeaId: number;
  let createdScriptId: number;

  beforeAll(async () => {
    // Criar uma ideia para testar scripts
    const caller = appRouter.createCaller(createMockContext());
    const idea = await caller.contentIdeas.create({
      title: "Ideia para teste de script",
      topic: "dicas",
      funnel: "c2",
      format: "carrossel",
    });
    testIdeaId = idea.id;
  });

  it("should create a content script", async () => {
    const caller = appRouter.createCaller(createMockContext());
    
    const result = await caller.contentScripts.create({
      contentIdeaId: testIdeaId,
      strategy: "vendas",
      funnelGoal: "leads",
      progressStatus: "ideia",
      ladderingAttributes: ["Qualidade", "Preço justo"],
      ladderingFunctionalBenefits: ["Economia de tempo"],
      ladderingEmotionalBenefits: ["Segurança", "Confiança"],
      platforms: ["instagram", "facebook"],
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
    createdScriptId = result.id;
  });

  it("should get script by idea id", async () => {
    const caller = appRouter.createCaller(createMockContext());
    
    const script = await caller.contentScripts.getByIdeaId({
      contentIdeaId: testIdeaId,
    });
    
    expect(script).toBeTruthy();
    expect(script?.contentIdeaId).toBe(testIdeaId);
    expect(script?.strategy).toBe("vendas");
  });

  it("should update content script", async () => {
    const caller = appRouter.createCaller(createMockContext());
    
    const result = await caller.contentScripts.update({
      id: createdScriptId,
      progressStatus: "planejando_roteiro",
      scriptFields: {
        card1_capa: "Título impactante",
        card2_contracapa: "Subtítulo chamativo",
      },
    });
    
    expect(result.success).toBe(true);
    
    const updated = await caller.contentScripts.getByIdeaId({
      contentIdeaId: testIdeaId,
    });
    expect(updated?.progressStatus).toBe("planejando_roteiro");
  });

  it("should list scripts with ideas", async () => {
    const caller = appRouter.createCaller(createMockContext());
    
    const scriptsWithIdeas = await caller.contentScripts.listWithIdeas();
    
    expect(Array.isArray(scriptsWithIdeas)).toBe(true);
    expect(scriptsWithIdeas.length).toBeGreaterThan(0);
    
    scriptsWithIdeas.forEach(item => {
      expect(item).toHaveProperty("script");
      expect(item).toHaveProperty("idea");
    });
  });

  it("should filter scripts by funnel", async () => {
    const caller = appRouter.createCaller(createMockContext());
    
    const c2Scripts = await caller.contentScripts.listWithIdeas({
      funnel: "c2",
    });
    
    expect(Array.isArray(c2Scripts)).toBe(true);
    c2Scripts.forEach(item => {
      expect(item.idea.funnel).toBe("c2");
    });
  });

  it("should filter scripts by progress status", async () => {
    const caller = appRouter.createCaller(createMockContext());
    
    const planningScripts = await caller.contentScripts.listWithIdeas({
      progressStatus: "planejando_roteiro",
    });
    
    expect(Array.isArray(planningScripts)).toBe(true);
    planningScripts.forEach(item => {
      expect(item.script.progressStatus).toBe("planejando_roteiro");
    });
  });
});

describe("Content Ideas - Validation", () => {
  it("should reject invalid topic", async () => {
    const caller = appRouter.createCaller(createMockContext());
    
    await expect(
      caller.contentIdeas.create({
        title: "Test",
        topic: "invalid_topic" as any,
        funnel: "c1",
        format: "video_curto",
      })
    ).rejects.toThrow();
  });

  it("should reject invalid funnel", async () => {
    const caller = appRouter.createCaller(createMockContext());
    
    await expect(
      caller.contentIdeas.create({
        title: "Test",
        topic: "dicas",
        funnel: "c4" as any,
        format: "video_curto",
      })
    ).rejects.toThrow();
  });

  it("should reject invalid format", async () => {
    const caller = appRouter.createCaller(createMockContext());
    
    await expect(
      caller.contentIdeas.create({
        title: "Test",
        topic: "dicas",
        funnel: "c1",
        format: "invalid_format" as any,
      })
    ).rejects.toThrow();
  });
});

describe("Content Scripts - Validation", () => {
  it("should reject invalid strategy", async () => {
    const caller = appRouter.createCaller(createMockContext());
    
    await expect(
      caller.contentScripts.create({
        contentIdeaId: 1,
        strategy: "invalid_strategy" as any,
      })
    ).rejects.toThrow();
  });

  it("should reject invalid progress status", async () => {
    const caller = appRouter.createCaller(createMockContext());
    
    await expect(
      caller.contentScripts.create({
        contentIdeaId: 1,
        progressStatus: "invalid_status" as any,
      })
    ).rejects.toThrow();
  });

  it("should reject invalid funnel goal", async () => {
    const caller = appRouter.createCaller(createMockContext());
    
    await expect(
      caller.contentScripts.create({
        contentIdeaId: 1,
        funnelGoal: "invalid_goal" as any,
      })
    ).rejects.toThrow();
  });
});
