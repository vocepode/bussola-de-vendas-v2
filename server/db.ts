import { eq, and, desc, asc, isNull, inArray, gt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { setDefaultResultOrder, lookup } from "node:dns/promises";
import { isIP } from "node:net";
import crypto from "node:crypto";
import { 
  InsertUser, users, sessions, passwordResetTokens, modules, sections, lessons, lessonUserState, exercises, submissions, 
  lessonProgress, moduleProgress, badges, userBadges, resources,
  Module, Section, Lesson, LessonUserState, Exercise, Submission, ModuleProgress, LessonProgress,
  contentIdeas, contentScripts, ContentIdea, ContentScript, InsertContentIdea, InsertContentScript,
  mapaEditoriais, mapaTemas, MapEditorial, MapTema, InsertMapEditorial, InsertMapTema,
  raioX,
  RaioX,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;
let _sql: postgres.Sql | null = null;
let _dnsOrderConfigured = false;

function ensureDnsIpv4First() {
  if (_dnsOrderConfigured) return;
  _dnsOrderConfigured = true;
  // Em algumas redes, o DNS retorna IPv6 primeiro e a conexão com o Supabase pode falhar (ECONNREFUSED).
  // Isso força o Node a preferir IPv4 quando ambos existirem.
  try {
    setDefaultResultOrder("ipv4first");
  } catch {
    // Ignora em runtimes que não suportam.
  }
}

function isMissingIsActiveColumnError(error: unknown): boolean {
  const message = (error as { message?: string })?.message ?? "";
  const causeCode = (error as { cause?: { code?: string } })?.cause?.code ?? "";
  return message.includes('users.isActive') || (causeCode === "42703" && message.includes("users"));
}

/** Extrai host e port da URL (tudo após o último @ até a primeira / ou ?). */
function extractHostFromUrl(databaseUrl: string): { host: string; port: string } | null {
  const at = databaseUrl.lastIndexOf("@");
  if (at === -1) return null;
  const afterAt = databaseUrl.slice(at + 1);
  const m = afterAt.match(/^([^:\s]+):(\d+)/);
  if (!m) return null;
  return { host: m[1].trim(), port: m[2] };
}

/** Substitui o host na URL pelo IP IPv4 resolvido (evita ECONNREFUSED em IPv6). */
async function databaseUrlWithIpv4(databaseUrl: string): Promise<string> {
  const extracted = extractHostFromUrl(databaseUrl);
  if (!extracted || !extracted.host) {
    console.warn("[db] Não foi possível extrair host da DATABASE_URL (formato esperado: ...@host:port/...)");
    return databaseUrl;
  }
  if (isIP(extracted.host) !== 0) return databaseUrl;
  try {
    const { address } = await lookup(extracted.host, { family: 4 });
    const safeHost = extracted.host.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return databaseUrl.replace(new RegExp(`@${safeHost}:${extracted.port}`, "g"), `@${address}:${extracted.port}`);
  } catch (e) {
    console.warn("[db] Resolução IPv4 falhou para", extracted.host, "-", (e as Error).message);
    return databaseUrl;
  }
}

export async function getDb() {
  if (_db) return _db;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;

  try {
    ensureDnsIpv4First();
    const resolvedUrl = await databaseUrlWithIpv4(databaseUrl);
    _sql = postgres(resolvedUrl, {
      prepare: false,
    });
    _db = drizzle(_sql);
  } catch (error) {
    console.warn("[Database] Failed to connect:", error);
    _db = null;
    _sql = null;
  }
  return _db;
}

// ========== USER MANAGEMENT ==========

/** Garante que a coluna mustChangePassword existe (para migrações ainda não aplicadas). */
export async function ensureMustChangePasswordColumn(): Promise<void> {
  const database = await getDb();
  if (!database) return;
  await database.execute(
    sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mustChangePassword" boolean DEFAULT false NOT NULL`
  );
}

export async function createUser(user: InsertUser): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [row] = await db
    .insert(users)
    .values({ ...user, updatedAt: new Date(), lastSignedIn: new Date() })
    .returning({ id: users.id });
  if (!row) throw new Error("Failed to create user");
  return row.id;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  } catch (error) {
    if (!isMissingIsActiveColumnError(error) || !_sql) throw error;
    const fallback = await _sql`
      select
        "id",
        "name",
        "email",
        "passwordHash",
        false as "mustChangePassword",
        "role",
        true as "isActive",
        "createdAt",
        "updatedAt",
        "lastSignedIn"
      from "users"
      where "email" = ${email}
      limit 1
    `;
    return fallback[0] as typeof users.$inferSelect | undefined;
  }
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return result[0];
  } catch (error) {
    if (!isMissingIsActiveColumnError(error) || !_sql) throw error;
    const fallback = await _sql`
      select
        "id",
        "name",
        "email",
        "passwordHash",
        false as "mustChangePassword",
        "role",
        true as "isActive",
        "createdAt",
        "updatedAt",
        "lastSignedIn"
      from "users"
      where "id" = ${userId}
      limit 1
    `;
    return fallback[0] as typeof users.$inferSelect | undefined;
  }
}

