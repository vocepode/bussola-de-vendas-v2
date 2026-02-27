-- Etapas concluídas do Raio-X: array de "redes_sociais" | "web" | "analise". Progresso = (length/3)*100.
ALTER TABLE "raio_x" ADD COLUMN IF NOT EXISTS "etapas_concluidas" jsonb DEFAULT '[]'::jsonb;
