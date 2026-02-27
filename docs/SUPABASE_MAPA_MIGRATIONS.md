# Atualizar o banco no Supabase (tabelas MAPA)

Para as editoriais e temas do MAPA funcionarem, o Supabase precisa das tabelas `mapa_editoriais` e `mapa_temas`. Duas formas de fazer:

---

## Opção 1: Pelo terminal (recomendado)

1. **Pegue a connection string do Supabase**
   - Acesse [Supabase Dashboard](https://supabase.com/dashboard) → seu projeto
   - **Project Settings** (ícone de engrenagem) → **Database**
   - Em **Connection string** escolha **URI** e copie a URL (modo **Session** ou **Transaction**)
   - Exemplo: `postgresql://postgres.[ref]:[SENHA]@aws-0-[regiao].pooler.supabase.com:6543/postgres`

2. **Configure no projeto**
   - No `.env` na raiz do projeto, defina (ou atualize):
   ```env
   DATABASE_URL="postgresql://postgres.[ref]:[SUA_SENHA]@aws-0-[regiao].pooler.supabase.com:6543/postgres"
   ```
   - Use a senha do banco (a que você definiu ao criar o projeto). Se precisar, em **Database** → **Database password** dá para redefinir.

3. **Rode as migrações**
   ```bash
   yarn db:push
   ```
   Isso aplica todas as migrações pendentes (incluindo `mapa_editoriais` e `mapa_temas`) no Supabase.

---

## Opção 2: Pelo SQL Editor do Supabase

Se preferir não usar o terminal ou não tiver a `DATABASE_URL` no `.env`:

1. Acesse **Supabase Dashboard** → seu projeto
2. Abra **SQL Editor** no menu lateral
3. Clique em **New query**
4. Cole o conteúdo do arquivo `drizzle/supabase_mapa_migrations.sql` (deste repositório)
5. Clique em **Run** (ou Ctrl+Enter)

As tabelas e a FK do MAPA serão criadas no banco do Supabase.

Depois disso, garanta que o app em produção (Vercel, etc.) use a mesma `DATABASE_URL` do Supabase nas variáveis de ambiente.