export async function createSession(data: {
  userId: number;
  token: string;
  expiresAt: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(sessions).values(data);
}

export async function deleteSession(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(sessions).where(eq(sessions.token, token));
}

export async function deleteSessionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

export async function getUserBySessionToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  const [session] = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) return null;

  const user = await getUserById(session.userId);
  if (!user) return null;
  if (!user.isActive) return null;
  return user;
}

function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function createPasswordResetTokenForUser(userId: number, ttlMinutes = 60): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = sha256Hex(rawToken);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  await db.insert(passwordResetTokens).values({
    userId,
    tokenHash,
    expiresAt,
  });

  return rawToken;
}

export async function createPasswordResetTokenByEmail(email: string, ttlMinutes = 60): Promise<string | null> {
  const user = await getUserByEmail(email.trim().toLowerCase());
  if (!user) return null;
  if (!user.isActive) return null;
  return await createPasswordResetTokenForUser(user.id, ttlMinutes);
}

export async function consumePasswordResetToken(rawToken: string, passwordHash: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const tokenHash = sha256Hex(rawToken);
  const now = new Date();

  const [tokenRow] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, now)
      )
    )
    .limit(1);

  if (!tokenRow) return false;

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        passwordHash,
        mustChangePassword: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, tokenRow.userId));

    await tx
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, tokenRow.id));

    await tx.delete(sessions).where(eq(sessions.userId, tokenRow.userId));
  });

  return true;
}

export async function listUsersForAdmin() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        lastSignedIn: users.lastSignedIn,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
  } catch (error) {
    if (!isMissingIsActiveColumnError(error) || !_sql) throw error;
    return (await _sql`
      select
        "id",
        "name",
        "email",
        "role",
        true as "isActive",
        "createdAt",
        "lastSignedIn"
      from "users"
      order by "createdAt" desc
    `) as {
      id: number;
      name: string | null;
      email: string;
      role: "user" | "admin";
      isActive: boolean;
      createdAt: Date;
      lastSignedIn: Date;
    }[];
  }
}

export async function setUserAccess(userId: number, isActive: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  if (!isActive) {
    await deleteSessionsByUserId(userId);
  }
}

