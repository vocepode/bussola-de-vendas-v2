import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * Módulos do Método COMPASS (NORTE, RAIO-X, MAPA, ROTA, etc)
 */
export const modules = mysqlTable("modules", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }), // lucide icon name
  color: varchar("color", { length: 50 }), // cor do gradiente
  orderIndex: int("orderIndex").notNull(),
  prerequisiteModuleId: int("prerequisiteModuleId"), // módulo que deve ser concluído antes
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Lições dentro de cada módulo
 */
export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  moduleId: int("moduleId").notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  contentType: mysqlEnum("contentType", ["text", "video", "exercise", "checklist", "template"]).notNull(),
  content: text("content"), // HTML, markdown ou JSON
  videoUrl: varchar("videoUrl", { length: 500 }), // YouTube/Vimeo embed
  orderIndex: int("orderIndex").notNull(),
  durationMinutes: int("durationMinutes"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Exercícios práticos
 */
export const exercises = mysqlTable("exercises", {
  id: int("id").autoincrement().primaryKey(),
  lessonId: int("lessonId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  instructions: text("instructions"),
  exerciseType: mysqlEnum("exerciseType", ["text", "multiple_choice", "file_upload", "checklist"]).notNull(),
  config: json("config").$type<{
    options?: string[]; // para múltipla escolha
    correctAnswer?: string | number; // para validação automática
    acceptedFileTypes?: string[]; // para upload
    checklistItems?: string[]; // para checklist
    maxWords?: number; // para texto livre
  }>(),
  points: int("points").default(10).notNull(),
  isRequired: boolean("isRequired").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Respostas dos alunos aos exercícios
 */
export const submissions = mysqlTable("submissions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  exerciseId: int("exerciseId").notNull(),
  answer: text("answer"), // texto ou JSON
  fileUrl: varchar("fileUrl", { length: 500 }), // para uploads
  status: mysqlEnum("status", ["draft", "submitted", "reviewed", "approved"]).default("submitted").notNull(),
  score: int("score"),
  feedback: text("feedback"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
});

/**
 * Progresso do aluno em cada lição
 */
export const lessonProgress = mysqlTable("lessonProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  lessonId: int("lessonId").notNull(),
  status: mysqlEnum("status", ["not_started", "in_progress", "completed"]).default("not_started").notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  timeSpentMinutes: int("timeSpentMinutes").default(0),
});

/**
 * Progresso do aluno em cada módulo
 */
export const moduleProgress = mysqlTable("moduleProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  moduleId: int("moduleId").notNull(),
  status: mysqlEnum("status", ["locked", "in_progress", "completed"]).default("locked").notNull(),
  progressPercentage: int("progressPercentage").default(0).notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
});

/**
 * Badges e conquistas
 */
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }), // lucide icon name
  color: varchar("color", { length: 50 }),
  criteria: json("criteria").$type<{
    type: "module_complete" | "all_exercises" | "streak" | "speed";
    moduleId?: number;
    value?: number;
  }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Badges conquistados pelos alunos
 */
export const userBadges = mysqlTable("userBadges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  badgeId: int("badgeId").notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

/**
 * Recursos complementares (templates, links, ferramentas)
 */
export const resources = mysqlTable("resources", {
  id: int("id").autoincrement().primaryKey(),
  moduleId: int("moduleId"), // null = recurso geral
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  resourceType: mysqlEnum("resourceType", ["template", "link", "document", "tool"]).notNull(),
  url: varchar("url", { length: 500 }),
  fileUrl: varchar("fileUrl", { length: 500 }),
  orderIndex: int("orderIndex").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Relations
export const modulesRelations = relations(modules, ({ many, one }) => ({
  lessons: many(lessons),
  prerequisite: one(modules, {
    fields: [modules.prerequisiteModuleId],
    references: [modules.id],
  }),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
  exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [exercises.lessonId],
    references: [lessons.id],
  }),
  submissions: many(submissions),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  user: one(users, {
    fields: [submissions.userId],
    references: [users.id],
  }),
  exercise: one(exercises, {
    fields: [submissions.exerciseId],
    references: [exercises.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Module = typeof modules.$inferSelect;
export type InsertModule = typeof modules.$inferInsert;
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = typeof exercises.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type ModuleProgress = typeof moduleProgress.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type Resource = typeof resources.$inferSelect;
