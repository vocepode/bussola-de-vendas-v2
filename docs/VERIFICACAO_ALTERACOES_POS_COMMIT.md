# Verificação das alterações desde o último commit

**Data da verificação:** 2026-02  
**Objetivo:** Validar se as alterações estão consistentes e seguras para evoluir (commit/deploy).

---

## 1. Resumo das alterações

### 1.1 Arquivos modificados (tracked)

| Arquivo | Resumo |
|---------|--------|
| `app/layout.tsx` | Incluído `/raio-x/preview` no script que força tema claro na pré-visualização. ✅ |
| `app/modulo/[slug]/page.tsx` | Redirect `slug === "raio-x"` → `/raio-x`. ✅ |
| `client/src/components/ui/chart.tsx` | Tooltip: tratar `value` null/undefined e usar `toLocaleString("pt-BR")` para números. ✅ |
| `client/src/constants/pillars.ts` | Raio-X: `getModuleHref` e `href: "/raio-x"` em `PILLARS_ORDER`. ✅ |
| `client/src/pages/Home.tsx` | Dashboard: progresso do Raio-X via `raioXOverview` (seções 0–3, % e href). ✅ |
| `client/src/pages/MyCompass.tsx` | Mesma lógica de progresso Raio-X e href. ✅ |
| `drizzle/migrations/0000_...sql` até `0005_...sql` | Migrations antigas: CREATE → CREATE IF NOT EXISTS / DO $$ IF NOT EXISTS. ⚠️ Ver seção 3. |
| `drizzle/migrations/meta/_journal.json` | Incluídas entradas 0006–0009 (raio_x, secao_analise, public_micromax, etapas_concluidas). ✅ |
| `drizzle/schema.ts` | Tabela `raio_x` e tipos `RaioX` / `InsertRaioX`. ✅ |
| `server/db.ts` | Raio-X: getRaioXByUserId (com fallback se coluna faltar), upsert, concluirEtapa (com self-heal ALTER), createRaioXIfNotExists. ✅ |
| `server/routers.ts` | `getOverviewData`, dashboard com try/catch e fallback, router `raioX` (get, saveSecao, concluirEtapa, updateProgress, concluir). ✅ |

### 1.2 Arquivos novos (untracked)

- **App:** `app/api/upload-raio-x/`, `app/raio-x/`
- **Client:** `client/src/components/raio-x/`, `client/src/lib/raio-x/`, `client/src/pages/RaioXPreview.tsx`, `client/src/pages/RaioXWorkspace.tsx`
- **Migrations:** `0006_raio_x.sql`, `0007_raio_x_secao_analise.sql`, `0008_public_micromax.sql`, `0009_raio_x_etapas_concluidas.sql`, `drizzle/migrations/meta/0008_snapshot.json`
- **Docs:** `docs/PLANO_SIDEBAR_ANALISE_4_BLOCOS.md`

---

## 2. Validação por área

### 2.1 Navegação e rotas

- **Raio-X** abre em `/raio-x` (redirect em `app/modulo/[slug]/page.tsx` e `getModuleHref`).
- **Preview** usa tema claro em `/raio-x/preview` (layout).
- **Pilares** em Home e MyCompass usam `pillar.href` quando existe (Raio-X → `/raio-x`). ✅

### 2.2 Dashboard (getOverview)

- **getOverviewData(userId)** concentra a lógica; em erro retorna fallback (progresso 0, listas vazias) em vez de 500. ✅
- **Raio-X:** progresso vem de `getRaioXByUserId` (try/catch), `sectionCount: 3`, `completedSections` limitado a 3. ✅
- **PILAR_SLUGS** = marco-zero, norte, raio-x, mapa, rota (5 pilares; comece-por-aqui não entra no cálculo de overall). ✅
- **Home / MyCompass:** usam `raioXOverview.progressPercentage`, `sectionCount`, `completedSections` e `pillar.href` corretamente. ✅

### 2.3 Backend Raio-X

- **getRaioXByUserId:** fallback com SQL sem `etapas_concluidas` se coluna não existir (erro 42703). ✅
- **concluirEtapaRaioX:** em 42703 executa `ALTER TABLE ... ADD COLUMN IF NOT EXISTS "etapas_concluidas"` e repete o UPDATE. ✅
- **createRaioXIfNotExists:** usado em `raioX.get` quando não há registro. ✅
- **raioX.get:** retorna `bloqueado: false`; travamento por Norte pode ser reativado depois. ✅