export async function setUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function updateUserProfileName(userId: number, name: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({
      name,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function updateUserProfileAvatarUrl(userId: number, avatarUrl: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({
      avatarUrl,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function updateUserPasswordHash(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({
      passwordHash,
      mustChangePassword: false,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  await deleteSessionsByUserId(userId);
}

/** Define senha inicial e exige troca no próximo acesso (ex.: reenvio de e-mail de boas-vindas). */
export async function setInitialPasswordForUser(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({
      passwordHash,
      mustChangePassword: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  await deleteSessionsByUserId(userId);
}

/** Remove o usuário e todos os dados associados (sessões, progresso, MAPA, etc.). */
export async function deleteUser(userId: number): Promise<void> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  await database.delete(contentScripts).where(eq(contentScripts.userId, userId));
  await database.delete(contentIdeas).where(eq(contentIdeas.userId, userId));
  await database.delete(mapaTemas).where(eq(mapaTemas.userId, userId));
  await database.delete(mapaEditoriais).where(eq(mapaEditoriais.userId, userId));
  await database.delete(raioX).where(eq(raioX.userId, userId));
  await database.delete(lessonUserState).where(eq(lessonUserState.userId, userId));
  await database.delete(lessonProgress).where(eq(lessonProgress.userId, userId));
  await database.delete(moduleProgress).where(eq(moduleProgress.userId, userId));
  await database.delete(submissions).where(eq(submissions.userId, userId));
  await database.delete(userBadges).where(eq(userBadges.userId, userId));
  await database.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  await database.delete(sessions).where(eq(sessions.userId, userId));
  await database.delete(users).where(eq(users.id, userId));
}

/**
 * Cria ou atualiza usuário a partir do webhook Hotmart.
 * Se o email já existir, atualiza apenas o nome.
 * Caso contrário, cria com hash da senha inicial e marca troca obrigatória de senha.
 */
export async function upsertUserFromHotmart(
  email: string,
  name: string | null,
  placeholderPasswordHash: string
): Promise<{ userId: number; created: boolean }> {
  const existing = await getUserByEmail(email);
  if (existing) {
    await updateUserProfileName(existing.id, name);
    return { userId: existing.id, created: false };
  }
  const userId = await createUser({
    email,
    name: name ?? null,
    passwordHash: placeholderPasswordHash,
    mustChangePassword: true,
    role: "user",
    isActive: true,
  });
  return { userId, created: true };
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

/** Cria o módulo se não existir; retorna o módulo (existente ou recém-criado). */
export async function ensureModule(params: {
  slug: string;
  title: string;
  orderIndex: number;
  description?: string | null;
}): Promise<Module> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getModuleBySlug(params.slug);
  if (existing) return existing;

  const [row] = await db
    .insert(modules)
    .values({
      slug: params.slug,
      title: params.title,
      description: params.description ?? null,
      orderIndex: params.orderIndex,
      isActive: true,
    })
    .returning();
  if (!row) throw new Error("Failed to create module");
  return row as Module;
}

// ========== SECTIONS ==========

export async function getSectionsByModuleId(moduleId: number): Promise<Section[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(sections)
    .where(eq(sections.moduleId, moduleId))
    .orderBy(asc(sections.orderIndex), asc(sections.id));
}

// ========== LESSONS ==========

export async function getLessonsByModuleId(moduleId: number): Promise<Lesson[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(lessons)
    .where(and(eq(lessons.moduleId, moduleId), eq(lessons.isActive, true)))
    .orderBy(asc(lessons.orderIndex));
}

export async function ensureWorkspaceLessons(params: {
  moduleId: number;
  lessons: Array<{
    slug: string;
    title: string;
    orderIndex: number;
    description?: string | null;
  }>;
}): Promise<Lesson[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(lessons).where(eq(lessons.moduleId, params.moduleId));
  const existingBySlug = new Map(existing.map((l) => [l.slug, l]));

  const toInsert = params.lessons.filter((l) => !existingBySlug.has(l.slug));
  if (toInsert.length) {
    await db.insert(lessons).values(
      toInsert.map((l) => ({
        moduleId: params.moduleId,
        sectionId: null,
        slug: l.slug,
        title: l.title,
        description: l.description ?? null,
        contentType: "exercise" as const,
        content: null,
        contentHtmlRaw: null,
        contentBlocks: null,
        videoUrl: null,
        orderIndex: l.orderIndex,
        durationMinutes: null,
        isActive: true,
      }))
    );
  }

  // Retorna a lista atual (inclui as recém-criadas)
  return await getLessonsByModuleId(params.moduleId);
}

/** Remove todas as lições de um módulo (e os estados de usuário associados). Usado para substituir completamente as lições do Norte. */
export async function deleteModuleLessons(moduleId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.moduleId, moduleId));
  const lessonIds = existing.map((l) => l.id);
  if (lessonIds.length === 0) return;
  await db.delete(lessonUserState).where(inArray(lessonUserState.lessonId, lessonIds));
  await db.delete(lessons).where(eq(lessons.moduleId, moduleId));
}

export async function getLessonsByModuleIdForTree(moduleId: number): Promise<Lesson[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.moduleId, moduleId), eq(lessons.isActive, true)))
    .orderBy(asc(lessons.sectionId), asc(lessons.orderIndex), asc(lessons.id));
}

export async function getLessonById(lessonId: number): Promise<Lesson | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
  return result[0];
}

// ========== LESSON USER STATE (draft/completed) ==========

export async function getLessonUserState(userId: number, lessonId: number): Promise<LessonUserState | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(lessonUserState)
    .where(and(eq(lessonUserState.userId, userId), eq(lessonUserState.lessonId, lessonId)))
    .limit(1);
  return result[0] ?? null;
}

export async function upsertLessonUserDraft(params: {
  userId: number;
  lessonId: number;
  patch: Record<string, unknown>;
}): Promise<{ status: "draft" | "completed"; data: Record<string, unknown>; updatedAt: Date }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getLessonUserState(params.userId, params.lessonId);
  const nextData = {
    ...(existing?.data ?? {}),
    ...(params.patch ?? {}),
  };

  if (!existing) {
    const [row] = await db
      .insert(lessonUserState)
      .values({
        userId: params.userId,
        lessonId: params.lessonId,
        data: nextData,
        status: "draft",
        updatedAt: new Date(),
      })
      .returning({
        status: lessonUserState.status,
        data: lessonUserState.data,
        updatedAt: lessonUserState.updatedAt,
      });
    if (!row) throw new Error("Failed to create lesson user state");
    return row as any;
  }

  const [row] = await db
    .update(lessonUserState)
    .set({
      data: nextData,
      status: "draft",
      updatedAt: new Date(),
    })
    .where(eq(lessonUserState.id, existing.id))
    .returning({
      status: lessonUserState.status,
      data: lessonUserState.data,
      updatedAt: lessonUserState.updatedAt,
    });
  if (!row) throw new Error("Failed to update lesson user state");
  return row as any;
}

export async function completeLessonUserState(params: { userId: number; lessonId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [row] = await db
    .insert(lessonUserState)
    .values({
      userId: params.userId,
      lessonId: params.lessonId,
      data: {},
      status: "completed",
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [lessonUserState.userId, lessonUserState.lessonId],
      set: { status: "completed", updatedAt: new Date() },
    })
    .returning({
      status: lessonUserState.status,
      updatedAt: lessonUserState.updatedAt,
    });

  if (!row) throw new Error("Failed to complete lesson user state");
  return row;
}

export async function resetLessonUserState(params: { userId: number; lessonId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [row] = await db
    .insert(lessonUserState)
    .values({
      userId: params.userId,
      lessonId: params.lessonId,
      data: {},
      status: "draft",
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [lessonUserState.userId, lessonUserState.lessonId],
      set: { data: {}, status: "draft", updatedAt: new Date() },
    })
    .returning({
      status: lessonUserState.status,
      updatedAt: lessonUserState.updatedAt,
    });

  if (!row) throw new Error("Failed to reset lesson user state");
  return row;
}

/** Progresso do workspace: conta quantas lições do módulo estão com status "completed" em lessonUserState. */
export async function getWorkspaceProgressByModule(
  userId: number,
  moduleId: number
): Promise<{ completed: number; total: number; percentage: number }> {
  const db = await getDb();
  if (!db) return { completed: 0, total: 0, percentage: 0 };

  const moduleLessons = await getLessonsByModuleId(moduleId);
  const total = moduleLessons.length;
  if (total === 0) return { completed: 0, total: 0, percentage: 0 };

  const completedRows = await db
    .select({ lessonId: lessonUserState.lessonId })
    .from(lessonUserState)
    .where(
      and(
        eq(lessonUserState.userId, userId),
        eq(lessonUserState.status, "completed"),
        inArray(lessonUserState.lessonId, moduleLessons.map((l) => l.id))
      )
    );
  const completed = completedRows.length;
  const percentage = Math.round((completed / total) * 100);
  return { completed, total, percentage };
}

/** Retorna todos os lessonUserState do usuário para as lições indicadas (para montar PDF de todas as etapas). */
export async function getLessonUserStatesByLessonIds(
  userId: number,
  lessonIds: number[]
): Promise<LessonUserState[]> {
  const db = await getDb();
  if (!db) return [];
  if (lessonIds.length === 0) return [];

  return await db
    .select()
    .from(lessonUserState)
    .where(and(eq(lessonUserState.userId, userId), inArray(lessonUserState.lessonId, lessonIds)));
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
  
  const [row] = await db
    .insert(submissions)
    .values({
      userId: data.userId,
      exerciseId: data.exerciseId,
      answer: data.answer,
      fileUrl: data.fileUrl,
      status: "submitted",
    })
    .returning({ id: submissions.id });

  if (!row) throw new Error("Failed to create submission");
  return row.id;
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

export async function getLessonCountsByModuleIds(moduleIds: number[]): Promise<Record<number, number>> {
  const db = await getDb();
  if (!db || moduleIds.length === 0) return {};

  const rows = await db
    .select({
      moduleId: lessons.moduleId,
      lessonId: lessons.id,
    })
    .from(lessons)
    .where(and(inArray(lessons.moduleId, moduleIds), eq(lessons.isActive, true)));

  const counts: Record<number, number> = {};
  for (const row of rows) {
    counts[row.moduleId] = (counts[row.moduleId] ?? 0) + 1;
  }
  return counts;
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
  
  const [row] = await db
    .insert(contentIdeas)
    .values({
      ...idea,
      updatedAt: new Date(),
    })
    .returning({ id: contentIdeas.id });
  if (!row) throw new Error("Failed to create content idea");
  return row.id;
}

/**
 * Listar ideias de conteúdo do usuário
 */
export async function listContentIdeas(userId: number, filters?: {
  funnel?: "c1" | "c2" | "c3";
  format?: string;
  theme?: string;
  themeId?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(contentIdeas.userId, userId)];
  
  if (filters?.funnel) {
    conditions.push(eq(contentIdeas.funnel, filters.funnel));
  }
  if (filters?.themeId != null) {
    conditions.push(eq(contentIdeas.themeId, filters.themeId));
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
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(contentIdeas.id, id), eq(contentIdeas.userId, userId)));
}

// ========== MAPA - Editoriais e Temas ==========

export async function listMapaEditoriais(userId: number): Promise<MapEditorial[]> {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(mapaEditoriais)
    .where(eq(mapaEditoriais.userId, userId))
    .orderBy(asc(mapaEditoriais.orderIndex), asc(mapaEditoriais.id));
}

export async function createMapaEditorial(userId: number, data: { name: string; whyExplore?: string | null; context?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [row] = await db
    .insert(mapaEditoriais)
    .values({
      userId,
      name: data.name,
      whyExplore: data.whyExplore ?? null,
      context: data.context ?? null,
      orderIndex: 0,
      updatedAt: new Date(),
    })
    .returning({ id: mapaEditoriais.id });
  if (!row) throw new Error("Failed to create editorial");
  return row.id;
}

export async function updateMapaEditorial(id: number, userId: number, data: { name?: string; whyExplore?: string | null; context?: string | null; orderIndex?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(mapaEditoriais)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(mapaEditoriais.id, id), eq(mapaEditoriais.userId, userId)));
}

export async function deleteMapaEditorial(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(mapaEditoriais)
    .where(and(eq(mapaEditoriais.id, id), eq(mapaEditoriais.userId, userId)));
}

/** Progresso do MAPA (Estrutura de Conteúdo): 25% editoriais, 25% temas, 25% temas por editoria, 25% ideias. */
export async function getMapaProgressPercentage(userId: number): Promise<number> {
  const [ed, tem, ideias] = await Promise.all([
    listMapaEditoriais(userId),
    listMapaTemas(userId),
    listContentIdeas(userId),
  ]);
  let p = 0;
  if (ed.length > 0) p += 25;
  if (tem.length > 0) p += 25;
  const editoriaisComTemas = ed.some((e) => tem.some((t) => t.editorialId === e.id));
  if (editoriaisComTemas) p += 25;
  if (ideias.length > 0) p += 25;
  return p;
}

export async function listMapaTemas(userId: number, editorialId?: number): Promise<MapTema[]> {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(mapaTemas.userId, userId)];
  if (editorialId != null) conditions.push(eq(mapaTemas.editorialId, editorialId));
  return await db
    .select()
    .from(mapaTemas)
    .where(and(...conditions))
    .orderBy(asc(mapaTemas.orderIndex), asc(mapaTemas.id));
}

export async function createMapaTema(userId: number, data: { editorialId: number; name: string; context?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [row] = await db
    .insert(mapaTemas)
    .values({
      userId,
      editorialId: data.editorialId,
      name: data.name,
      context: data.context ?? null,
      orderIndex: 0,
      updatedAt: new Date(),
    })
    .returning({ id: mapaTemas.id });
  if (!row) throw new Error("Failed to create tema");
  return row.id;
}

export async function updateMapaTema(id: number, userId: number, data: { editorialId?: number; name?: string; context?: string | null; orderIndex?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(mapaTemas)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(mapaTemas.id, id), eq(mapaTemas.userId, userId)));
}

export async function deleteMapaTema(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(mapaTemas)
    .where(and(eq(mapaTemas.id, id), eq(mapaTemas.userId, userId)));
}

/**
 * Criar roteiro para uma ideia
 */
export async function createContentScript(script: InsertContentScript) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [row] = await db
    .insert(contentScripts)
    .values({
      ...script,
      updatedAt: new Date(),
    })
    .returning({ id: contentScripts.id });
  if (!row) throw new Error("Failed to create content script");
  return row.id;
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
    .set({ ...data, updatedAt: new Date() })
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

// ========== RAIO-X ==========

/** Postgres code for "undefined column" (coluna não existe). */
function isMissingColumnError(err: unknown): boolean {
  const code = (err as { cause?: { code?: string } })?.cause?.code;
  return code === "42703";
}

type RaioXFallbackRow = {
  id: number;
  userId: number;
  version: string;
  secao_redes_sociais: unknown;
  secao_web: unknown;
  secao_analise: unknown;
  progresso_geral: number | null;
  concluido: boolean | null;
  norte_completo: boolean | null;
  norte_data: unknown;
  createdAt: Date;
  updatedAt: Date;
};

/** Fallback quando a coluna etapas_concluidas ainda não existe (migration não aplicada). */
async function getRaioXByUserIdFallback(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  userId: number
): Promise<RaioX | undefined> {
  const result = await db.execute<RaioXFallbackRow>(
    sql`SELECT id, "userId", version, secao_redes_sociais, secao_web, secao_analise, progresso_geral, concluido, norte_completo, norte_data, "createdAt", "updatedAt" FROM raio_x WHERE "userId" = ${userId} LIMIT 1`
  );
  const rows = Array.isArray(result) ? result : (result as { rows?: RaioXFallbackRow[] })?.rows ?? [];
  const row: RaioXFallbackRow | undefined = rows[0];
  if (!row) return undefined;
  return {
    id: row.id,
    userId: row.userId,
    version: row.version,
    secaoRedesSociais: row.secao_redes_sociais ?? undefined,
    secaoWeb: row.secao_web ?? undefined,
    secaoAnalise: row.secao_analise ?? undefined,
    etapasConcluidas: [],
    progressoGeral: row.progresso_geral ?? 0,
    concluido: row.concluido ?? false,
    norteCompleto: row.norte_completo ?? false,
    norteData: row.norte_data ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  } as unknown as RaioX;
}

export async function getRaioXByUserId(userId: number): Promise<RaioX | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const result = await db.select().from(raioX).where(eq(raioX.userId, userId)).limit(1);
    return result[0];
  } catch (err) {
    if (isMissingColumnError(err)) {
      return getRaioXByUserIdFallback(db, userId);
    }
    throw err;
  }
}

