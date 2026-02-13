CREATE TABLE "sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"moduleId" integer NOT NULL,
	"parentSectionId" integer,
	"slug" varchar(160) NOT NULL,
	"title" varchar(255) NOT NULL,
	"orderIndex" integer NOT NULL,
	"pathKey" varchar(500) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sections_pathKey_unique" UNIQUE("pathKey")
);
--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "sectionId" integer;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "contentHtmlRaw" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "contentBlocks" jsonb;