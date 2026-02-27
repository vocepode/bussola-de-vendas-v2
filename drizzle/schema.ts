import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const userRole = pgEnum("user_role", ["user", "admin"]);
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  mustChangePassword: boolean("mustChangePassword").default(false).notNull(),
  role: userRole("role").default("user").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  avatarUrl: varchar("avatarUrl", { length: 512 }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  userId: integer("userId").notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Tokens temporários para recuperação de senha.
 * O token bruto nunca é salvo; persistimos apenas hash SHA-256.
 */
export const passwordResetTokens = pgTable("passwordResetTokens", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  tokenHash: varchar("tokenHash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  usedAt: timestamp("usedAt", { withTimezone: true }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Estado/respostas do aluno por etapa (lição).
 * Usado para auto-save (rascunho), conclusão e reset.
 */
export const lessonUserStateStatus = pgEnum("lesson_user_state_status", ["draft", "completed"]);
export const lessonUserState = pgTable(
  "lessonUserState",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    lessonId: integer("lessonId").notNull(),
    data: jsonb("data").$type<Record<string, unknown>>().default({}).notNull(),
    status: lessonUserStateStatus("status").default("draft").notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userLessonUnique: uniqueIndex("lesson_user_state_user_lesson_unique").on(t.userId, t.lessonId),
  })
);

/**
 * Módulos do Método COMPASS (NORTE, RAIO-X, MAPA, ROTA, etc)
 */
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }), // lucide icon name
  color: varchar("color", { length: 50 }), // cor do gradiente
  orderIndex: integer("orderIndex").notNull(),
  prerequisiteModuleId: integer("prerequisiteModuleId"), // módulo que deve ser concluído antes
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Seções (multi-nível) dentro de um módulo, derivadas do export (árvore de pastas).
 *
 * `pathKey` deve ser estável e único por módulo (ex.: "raio-x/1-redes-sociais/3-analise").
 */