export async function upsertRaioXSecao(
  userId: number,
  secao: "redes_sociais" | "web" | "analise",
  data: Record<string, unknown>
): Promise<{ updatedAt: Date }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const field =
    secao === "redes_sociais"
      ? { secaoRedesSociais: data }
      : secao === "web"
        ? { secaoWeb: data }
        : { secaoAnalise: data };
  const existing = await getRaioXByUserId(userId);
  const now = new Date();
  if (existing) {
    const [row] = await db
      .update(raioX)
      .set({ ...field, updatedAt: now })
      .where(eq(raioX.userId, userId))
      .returning({ updatedAt: raioX.updatedAt });
    return { updatedAt: row?.updatedAt ?? now };
  }
  const [row] = await db
    .insert(raioX).values({
      userId,
      version: "2.0.3",
      ...field,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ updatedAt: raioX.updatedAt });
  return { updatedAt: row?.updatedAt ?? now };
}

export async function updateRaioXProgress(userId: number, progresso: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(raioX)
    .set({ progressoGeral: progresso, updatedAt: new Date() })
    .where(eq(raioX.userId, userId));
}

export async function setRaioXConcluido(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(raioX)
    .set({ concluido: true, progressoGeral: 100, updatedAt: new Date() })
    .where(eq(raioX.userId, userId));
}

