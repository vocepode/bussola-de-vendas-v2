-- Adiciona coluna secao_analise (JSONB) à tabela raio_x para dashboard e prints da etapa Análise
ALTER TABLE "raio_x" ADD COLUMN IF NOT EXISTS "secao_analise" jsonb;
