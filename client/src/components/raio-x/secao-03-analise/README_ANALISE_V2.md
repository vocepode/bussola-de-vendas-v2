# Seção Análise — Estrutura preservada para v2

Esta pasta contém toda a estrutura do **dashboard e dados da Análise** do Raio-X, temporariamente fora da navegação na **v1**. Na v1 o usuário vê apenas o aviso "Em breve" ao clicar em Análise.

## Conteúdo preservado

- **SecaoAnaliseContainer.tsx** — Orquestra os 4 blocos: Prints, Dados do Instagram, Dashboard Instagram, Conclusão.
- **AnaliseEnvioPrints.tsx** — Upload e gestão de prints por canal.
- **AnaliseMonthForm.tsx** — Formulário de métricas por mês (visualizações, alcance, engajamento, etc.) com salvamento.
- **AnaliseDashboardGraficos.tsx** — Dashboard com resumo do mês, KPIs, gráficos de tendência (Recharts) e insights.
- **AnaliseDashboard.tsx** — Variante do dashboard (formulário + KPIs + gráficos no mesmo fluxo).
- **AnaliseInsights.tsx** — Insights automáticos a partir das métricas.
- **AnaliseMonthForm** (em AnaliseMonthForm.tsx) — Lista de campos de métricas e ordem definida para v2.
- **ChecklistConclusao** — Usado dentro do container para a etapa "Conclusão".

Schema e métricas em `@/lib/raio-x/schema.ts` (AnaliseMensal, SecaoAnalise) e `@/lib/raio-x/analysis-metrics.ts`.

## Como reativar na v2

1. **sidebar.ts**  
   - Incluir no tipo `RaioXStepKey`: `analise.prints`, `analise.dados_instagram`, `analise.dashboard_instagram`, `analise.conclusao`.  
   - Na pasta "Análise", trocar o único step `analise.em_breve` pelos quatro steps acima.  
   - Em `RAIO_X_STEP_KEYS_ORDER`, trocar `analise.em_breve` pelos quatro steps.

2. **RaioXModule.tsx**  
   - Reimportar `SecaoAnaliseContainer`.  
   - Substituir o bloco que renderiza o card "Análise — Em breve" pela condição que renderiza `SecaoAnaliseContainer` quando `activeStepKey` for um dos quatro steps da análise (como estava antes).

3. **RaioXPreview.tsx**  
   - No `getStepContent`, voltar a tratar `analise.prints`, `analise.dados_instagram`, `analise.dashboard_instagram`, `analise.conclusao` (ex.: retornar `getAnaliseItems(...)` para todos).

4. **Backend**  
   - A API `raioX.saveSecao` com `secao: "analise"` e a coluna `secao_analise` já existem; não é necessário alterar para reativar.

Com isso, a estrutura do dashboard e dos dados da Análise volta a ser usada no segundo momento (v2).
