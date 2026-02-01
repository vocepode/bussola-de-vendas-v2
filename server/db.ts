import { eq, and, desc, asc, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, modules, lessons, exercises, submissions, 
  lessonProgress, moduleProgress, badges, userBadges, resources,
  Module, Lesson, Exercise, Submission, ModuleProgress, LessonProgress,
  contentIdeas, contentScripts, ContentIdea, ContentScript, InsertContentIdea, InsertContentScript
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ========== USER MANAGEMENT ==========

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ========== MODULES ==========

export async function getAllModules(): Promise<Module[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(modules).where(eq(modules.isActive, true)).orderBy(asc(modules.orderIndex));
}

export async function getModuleBySlug(slug: string): Promise<Module | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(modules).where(eq(modules.slug, slug)).limit(1);
  return result[0];
}

// ========== LESSONS ==========

export async function getLessonsByModuleId(moduleId: number): Promise<Lesson[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(lessons)
    .where(and(eq(lessons.moduleId, moduleId), eq(lessons.isActive, true)))
    .orderBy(asc(lessons.orderIndex));
}

export async function getLessonById(lessonId: number): Promise<Lesson | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
  return result[0];
}

// ========== EXERCISES ==========

export async function getExercisesByLessonId(lessonId: number): Promise<Exercise[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(exercises).where(eq(exercises.lessonId, lessonId));
}

export async function getExerciseById(exerciseId: number): Promise<Exercise | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(exercises).where(eq(exercises.id, exerciseId)).limit(1);
  return result[0];
}

// ========== SUBMISSIONS ==========

export async function createSubmission(data: {
  userId: number;
  exerciseId: number;
  answer?: string;
  fileUrl?: string;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(submissions).values({
    userId: data.userId,
    exerciseId: data.exerciseId,
    answer: data.answer,
    fileUrl: data.fileUrl,
    status: "submitted",
  });
  
  return result.insertId;
}

export async function getUserSubmissions(userId: number): Promise<Submission[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(submissions)
    .where(eq(submissions.userId, userId))
    .orderBy(desc(submissions.submittedAt));
}

export async function getSubmissionByUserAndExercise(userId: number, exerciseId: number): Promise<Submission | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(submissions)
    .where(and(eq(submissions.userId, userId), eq(submissions.exerciseId, exerciseId)))
    .orderBy(desc(submissions.submittedAt))
    .limit(1);
  
  return result[0];
}

// ========== LESSON PROGRESS ==========

export async function upsertLessonProgress(data: {
  userId: number;
  lessonId: number;
  status: "not_started" | "in_progress" | "completed";
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(lessonProgress)
    .where(and(eq(lessonProgress.userId, data.userId), eq(lessonProgress.lessonId, data.lessonId)))
    .limit(1);
  
  if (existing.length > 0) {
    const updates: Partial<LessonProgress> = { status: data.status };
    
    if (data.status === "in_progress" && !existing[0].startedAt) {
      updates.startedAt = new Date();
    }
    
    if (data.status === "completed") {
      updates.completedAt = new Date();
    }
    
    await db.update(lessonProgress)
      .set(updates)
      .where(eq(lessonProgress.id, existing[0].id));
  } else {
    await db.insert(lessonProgress).values({
      userId: data.userId,
      lessonId: data.lessonId,
      status: data.status,
      startedAt: data.status !== "not_started" ? new Date() : null,
      completedAt: data.status === "completed" ? new Date() : null,
    });
  }
}

export async function getUserLessonProgress(userId: number, lessonId: number): Promise<LessonProgress | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)))
    .limit(1);
  
  return result[0];
}

// ========== MODULE PROGRESS ==========

export async function calculateModuleProgress(userId: number, moduleId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const moduleLessons = await getLessonsByModuleId(moduleId);
  if (moduleLessons.length === 0) return 0;
  
  const completedLessons = await db.select().from(lessonProgress)
    .where(and(
      eq(lessonProgress.userId, userId),
      eq(lessonProgress.status, "completed")
    ));
  
  const completedLessonIds = new Set(completedLessons.map(p => p.lessonId));
  const completedCount = moduleLessons.filter(l => completedLessonIds.has(l.id)).length;
  
  return Math.round((completedCount / moduleLessons.length) * 100);
}

