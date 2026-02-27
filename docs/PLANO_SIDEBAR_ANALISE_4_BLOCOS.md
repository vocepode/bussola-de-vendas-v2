# Plano: Análise como pasta com 4 sub-itens na sidebar

## Objetivo
- A seção **Análise** na sidebar do Raio-X deve ser uma **pasta expansível** (como Instagram, Outras redes, Web), com **4 sub-itens** clicáveis.
- Ao clicar em cada sub-item, o conteúdo à direita deve mostrar **apenas aquele bloco** (Prints, Dados do Instagram, Dashboard Instagram ou Conclusão), permitindo abrir e preencher os dados.

## Situação atual
- Na sidebar, "Análise" é um único step (`stepKey: "conclusao"`) sem seta de expandir.
- Ao clicar em "Análise", o conteúdo exibe o `SecaoAnaliseContainer` inteiro (os 4 blocos em uma única página longa). Não há sub-navegação.

## Alterações por arquivo

### 1. `client/src/lib/raio-x/sidebar.ts`

**Tipo `RaioXStepKey`:**
- Remover: `"conclusao"`.
- Adicionar os 4 novos keys:
  - `"analise.prints"`
  - `"analise.dados_instagram"`
  - `"analise.dashboard_instagram"`
  - `"analise.conclusao"`

**`RAIO_X_SIDEBAR_TREE`:**
- Substituir o último nó atual:
  ```ts
  { type: "step", stepKey: "conclusao", label: "Análise" }
  ```
  por uma **pasta** "Análise" com 4 steps:
  ```ts
  {
    type: "folder",
    label: "Análise",
    children: [
      { type: "step", stepKey: "analise.prints", label: "Prints" },
      { type: "step", stepKey: "analise.dados_instagram", label: "Dados do Instagram" },
      { type: "step", stepKey: "analise.dashboard_instagram", label: "Dashboard Instagram" },
      { type: "step", stepKey: "analise.conclusao", label: "Conclusão" },
    ],
  }
  ```

**`RAIO_X_STEP_KEYS_ORDER`:**
- Remover `"conclusao"`.
- Incluir, no final, na ordem:
  - `"analise.prints"`
  - `"analise.dados_instagram"`
  - `"analise.dashboard_instagram"`
  - `"analise.conclusao"`

**`getLabelByStepKey`:**
- Nenhuma alteração necessária; a função já percorre a árvore e retorna o `label` do step. Os novos steps estão na árvore com os labels corretos.

---

### 2. `client/src/components/raio-x/RaioXModule.tsx`

**Renderização do conteúdo (onde hoje está `activeStepKey === "conclusao"`):**
- Trocar o único bloco:
  ```tsx
  {activeStepKey === "conclusao" && (
    <SecaoAnaliseContainer ... />
  )}
  ```
  por uma condição que trata **qualquer um dos 4 steps de Análise** e passa o step ativo para o container:
  ```tsx
  {(activeStepKey === "analise.prints" ||
    activeStepKey === "analise.dados_instagram" ||
    activeStepKey === "analise.dashboard_instagram" ||
    activeStepKey === "analise.conclusao") && (
    <SecaoAnaliseContainer
      secaoAnalise={secaoAnalise}
      onSecaoAnaliseChange={saveAnalise}
      stateForChecklist={stateForChecklist}
      onConcluir={onConcluir ?? (() => {})}
      isConcluindo={isConcluindo ?? false}
      activeAnaliseStep={activeStepKey}
    />
  )}
  ```
- Ou usar um Set/array de keys de análise e `includes(activeStepKey)` para deixar o código mais limpo.

**Efeito:** Os botões "Seção anterior" / "Avançar" já usam `RAIO_X_STEP_KEYS_ORDER`; com os 4 novos keys na ordem, a navegação entre Prints → Dados → Dashboard → Conclusão (e voltar) passará a funcionar automaticamente.

---

### 3. `client/src/components/raio-x/secao-03-analise/SecaoAnaliseContainer.tsx`

**Nova prop:**
- `activeAnaliseStep?: RaioXStepKey` (ou tipo union dos 4 keys de análise).

**Lógica de renderização:**
- Se `activeAnaliseStep` for informado, renderizar **apenas** o bloco correspondente:
  - `analise.prints` → só o bloco "1. Prints" (AnaliseEnvioPrints).
  - `analise.dados_instagram` → só o bloco "2. Dados do Instagram" (AnaliseMonthForm).
  - `analise.dashboard_instagram` → só o bloco "3. Dashboard Instagram" (AnaliseDashboardGraficos).
  - `analise.conclusao` → só o bloco "4. Conclusão" (ChecklistConclusao).
- Se `activeAnaliseStep` for `undefined` (ex.: uso futuro ou fallback), manter o comportamento atual: renderizar os 4 blocos em sequência.

**Implementação sugerida:**
- Definir um mapa ou switch entre `activeAnaliseStep` e qual seção mostrar.
- Renderizar apenas uma `<section>` (com o título correspondente) em vez das quatro quando estiver em modo “sub-step”.

---

### 4. `client/src/pages/RaioXPreview.tsx`

**Função `getStepItems(stepKey, data)`:**
- Hoje existe `case "conclusao":` que devolve meses, prints por canal, checklist etc.
- Incluir casos para os 4 novos keys:
  - `case "analise.prints":`
  - `case "analise.dados_instagram":`
  - `case "analise.dashboard_instagram":`
  - `case "analise.conclusao":`
- Para os quatro, pode-se **reutilizar a mesma lógica** do atual `case "conclusao"` (retornar o mesmo array de itens de preview), assim o preview da “Análise” continua único e completo em qualquer um dos sub-itens. Se no futuro quiser diferenciar (ex.: só prints para "analise.prints"), basta ajustar o conteúdo de cada case.

**Demais usos de step no preview:**
- Qualquer referência a `RAIO_X_STEP_KEYS_ORDER` ou à lista de steps do sidebar no preview passará a incluir automaticamente os 4 novos steps, pois a ordem e a árvore vêm do `sidebar.ts`.

---

## Resumo
| Arquivo | Ação |
|--------|------|
| `sidebar.ts` | Novos step keys; "Análise" vira pasta com 4 steps; ordem de navegação atualizada. |
| `RaioXModule.tsx` | Renderizar SecaoAnaliseContainer para os 4 keys de análise e passar `activeAnaliseStep`. |
| `SecaoAnaliseContainer.tsx` | Nova prop `activeAnaliseStep`; quando definida, mostrar só o bloco correspondente. |
| `RaioXPreview.tsx` | Tratar os 4 keys em `getStepItems` (reaproveitando o conteúdo do atual "conclusao"). |

## Ordem sugerida de implementação
1. `sidebar.ts` (tipos, árvore, ordem).
2. `SecaoAnaliseContainer.tsx` (prop + render condicional por bloco).
3. `RaioXModule.tsx` (condição de render e passagem de `activeAnaliseStep`).
4. `RaioXPreview.tsx` (cases dos 4 keys em `getStepItems`).

Quando você der o comando para iniciar, implemento seguindo este plano.
