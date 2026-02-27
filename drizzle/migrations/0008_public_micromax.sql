CREATE TABLE IF NOT EXISTS "raio_x" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"version" text DEFAULT '2.0.3' NOT NULL,
	"secao_redes_sociais" jsonb,
	"secao_web" jsonb,
	"secao_analise" jsonb,
	"progresso_geral" integer DEFAULT 0,
	"concluido" boolean DEFAULT false,
	"norte_completo" boolean DEFAULT false,
	"norte_data" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "raio_x_userId_unique" UNIQUE("userId")
);
