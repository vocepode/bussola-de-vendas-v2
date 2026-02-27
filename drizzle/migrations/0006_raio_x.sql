CREATE TABLE IF NOT EXISTS "raio_x" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL UNIQUE,
  "version" text DEFAULT '2.0.3' NOT NULL,
  "secao_redes_sociais" jsonb,
  "secao_web" jsonb,
  "progresso_geral" integer DEFAULT 0,
  "concluido" boolean DEFAULT false,
  "norte_completo" boolean DEFAULT false,
  "norte_data" jsonb,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
