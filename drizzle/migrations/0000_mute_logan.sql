CREATE TYPE "public"."badge_criteria_type" AS ENUM('module_complete', 'all_exercises', 'streak', 'speed');--> statement-breakpoint
CREATE TYPE "public"."content_idea_format" AS ENUM('video_curto', 'video', 'carrossel', 'imagem', 'estatico', 'live', 'stories');--> statement-breakpoint
CREATE TYPE "public"."content_idea_funnel" AS ENUM('c1', 'c2', 'c3');--> statement-breakpoint
CREATE TYPE "public"."content_idea_topic" AS ENUM('dicas', 'principais_desejos', 'perguntas_comuns', 'mitos', 'historias', 'erros_comuns', 'feedbacks', 'diferencial_marca', 'nossos_produtos');--> statement-breakpoint
CREATE TYPE "public"."content_script_funnel_goal" AS ENUM('seguidores', 'branding', 'leads', 'venda', 'autoridade', 'quebrar_objecao', 'inspirar', 'gerar_leads', 'prova_social');--> statement-breakpoint
CREATE TYPE "public"."content_script_progress_status" AS ENUM('ideia', 'a_fazer', 'planejando_roteiro', 'gravacao', 'design', 'aprovacao', 'programado', 'publicado');--> statement-breakpoint
CREATE TYPE "public"."content_script_strategy" AS ENUM('vendas', 'atracao', 'autoridade', 'branding');--> statement-breakpoint
CREATE TYPE "public"."exercise_type" AS ENUM('text', 'multiple_choice', 'file_upload', 'checklist');--> statement-breakpoint
CREATE TYPE "public"."lesson_content_type" AS ENUM('text', 'video', 'exercise', 'checklist', 'template');--> statement-breakpoint
CREATE TYPE "public"."lesson_progress_status" AS ENUM('not_started', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."module_progress_status" AS ENUM('locked', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('template', 'link', 'document', 'tool');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('draft', 'submitted', 'reviewed', 'approved');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"icon" varchar(100),
	"color" varchar(50),
	"criteria" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "badges_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contentIdeas" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"title" varchar(500) NOT NULL,
	"theme" varchar(255),
	"topic" "content_idea_topic" NOT NULL,
	"funnel" "content_idea_funnel" NOT NULL,
	"format" "content_idea_format" NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contentScripts" (
	"id" serial PRIMARY KEY NOT NULL,
	"contentIdeaId" integer NOT NULL,
	"userId" integer NOT NULL,
	"deadlinePlanning" timestamp with time zone,
	"strategy" "content_script_strategy",
	"ladderingAttributes" jsonb,
	"ladderingFunctionalBenefits" jsonb,
	"ladderingEmotionalBenefits" jsonb,
	"funnelGoal" "content_script_funnel_goal",
	"progressStatus" "content_script_progress_status" DEFAULT 'ideia' NOT NULL,
	"platforms" jsonb,
	"deadlineContent" timestamp with time zone,
	"postDate" timestamp with time zone,
	"postLink" varchar(500),
	"scriptFields" jsonb,
	"evaluationGood" text,
	"evaluationBad" text,
	"references" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"lessonId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"instructions" text,
	"exerciseType" "exercise_type" NOT NULL,
	"config" jsonb,
	"points" integer DEFAULT 10 NOT NULL,
	"isRequired" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessonProgress" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"lessonId" integer NOT NULL,
	"status" "lesson_progress_status" DEFAULT 'not_started' NOT NULL,
	"startedAt" timestamp with time zone,
	"completedAt" timestamp with time zone,
	"timeSpentMinutes" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"moduleId" integer NOT NULL,
	"slug" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"contentType" "lesson_content_type" NOT NULL,
	"content" text,
	"videoUrl" varchar(500),
	"orderIndex" integer NOT NULL,
	"durationMinutes" integer,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moduleProgress" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"moduleId" integer NOT NULL,
	"status" "module_progress_status" DEFAULT 'locked' NOT NULL,
	"progressPercentage" integer DEFAULT 0 NOT NULL,
	"startedAt" timestamp with time zone,
	"completedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"icon" varchar(100),
	"color" varchar(50),
	"orderIndex" integer NOT NULL,
	"prerequisiteModuleId" integer,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "modules_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"moduleId" integer,
	"title" varchar(255) NOT NULL,
	"description" text,
	"resourceType" "resource_type" NOT NULL,
	"url" varchar(500),
	"fileUrl" varchar(500),
	"orderIndex" integer NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" varchar(255) NOT NULL,
	"userId" integer NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"exerciseId" integer NOT NULL,
	"answer" text,
	"fileUrl" varchar(500),
	"status" "submission_status" DEFAULT 'submitted' NOT NULL,
	"score" integer,
	"feedback" text,
	"submittedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "userBadges" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"badgeId" integer NOT NULL,
	"earnedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"email" varchar(320) NOT NULL,
	"passwordHash" text NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
