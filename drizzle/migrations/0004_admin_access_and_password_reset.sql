ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true NOT NULL;

CREATE TABLE IF NOT EXISTS "passwordResetTokens" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "tokenHash" varchar(64) NOT NULL,
  "expiresAt" timestamp with time zone NOT NULL,
  "usedAt" timestamp with time zone,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "passwordResetTokens_tokenHash_unique" UNIQUE("tokenHash")
);