const RAIO_X_SECOES = ["redes_sociais", "web", "analise"] as const;

export async function concluirEtapaRaioX(
  userId: number,
  secao: "redes_sociais" | "web" | "analise"
): Promise<{ updatedAt: Date; etapasConcluidas: string[] }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const row = await getRaioXByUserId(userId);
  if (!row) throw new Error("Raio-X não encontrado");
  const current = (row as { etapasConcluidas?: string[] }).etapasConcluidas;
  const arr = Array.isArray(current) ? [...current] : [];
  if (!arr.includes(secao)) arr.push(secao);
  const progressoGeral = Math.round((arr.length / RAIO_X_SECOES.length) * 100);
  const now = new Date();

  const runUpdate = async () => {
    const [updated] = await db
      .update(raioX)
      .set({
        etapasConcluidas: arr,
        progressoGeral,
        updatedAt: now,
      })
      .where(eq(raioX.userId, userId))
      .returning({ updatedAt: raioX.updatedAt, etapasConcluidas: raioX.etapasConcluidas });
    return updated;
  };

  try {
    const updated = await runUpdate();
    return {
      updatedAt: updated?.updatedAt ?? now,
      etapasConcluidas: (updated?.etapasConcluidas as string[]) ?? arr,
    };
  } catch (err) {
    if (isMissingColumnError(err)) {
      await db.execute(sql`ALTER TABLE "raio_x" ADD COLUMN IF NOT EXISTS "etapas_concluidas" jsonb DEFAULT '[]'::jsonb`);
      const updated = await runUpdate();
      return {
        updatedAt: updated?.updatedAt ?? now,
        etapasConcluidas: (updated?.etapasConcluidas as string[]) ?? arr,
      };
    }
    throw err;
  }
}

export async function createRaioXIfNotExists(userId: number, norteCompleto: boolean, norteData: Record<string, unknown> | null): Promise<RaioX> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getRaioXByUserId(userId);
  if (existing) return existing;
  const now = new Date();
  const [row] = await db
    .insert(raioX)
    .values({
      userId,
      version: "2.0.3",
      progressoGeral: 0,
      concluido: false,
      norteCompleto,
      norteData,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  if (!row) throw new Error("Failed to create raio_x");
  return row;
}