export async function upsertModuleProgress(data: {
  userId: number;
  moduleId: number;
  status: "locked" | "in_progress" | "completed";
  progressPercentage: number;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(moduleProgress)
    .where(and(eq(moduleProgress.userId, data.userId), eq(moduleProgress.moduleId, data.moduleId)))
    .limit(1);
  
  if (existing.length > 0) {
    const updates: Partial<ModuleProgress> = {
      status: data.status,
      progressPercentage: data.progressPercentage,
    };
    
    if (data.status === "in_progress" && !existing[0].startedAt) {
      updates.startedAt = new Date();
    }
    
    if (data.status === "completed") {
      updates.completedAt = new Date();
    }
    
    await db.update(moduleProgress)
      .set(updates)
      .where(eq(moduleProgress.id, existing[0].id));
  } else {
    await db.insert(moduleProgress).values({
      userId: data.userId,
      moduleId: data.moduleId,
      status: data.status,
      progressPercentage: data.progressPercentage,
      startedAt: data.status !== "locked" ? new Date() : null,
      completedAt: data.status === "completed" ? new Date() : null,
    });
  }
}

export async function getUserModuleProgress(userId: number): Promise<ModuleProgress[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(moduleProgress).where(eq(moduleProgress.userId, userId));
}

// ========== BADGES ==========

export async function getAllBadges() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(badges);
}

export async function getUserBadges(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(userBadges).where(eq(userBadges.userId, userId));
}

export async function awardBadge(userId: number, badgeId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if already awarded
  const existing = await db.select().from(userBadges)
    .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)))
    .limit(1);
  
  if (existing.length === 0) {
    await db.insert(userBadges).values({ userId, badgeId });
  }
}

// ========== RESOURCES ==========

export async function getResourcesByModuleId(moduleId: number | null) {
  const db = await getDb();
  if (!db) return [];
  
  if (moduleId === null) {
    return await db.select().from(resources)
      .where(and(isNull(resources.moduleId), eq(resources.isActive, true)))
      .orderBy(asc(resources.orderIndex));
  }
  
  return await db.select().from(resources)
    .where(and(eq(resources.moduleId, moduleId), eq(resources.isActive, true)))
    .orderBy(asc(resources.orderIndex));
}


// ========== CONTENT IDEAS & SCRIPTS ==========

/**
 * Criar nova ideia de conteúdo
 */
export async function createContentIdea(idea: InsertContentIdea) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(contentIdeas).values(idea);
  return result.insertId;
}

/**
 * Listar ideias de conteúdo do usuário
 */
export async function listContentIdeas(userId: number, filters?: {
  funnel?: "c1" | "c2" | "c3";
  format?: string;
  theme?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(contentIdeas.userId, userId)];
  
  if (filters?.funnel) {
    conditions.push(eq(contentIdeas.funnel, filters.funnel));
  }
  
  const results = await db.select().from(contentIdeas).where(and(...conditions));
  return results;
}

/**
 * Buscar ideia por ID
 */
export async function getContentIdeaById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db
    .select()
    .from(contentIdeas)
    .where(and(eq(contentIdeas.id, id), eq(contentIdeas.userId, userId)))
    .limit(1);
  
  return results[0] || null;
}

/**
 * Atualizar ideia de conteúdo
 */
export async function updateContentIdea(id: number, userId: number, data: Partial<InsertContentIdea>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(contentIdeas)
    .set(data)
    .where(and(eq(contentIdeas.id, id), eq(contentIdeas.userId, userId)));
}

/**
 * Criar roteiro para uma ideia
 */
export async function createContentScript(script: InsertContentScript) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(contentScripts).values(script);
  return result.insertId;
}

/**
 * Buscar roteiro por ID da ideia
 */
export async function getContentScriptByIdeaId(contentIdeaId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db
    .select()
    .from(contentScripts)
    .where(and(
      eq(contentScripts.contentIdeaId, contentIdeaId),
      eq(contentScripts.userId, userId)
    ))
    .limit(1);
  
  return results[0] || null;
}

/**
 * Atualizar roteiro
 */
export async function updateContentScript(id: number, userId: number, data: Partial<InsertContentScript>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(contentScripts)
    .set(data)
    .where(and(eq(contentScripts.id, id), eq(contentScripts.userId, userId)));
}

/**
 * Listar roteiros com suas ideias (para Matriz de Conteúdo)
 */
export async function listContentScriptsWithIdeas(userId: number, filters?: {
  funnel?: "c1" | "c2" | "c3";
  progressStatus?: string;
  platform?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  
  // Query base juntando scripts com ideias
  const results = await db
    .select({
      script: contentScripts,
      idea: contentIdeas,
    })
    .from(contentScripts)
    .innerJoin(contentIdeas, eq(contentScripts.contentIdeaId, contentIdeas.id))
    .where(eq(contentScripts.userId, userId));
  
  // Filtrar no código (MySQL não suporta filtros complexos em JSON facilmente)
  let filtered = results;
  
  if (filters?.funnel) {
    filtered = filtered.filter(r => r.idea.funnel === filters.funnel);
  }
  
  if (filters?.progressStatus) {
    filtered = filtered.filter(r => r.script.progressStatus === filters.progressStatus);
  }
  
  return filtered;
}
