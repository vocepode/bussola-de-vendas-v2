CREATE TABLE "mapa_editoriais" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"whyExplore" text,
	"context" text,
	"orderIndex" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mapa_temas" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"editorialId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"context" text,
	"orderIndex" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contentIdeas" ALTER COLUMN "format" SET DEFAULT 'estatico';--> statement-breakpoint
ALTER TABLE "contentIdeas" ALTER COLUMN "format" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "contentIdeas" ADD COLUMN "themeId" integer;--> statement-breakpoint
ALTER TABLE "raio_x" ADD COLUMN "etapas_concluidas" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "contentIdeas" ADD CONSTRAINT "contentIdeas_themeId_mapa_temas_id_fk" FOREIGN KEY ("themeId") REFERENCES "public"."mapa_temas"("id") ON DELETE no action ON UPDATE no action;