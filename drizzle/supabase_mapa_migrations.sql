-- Migrações MAPA para rodar no SQL Editor do Supabase
-- Execute este arquivo uma vez no Supabase → SQL Editor → New query → Run

-- 1) Tabela de editoriais (MAPA)
CREATE TABLE IF NOT EXISTS "mapa_editoriais" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "name" varchar(255) NOT NULL,
  "whyExplore" text,
  "context" text,
  "orderIndex" integer DEFAULT 0 NOT NULL,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

-- 2) Tabela de temas (MAPA) – FK para editoriais é adicionada depois
CREATE TABLE IF NOT EXISTS "mapa_temas" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "editorialId" integer NOT NULL,
  "name" varchar(255) NOT NULL,
  "context" text,
  "orderIndex" integer DEFAULT 0 NOT NULL,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

-- 3) FK: temas → editoriais
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'mapa_temas_editorialId_mapa_editoriais_id_fk'
  ) THEN
    ALTER TABLE "mapa_temas"
    ADD CONSTRAINT "mapa_temas_editorialId_mapa_editoriais_id_fk"
    FOREIGN KEY ("editorialId") REFERENCES "public"."mapa_editoriais"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
  END IF;
END $$;

-- 4) Coluna themeId em contentIdeas (se a tabela existir e a coluna ainda não)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contentIdeas') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contentIdeas' AND column_name = 'themeId') THEN
      ALTER TABLE "contentIdeas" ADD COLUMN "themeId" integer;
      ALTER TABLE "contentIdeas" ADD CONSTRAINT "contentIdeas_themeId_mapa_temas_id_fk"
        FOREIGN KEY ("themeId") REFERENCES "public"."mapa_temas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
  END IF;
END $$;
