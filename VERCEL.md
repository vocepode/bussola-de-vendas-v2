# Deploy na Vercel (Next.js + Supabase)

## Como subir o projeto na Vercel

### Opção 1: Conectar repositório no Dashboard (recomendado)

1. Acesse [vercel.com](https://vercel.com) e faça login.
2. Clique em **Add New** → **Project**.
3. Importe o repositório Git (GitHub, GitLab ou Bitbucket) deste projeto.
4. A Vercel detecta Next.js automaticamente. Confirme:
   - **Build Command**: `yarn build`
   - **Install Command**: `yarn install`
5. Configure as **Environment Variables** (veja abaixo) e clique em **Deploy**.

### Opção 2: Deploy pelo terminal (Vercel CLI)

1. Instale e faça login (se ainda não tiver):
   ```bash
   yarn add -g vercel
   vercel login
   ```
2. Na pasta do projeto, rode:
   ```bash
   vercel          # deploy de preview
   vercel --prod   # deploy em produção
   ```
3. Na primeira vez o CLI pergunta sobre o projeto; aceite as sugestões.
4. Configure as variáveis de ambiente no Dashboard da Vercel (Project → Settings → Environment Variables) antes ou depois do primeiro deploy.

---

## Variáveis de ambiente (Vercel)

Em **Project Settings → Environment Variables**, configure:

- **`DATABASE_URL`** (obrigatório): connection string do Supabase Postgres (recomendado usar o pooler + SSL).
- (Opcional) **`ALLOW_PUBLIC_SIGNUP=true`**: libera cadastro via `/api/auth/register`.

Para Supabase: em **Settings → Database**, use a connection string do **Connection pooling (Session)** com `?sslmode=require`.

---

## Build

O projeto usa Next.js; a Vercel detecta e usa:

- **Build Command**: `yarn build`
- **Install Command**: `yarn install`
- **Output**: Next.js (automático)

O arquivo `vercel.json` na raiz reforça esses comandos.

---

## Observações importantes

- **Sessão/cookies**: o login usa cookie httpOnly `app_session_id` (`COOKIE_NAME` em `shared/const.ts`). Em produção, use o mesmo domínio da Vercel para os cookies funcionarem.
- **Banco**: rode as migrações do Drizzle antes de usar em produção: `yarn db:push` (pode ser local com `DATABASE_URL` de produção, ou em um job de CI).

