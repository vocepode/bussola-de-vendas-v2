# Configuração e execução do projeto

## 1. Instalar dependências

Pré-requisitos:

- Node.js (LTS)
- Yarn

Instale dependências com **yarn**:

```bash
yarn install
```

## 2. Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto a partir do exemplo:

```bash
cp .env.example .env
```

Edite o `.env` e preencha (mínimo):

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | Sim | Connection string do **Supabase Postgres** |
| `ALLOW_PUBLIC_SIGNUP` | Não | Se `true`, libera o endpoint `/api/auth/register` |
| `NOTION_EXPORT_DIR` | Não | Diretório do export do Notion (HTML/CSV) |
| `IMPORT_USER_EMAIL` | Não | Email do usuário dono das ideias (para importação do CSV) |

**Importante:** Nunca commite o arquivo `.env`. Ele já deve estar no `.gitignore`.

### Erros comuns de conexão

- **"password authentication failed for user postgres"**  
  A senha no `DATABASE_URL` está errada. No Supabase: **Settings → Database → Connection string** e use a senha que você definiu ao criar o projeto (ou redefina em "Reset database password").

- **"connect ECONNREFUSED" em endereço IPv6**  
  O código já tenta preferir IPv4. Se ainda falhar, use no Supabase a URL do **Connection pooling** (porta **6543**), que costuma ser mais estável: **Settings → Database → Connection pooling → URI**.

- **Certifique-se** de que a URL não tem espaços, quebras de linha nem caracteres estranhos (ex.: `[blocked]`). Formato esperado:  
  `postgresql://usuario:senha@host:porta/postgres?sslmode=require`

## 3. Banco de dados

Crie um projeto no **Supabase** e aplique o schema (Drizzle):

```bash
yarn db:push
```

Isso gera e aplica as migrações Drizzle (tabelas `users`, `sessions`, `modules`, `lessons`, etc.).

## 4. Rodar em desenvolvimento

```bash
yarn dev
```

Isso sobe o **Next.js** em modo desenvolvimento. Por padrão:

- **App:** http://localhost:3000

## 5. Scripts úteis

| Comando | Descrição |
|---------|-----------|
| `yarn dev` | Dev server Next.js |
| `yarn build` | Build de produção (Next.js) |
| `yarn start` | Roda o Next.js buildado |
| `yarn check` | Verifica tipos TypeScript (`tsc --noEmit`) |
| `yarn format` | Formata o código com Prettier |
| `yarn test` | Roda os testes (Vitest) |
| `yarn db:push` | Gera e aplica migrações do banco (Drizzle) |
| `yarn import:html` | Importa HTMLs do Notion export para `lessons` |
| `yarn import:ideas` | Importa CSV “Conteúdo IMC New” para `contentIdeas` |

## 6. Importar conteúdo do Notion export (opcional)

### Importar lições (HTMLs)

Por padrão, lê `./bussola completa com exemplos ` e importa **apenas páginas com `page-body` não vazio**.

```bash
yarn import:html
```

### Importar ideias de conteúdo (CSV)

Esse import precisa de um usuário existente no banco (dono das ideias). Exemplo:

```bash
export IMPORT_USER_EMAIL="seuemail@dominio.com"
yarn import:ideas
```

## 7. Sobre os outros CSVs do export

O export contém outros CSVs (concorrentes, temas, tabelas auxiliares, CRM, etc.). Eles ainda **não** são importados automaticamente — a recomendação é transformar cada “database” importante em uma tabela dedicada (ou em `resources` com JSON) conforme a prioridade.

## Resumo rápido

```bash
yarn install
cp .env.example .env
# Editar .env com DATABASE_URL (Supabase Postgres)
yarn db:push
yarn dev
```

Depois acesse http://localhost:3000 (ou a porta configurada).