export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  moduleId: integer("moduleId").notNull(),
  parentSectionId: integer("parentSectionId"),
  slug: varchar("slug", { length: 160 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  orderIndex: integer("orderIndex").notNull(),
  pathKey: varchar("pathKey", { length: 500 }).notNull().unique(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Lições dentro de cada módulo
 */
export const lessonContentType = pgEnum("lesson_content_type", [
  "text",
  "video",
  "exercise",
  "checklist",
  "template",
]);
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  moduleId: integer("moduleId").notNull(),
  sectionId: integer("sectionId"),
  slug: varchar("slug", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  contentType: lessonContentType("contentType").notNull(),
  content: text("content"), // legado: HTML importado (mantido por compatibilidade)
  contentHtmlRaw: text("contentHtmlRaw"), // auditoria/fallback do HTML original
  contentBlocks: jsonb("contentBlocks").$type<
    | {
        type:
          | "heading"
          | "paragraph"
          | "list"
          | "callout"
          | "divider"
          | "image"
          | "quote"
          | "table"
          | "code"
          | "embed";
        // campos específicos por tipo são flexíveis na 1ª versão
        [key: string]: unknown;
      }[]
    | null
  >(),
  videoUrl: varchar("videoUrl", { length: 500 }), // YouTube/Vimeo embed
  orderIndex: integer("orderIndex").notNull(),
  durationMinutes: integer("durationMinutes"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Exercícios práticos
 */
export const exerciseTypeEnum = pgEnum("exercise_type", [
  "text",
  "multiple_choice",
  "file_upload",
  "checklist",
]);
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  lessonId: integer("lessonId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  instructions: text("instructions"),
  exerciseType: exerciseTypeEnum("exerciseType").notNull(),
  config: jsonb("config").$type<{
    options?: string[]; // para múltipla escolha
    correctAnswer?: string | number; // para validação automática
    acceptedFileTypes?: string[]; // para upload
    checklistItems?: string[]; // para checklist
    maxWords?: number; // para texto livre
  }>(),
  points: integer("points").default(10).notNull(),
  isRequired: boolean("isRequired").default(true).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Respostas dos alunos aos exercícios
 */
export const submissionStatus = pgEnum("submission_status", [
  "draft",
  "submitted",
  "reviewed",
  "approved",
]);
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  exerciseId: integer("exerciseId").notNull(),
  answer: text("answer"), // texto ou JSON
  fileUrl: varchar("fileUrl", { length: 500 }), // para uploads
  status: submissionStatus("status").default("submitted").notNull(),
  score: integer("score"),
  feedback: text("feedback"),
  submittedAt: timestamp("submittedAt", { withTimezone: true }).defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt", { withTimezone: true }),
});

/**
 * Progresso do aluno em cada lição
 */
export const lessonProgressStatus = pgEnum("lesson_progress_status", [
  "not_started",
  "in_progress",
  "completed",
]);
export const lessonProgress = pgTable("lessonProgress", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  lessonId: integer("lessonId").notNull(),
  status: lessonProgressStatus("status").default("not_started").notNull(),
  startedAt: timestamp("startedAt", { withTimezone: true }),
  completedAt: timestamp("completedAt", { withTimezone: true }),
  timeSpentMinutes: integer("timeSpentMinutes").default(0),
});

/**
 * Progresso do aluno em cada módulo
 */
export const moduleProgressStatus = pgEnum("module_progress_status", [
  "locked",
  "in_progress",
  "completed",
]);
export const moduleProgress = pgTable("moduleProgress", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  moduleId: integer("moduleId").notNull(),
  status: moduleProgressStatus("status").default("locked").notNull(),
  progressPercentage: integer("progressPercentage").default(0).notNull(),
  startedAt: timestamp("startedAt", { withTimezone: true }),
  completedAt: timestamp("completedAt", { withTimezone: true }),
});

/**
 * Badges e conquistas
 */
export const badgeCriteriaType = pgEnum("badge_criteria_type", [
  "module_complete",
  "all_exercises",
  "streak",
  "speed",
]);
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }), // lucide icon name
  color: varchar("color", { length: 50 }),
  criteria: jsonb("criteria").$type<{
    type: "module_complete" | "all_exercises" | "streak" | "speed";
    moduleId?: number;
    value?: number;
  }>(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Badges conquistados pelos alunos
 */
export const userBadges = pgTable("userBadges", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  badgeId: integer("badgeId").notNull(),
  earnedAt: timestamp("earnedAt", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Recursos complementares (templates, links, ferramentas)
 */
export const resourceTypeEnum = pgEnum("resource_type", [
  "template",
  "link",
  "document",
  "tool",
]);
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  moduleId: integer("moduleId"), // null = recurso geral
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  resourceType: resourceTypeEnum("resourceType").notNull(),
  url: varchar("url", { length: 500 }),
  fileUrl: varchar("fileUrl", { length: 500 }),
  orderIndex: integer("orderIndex").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * MAPA - Estrutura de Conteúdo: Editoriais (por usuário)
 */
export const mapaEditoriais = pgTable("mapa_editoriais", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  whyExplore: text("whyExplore"),
  context: text("context"),
  orderIndex: integer("orderIndex").notNull().default(0),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * MAPA - Estrutura de Conteúdo: Temas (por usuário, ligados a uma editoria)
 */
export const mapaTemas = pgTable("mapa_temas", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  editorialId: integer("editorialId").notNull().references(() => mapaEditoriais.id),
  name: varchar("name", { length: 255 }).notNull(),
  context: text("context"),
  orderIndex: integer("orderIndex").notNull().default(0),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Ideias de Conteúdo (MAPA - Matriz de Conteúdo)
 * Cada ideia representa um conteúdo que será criado
 */
export const contentIdeaTopic = pgEnum("content_idea_topic", [
    "dicas",
    "principais_desejos",
    "perguntas_comuns",
    "mitos",
    "historias",
    "erros_comuns",
    "feedbacks",
    "diferencial_marca",
    "nossos_produtos"
  ]);
export const contentIdeaFunnel = pgEnum("content_idea_funnel", ["c1", "c2", "c3"]);
export const contentIdeaFormat = pgEnum("content_idea_format", [
  "video_curto",
  "video",
  "carrossel",
  "imagem",
  "estatico",
  "live",
  "stories",
]);
export const contentIdeas = pgTable("contentIdeas", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  title: varchar("title", { length: 500 }).notNull(), // título da ideia de conteúdo
  theme: varchar("theme", { length: 255 }), // legado; preferir themeId
  themeId: integer("themeId").references(() => mapaTemas.id), // FK → mapa_temas (Estrutura de Conteúdo)
  topic: contentIdeaTopic("topic").notNull(), // tópico de conteúdo
  funnel: contentIdeaFunnel("funnel").notNull(), // C1-Topo, C2-Meio, C3-Fundo
  format: contentIdeaFormat("format").default("estatico"), // opcional na Estrutura; preenchido na Matriz
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Roteiros de Conteúdo (ligados às Ideias)
 * Cada roteiro tem campos dinâmicos baseados no formato
 */
export const contentScriptStrategy = pgEnum("content_script_strategy", [
  "vendas",
  "atracao",
  "autoridade",
  "branding",
]);
export const contentScriptFunnelGoal = pgEnum("content_script_funnel_goal", [
  "seguidores",
  "branding",
  "leads",
  "venda",
  "autoridade",
  "quebrar_objecao",
  "inspirar",
  "gerar_leads",
  "prova_social",
]);
export const contentScriptProgressStatus = pgEnum("content_script_progress_status", [
  "ideia",
  "a_fazer",
  "planejando_roteiro",
  "gravacao",
  "design",
  "aprovacao",
  "programado",
  "publicado",
]);
export const contentScripts = pgTable("contentScripts", {
  id: serial("id").primaryKey(),
  contentIdeaId: integer("contentIdeaId").notNull(),
  userId: integer("userId").notNull(),
  
  // Metadados do roteiro
  deadlinePlanning: timestamp("deadlinePlanning", { withTimezone: true }), // deadline do planejamento
  strategy: contentScriptStrategy("strategy"), // estratégia
  
  // Integração com Laddering (NORTE)
  ladderingAttributes: jsonb("ladderingAttributes").$type<string[]>(), // atributos selecionados
  ladderingFunctionalBenefits: jsonb("ladderingFunctionalBenefits").$type<string[]>(), // benefícios funcionais
  ladderingEmotionalBenefits: jsonb("ladderingEmotionalBenefits").$type<string[]>(), // benefícios emocionais
  
  // Meta e progresso
  funnelGoal: contentScriptFunnelGoal("funnelGoal"),
  progressStatus: contentScriptProgressStatus("progressStatus").default("ideia").notNull(),
  
  // Plataformas e datas
  platforms: jsonb("platforms").$type<string[]>(), // ["instagram", "tiktok", "youtube", "linkedin", "facebook"]
  deadlineContent: timestamp("deadlineContent", { withTimezone: true }), // deadline do conteúdo
  postDate: timestamp("postDate", { withTimezone: true }), // data de publicação
  postLink: varchar("postLink", { length: 500 }), // link do post publicado
  
  // Campos dinâmicos do roteiro (JSON flexível baseado no formato)
  scriptFields: jsonb("scriptFields").$type<{
    // Para VÍDEO
    capa?: string;
    headline?: string;
    gancho?: string;
    conteudo?: string;
    fechamento?: string;
    legenda?: string;
    thumbUrl?: string;
    
    // Para CARROSSEL
    card1_capa?: string;
    card2_contracapa?: string;
    card3_gancho?: string;
    card4?: string;
    card5?: string;
    card6?: string;
    card7?: string;
    card8?: string;
    card9_transicao?: string;
    card10_fechamento?: string;
    
    // Para ESTÁTICO
    imagemDesign?: string;
    
    // Campos comuns
    objetivo?: string;
    tempoVideo?: string;
    sentimentos?: string[];
    quantidadeCards?: number;
  }>(),
  
  // Avaliação pós-publicação
  evaluationGood: text("evaluationGood"), // o que foi bom
  evaluationBad: text("evaluationBad"), // o que foi ruim
  references: text("references"), // referências usadas
  
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Estado do módulo Raio-X por usuário (um registro por usuário).
 * Pré-requisito: Norte 100% completo.
 */
export const raioX = pgTable(
  "raio_x",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull().unique(),
    version: text("version").notNull().default("2.0.3"),
    secaoRedesSociais: jsonb("secao_redes_sociais").$type<Record<string, unknown>>(),
    secaoWeb: jsonb("secao_web").$type<Record<string, unknown>>(),
    secaoAnalise: jsonb("secao_analise").$type<Record<string, unknown>>(),
    etapasConcluidas: jsonb("etapas_concluidas").$type<string[]>().default([]),
    progressoGeral: integer("progresso_geral").default(0),
    concluido: boolean("concluido").default(false),
    norteCompleto: boolean("norte_completo").default(false),
    norteData: jsonb("norte_data").$type<Record<string, unknown>>(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  }
);

// Relations
export const modulesRelations = relations(modules, ({ many, one }) => ({
  lessons: many(lessons),
  sections: many(sections),
  prerequisite: one(modules, {
    fields: [modules.prerequisiteModuleId],
    references: [modules.id],
  }),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  module: one(modules, {
    fields: [sections.moduleId],
    references: [modules.id],
  }),
  parent: one(sections, {
    fields: [sections.parentSectionId],
    references: [sections.id],
  }),
  children: many(sections),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
  section: one(sections, {
    fields: [lessons.sectionId],
    references: [sections.id],
  }),
  userState: many(lessonUserState),
  exercises: many(exercises),
}));

export const lessonUserStateRelations = relations(lessonUserState, ({ one }) => ({
  user: one(users, {
    fields: [lessonUserState.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [lessonUserState.lessonId],
    references: [lessons.id],
  }),
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

export const contentIdeasRelations = relations(contentIdeas, ({ one, many }) => ({
  user: one(users, {
    fields: [contentIdeas.userId],
    references: [users.id],
  }),
  theme: one(mapaTemas, {
    fields: [contentIdeas.themeId],
    references: [mapaTemas.id],
  }),
  scripts: many(contentScripts),
}));

export const contentScriptsRelations = relations(contentScripts, ({ one }) => ({
  contentIdea: one(contentIdeas, {
    fields: [contentScripts.contentIdeaId],
    references: [contentIdeas.id],
  }),
  user: one(users, {
    fields: [contentScripts.userId],
    references: [users.id],
  }),
}));

export const raioXRelations = relations(raioX, ({ one }) => ({
  user: one(users, {
    fields: [raioX.userId],
    references: [users.id],
  }),
}));

export const mapaEditoriaisRelations = relations(mapaEditoriais, ({ one, many }) => ({
  user: one(users, { fields: [mapaEditoriais.userId], references: [users.id] }),
  temas: many(mapaTemas),
}));

export const mapaTemasRelations = relations(mapaTemas, ({ one, many }) => ({
  user: one(users, { fields: [mapaTemas.userId], references: [users.id] }),
  editorial: one(mapaEditoriais, { fields: [mapaTemas.editorialId], references: [mapaEditoriais.id] }),
  contentIdeas: many(contentIdeas),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type InsertModule = typeof modules.$inferInsert;
export type Section = typeof sections.$inferSelect;
export type InsertSection = typeof sections.$inferInsert;
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;
export type LessonUserState = typeof lessonUserState.$inferSelect;
export type InsertLessonUserState = typeof lessonUserState.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = typeof exercises.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type ModuleProgress = typeof moduleProgress.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type Resource = typeof resources.$inferSelect;
export type ContentIdea = typeof contentIdeas.$inferSelect;
export type InsertContentIdea = typeof contentIdeas.$inferInsert;
export type ContentScript = typeof contentScripts.$inferSelect;
export type InsertContentScript = typeof contentScripts.$inferInsert;
export type RaioX = typeof raioX.$inferSelect;
export type InsertRaioX = typeof raioX.$inferInsert;
export type MapEditorial = typeof mapaEditoriais.$inferSelect;
export type InsertMapEditorial = typeof mapaEditoriais.$inferInsert;
export type MapTema = typeof mapaTemas.$inferSelect;
export type InsertMapTema = typeof mapaTemas.$inferInsert;
