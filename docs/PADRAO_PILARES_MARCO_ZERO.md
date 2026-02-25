# Padrão do Marco Zero – aplicar nos outros pilares

Documento de referência para manter o mesmo layout, tema e comportamento ao implementar ou ajustar outros pilares (Norte, Sul, etc.), usando o Marco Zero como base.

---

## 1. Layout geral

- **Wrapper:** página dentro de `<DashboardLayout>` (sidebar + header global já inclusos).
- **Sem botão "Dashboard"** no header da página: navegação é só pela sidebar.
- **Estrutura da área principal:**
  - Header da página (título, progresso, ações).
  - Grid: `grid-cols-1 lg:grid-cols-[280px_1fr]` — coluna esquerda = lista de etapas, coluna direita = conteúdo do passo ativo.

---

## 2. Cores (tema escuro fixo)

Usar valores fixos para ficar igual em local e Vercel:

| Uso            | Valor     |
|----------------|-----------|
| Fundo principal | `#0a0a0a` |
| Header da página | `#111111` |
| Bordas         | `#262626` |
| Cards          | `#161616` |
| Roxo (destaque, Concluído, progress bar) | `bg-primary` / `#7c3aed` (variável `--primary`) |

- **Item ativo** na lista de etapas: `bg-primary/30 text-white font-medium`.
- **Badge "Concluído"**: `bg-primary text-primary-foreground`.
- **Barra de progresso:** componente `Progress` já usa `bg-primary` (tema).

---

## 3. Header da página (dentro do conteúdo)

- **Container:** `sticky top-0 z-10 border-b border-[#262626] bg-[#111111]`.
- **Título:** "Diagnóstico" em `text-white/60`, nome do pilar em `text-xl font-bold text-white`.
- **Ações à direita:** etapas (ex.: "2 de 2"), botão Pré-visualizar, Imprimir/PDF, Badge Concluído (se 100%), Avatar.
- **Barra de progresso:** abaixo do título, `Progress` + porcentagem em `text-white/90`.

---

## 4. Card "Etapas do [Pilar]"

- **Card:** `border-[#262626] bg-[#161616]`.
- **Título do card:** `text-base text-white`.
- **Botão de etapa:**
  - Ativo: `bg-primary/30 text-white font-medium`.
  - Inativo: `hover:bg-white/10`, texto branco.
  - Ícone: check (concluído) ou círculo (não concluído).

---

## 5. Card do conteúdo (passo ativo)

- **Card:** `border-[#262626] bg-[#161616]`.
- **CardTitle:** `text-white`.
- **CardContent:** `dark:text-white/90` ou texto branco explícito.
- **Formulário:** `NorthStepForm` com `footerExtra` quando precisar (ex.: "Recarregar estado").

---

## 6. Tabelas (blocos tipo "table" no formulário)

No `NorthStepForm`, blocos `type === "table"` devem usar:

- **Container:** `rounded-lg border border-[#262626] bg-[#161616]`.
- **Cabeçalhos:** `text-white`, borda `#262626`.
- **Células:** `border-[#262626]`, inputs com `bg-white/10 border-white/20 text-white placeholder:text-white/50`.
- **Botões "Remover" / "Adicionar linha":** `text-white/90 hover:bg-white/10`, outline `border-white/20`.

(Já aplicado no `NorthStepForm` para todas as tabelas.)

---

## 7. Pré-visualização (Carta de Navegação / relatório)

- **Rota:** `/[pilar]/preview` (ex.: `/marco-zero/preview`).
- **Tema na tela:** fundo branco, texto e tabelas em preto (não usar tema escuro).
- **Implementação:**
  1. **Layout (`app/layout.tsx`):** script no `<body>` que, se `pathname` contiver `/[pilar]/preview`, remove a classe `dark` do `<html>`, adiciona `preview-light-theme` e define `document.body.style.backgroundColor = '#ffffff'` e `document.body.style.color = '#000000'`.
  2. **Página de preview:** `useEffect` que remove `dark` do `document.documentElement`, adiciona `preview-light-theme` e define estilos do `body`; no cleanup, restaura `dark` e remove os estilos.
  3. **Container:** `id="[pilar]-preview"` (ex.: `marco-zero-preview`) + estilos inline de fallback: `backgroundColor: '#ffffff'`, `color: '#000000'`.
  4. **Cards na preview:** `style={{ backgroundColor: '#ffffff', color: '#000000', borderColor: '#000000' }}` para garantir em produção (Vercel).
- **CSS:** em `@media screen`, regras para `html.preview-light-theme #marco-zero-preview` (ou id do pilar) forçando fundo branco e texto preto em todos os descendentes.

---

## 8. Impressão / PDF

- **`@media print`:** `html`, `html.dark`, `body` com `background: #ffffff !important`, `color: #000000 !important`.
- **Área de impressão:** `#workspace-print-area` e `.print-document` com fundo branco e texto preto.
- **Tabelas na impressão:** `.print-table th, .print-table td` com `border: 1px solid #000`, `background: #ffffff`, `color: #000000`.
- **Página de preview ao imprimir:** `#marco-zero-preview` (ou id do pilar) e filhos com `background-color: #ffffff !important`, `color: #000000 !important`.

---

## 9. Arquivos de referência

- **Workspace (página do pilar):** `client/src/pages/MarcoZeroWorkspace.tsx`
- **Preview:** `client/src/pages/MarcoZeroPreview.tsx`
- **Formulário de etapas:** `client/src/components/north/NorthStepForm.tsx`
- **Layout raiz (script do preview):** `app/layout.tsx`
- **CSS (tema, preview, print):** `client/src/index.css`
- **Schema de etapas:** `client/src/marcoZero/schema.ts` (estrutura de STEPS e blocos)

---

## 10. Checklist ao criar/ajustar outro pilar

- [ ] Página workspace dentro de `DashboardLayout`, sem botão "Dashboard" no header.
- [ ] Header da página com `bg-[#111111]`, `border-[#262626]`, texto branco.
- [ ] Lista de etapas em card `bg-[#161616]`, item ativo com `bg-primary/30 text-white`.
- [ ] Conteúdo em card `bg-[#161616]`, uso de `NorthStepForm` quando for formulário por etapas.
- [ ] Progress bar e Badge "Concluído" usando `bg-primary` / tema.
- [ ] Rota de preview `/[pilar]/preview` com tema claro (remover `dark`, fundo branco, texto preto).
- [ ] Script no layout tratando pathname `/[pilar]/preview` (remover dark, setar body).
- [ ] Regras `@media print` para fundo branco e texto/tabelas preto.
- [ ] Tabelas no formulário com o mesmo estilo escuro (container `#161616`, inputs legíveis).