### 2.4 Schema e migrations

- **schema:** tabela `raio_x` com `etapasConcluidas` jsonb, tipos exportados. ✅
- **Journal:** entradas 0–9; 0009 `etapas_concluidas` presente. ✅
- **Migrations 0006–0009:** criam/alteram apenas raio_x; 0009 idempotente (IF NOT EXISTS). ✅

### 2.5 UX Raio-X (arquivos novos)

- Concorrentes: avaliação 0–5, tom roxo na seleção.
- CampoAnalise: placeholder “O que você acha que pode melhorar”; checkbox “Ajustado” removido.
- Debounce de save aumentado; sync do servidor não sobrescreve estado com debounce pendente.
- Preview: avaliações dos concorrentes (dimensões 0–5) na pré-visualização.

---

## 3. Pontos de atenção

### 3.1 Migrations 0000–0005 alteradas

As migrations antigas (0000 a 0005) foram alteradas para usar `CREATE IF NOT EXISTS` e `DO $$ ... IF NOT EXISTS` para tipos.

- **Risco:** Em ambientes onde essas migrations **já foram aplicadas**, o Drizzle não as reexecuta. As mudanças só afetam **novos** bancos ou quem rodar do zero.
- **Recomendação:** Se em produção as migrations 0000–0005 já rodaram, **reverter** as alterações apenas nesses arquivos (manter o conteúdo original no repositório) e **não** commitar as versões “IF NOT EXISTS” dessas migrations, para evitar confusão. Manter no commit apenas: journal atualizado, migrations **novas** (0006–0009) e o restante do código.

### 3.2 Journal em uma linha

O `_journal.json` está em uma única linha (sem quebras). Funcionalmente é igual; se a equipe preferir JSON formatado, pode formatar de novo antes do commit.

### 3.3 Variáveis de ambiente

Nenhuma URL ou config sensível foi adicionada nos trechos revisados; uso de `.env` está coerente com a regra do projeto.

---

## 4. Erros de TypeScript (corrigidos nesta verificação)

Foi rodado `tsc --noEmit`. Estes pontos foram ajustados:

- **server/db.ts:** Fallback `getRaioXByUserIdFallback`: tipo do parâmetro `db` como `NonNullable<Awaited<ReturnType<typeof getDb>>>`; tipo explícito `RaioXFallbackRow` e `row` tipado para evitar `row` como `{}`; retorno com `as unknown as RaioX`.
- **client/src/lib/raio-x/sidebar.ts:** Inclusão em `RaioXStepKey` das chaves `analise.prints`, `analise.dados_instagram`, `analise.dashboard_instagram`, `analise.conclusao` e `conclusao` (usadas em SecaoAnaliseContainer e RaioXPreview).
- **client/src/lib/raio-x/schema.ts:** Em `mergeSecaoRedesSociais`, extração de `concorrentes` com tipo `ConcorrenteInstagram[]` e casts com `as unknown as` onde necessário para satisfazer o tipo de `SecaoRedesSociais["instagram"]`.

Após as correções, **`tsc --noEmit` conclui sem erros.**

---

## 5. Checklist antes de evoluir (commit/deploy)

- [ ] Decidir se mantém ou reverte as alterações nas migrations **0000–0005** (ver 3.1).
- [x] TypeScript: `npx tsc --noEmit` sem erros (verificado na seção 4).
- [ ] Testar em desenvolvimento: abrir Raio-X, salvar seção, concluir etapa, abrir preview e conferir progresso no dashboard.
- [ ] Se usar outro banco em produção: rodar `yarn drizzle-kit migrate` (ou aplicar 0006–0009 manualmente) e validar que a coluna `etapas_concluidas` existe (ou que o self-heal no “Concluir etapa” roda sem erro).
- [ ] Adicionar ao commit os arquivos novos do Raio-X (rotas, componentes, lib, páginas, migrations 0006–0009, snapshot 0008) e os arquivos modificados listados no resumo.

---

## 6. Conclusão

As alterações estão **consistentes** e **prontas para evoluir**, desde que:

1. A decisão sobre as migrations 0000–0005 (reverter ou não) seja aplicada.
2. O checklist acima seja cumprido (build, testes manuais, migrations em produção).

O módulo Raio-X está integrado ao dashboard, às rotas e ao banco, com fallbacks para quando a coluna `etapas_concluidas` ainda não existir, permitindo evoluir com segurança.
