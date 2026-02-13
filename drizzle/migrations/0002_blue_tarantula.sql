CREATE TYPE "public"."lesson_user_state_status" AS ENUM('draft', 'completed');--> statement-breakpoint
CREATE TABLE "lessonUserState" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"lessonId" integer NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "lesson_user_state_status" DEFAULT 'draft' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
