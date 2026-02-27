"use client";

import { useCallback } from "react";
import { AnaliseEnvioPrints } from "./AnaliseEnvioPrints";
import { AnaliseMonthForm } from "./AnaliseMonthForm";
import { AnaliseDashboardGraficos } from "./AnaliseDashboardGraficos";
import { ChecklistConclusao } from "../ChecklistConclusao";
import type { AnaliseMensal, SecaoAnalise } from "@/lib/raio-x/schema";
import type { RaioXState } from "@/lib/raio-x/schema";
import type { RaioXStepKey } from "@/lib/raio-x/sidebar";

const ANALISE_STEP_KEYS: RaioXStepKey[] = [
  "analise.prints",
  "analise.dados_instagram",
  "analise.dashboard_instagram",
  "analise.conclusao",
];

function isAnaliseStep(key: RaioXStepKey): key is (typeof ANALISE_STEP_KEYS)[number] {
  return ANALISE_STEP_KEYS.includes(key);
}

interface SecaoAnaliseContainerProps {
  secaoAnalise: SecaoAnalise | undefined;
  onSecaoAnaliseChange: (secaoAnalise: SecaoAnalise, options?: { immediate?: boolean }) => void;
  stateForChecklist: RaioXState;
  onConcluir: () => void;
  isConcluindo: boolean;
  disabled?: boolean;
  /** Quando definido, mostra apenas o bloco correspondente (sidebar em 4 sub-itens). */
  activeAnaliseStep?: RaioXStepKey;
}

export function SecaoAnaliseContainer({
  secaoAnalise,
  onSecaoAnaliseChange,
  stateForChecklist,
  onConcluir,
  isConcluindo,
  disabled,
  activeAnaliseStep,
}: SecaoAnaliseContainerProps) {
  const meses = secaoAnalise?.meses ?? [];

  const handleSaveMonth = useCallback(
    (mes: AnaliseMensal, options?: { immediate?: boolean }) => {
      const next = {
        ...secaoAnalise,
        canal: "instagram" as const,
        meses: [...meses],
      };
      const idx = next.meses.findIndex((m) => m.mes === mes.mes);
      if (idx >= 0) next.meses[idx] = mes;
      else next.meses.push(mes);
      next.meses.sort((a, b) => (a.mes > b.mes ? -1 : 1));
      onSecaoAnaliseChange(next, options);
    },
    [secaoAnalise, meses, onSecaoAnaliseChange]
  );

  const handleRemoveMonth = useCallback(
    (mesKey: string) => {
      const next = {
        ...secaoAnalise,
        canal: "instagram" as const,
        meses: (secaoAnalise?.meses ?? []).filter((m) => m.mes !== mesKey),
      };
      onSecaoAnaliseChange(next, { immediate: true });
    },
    [secaoAnalise, onSecaoAnaliseChange]
  );

  const showOnlyOne = activeAnaliseStep && isAnaliseStep(activeAnaliseStep);

  const showPrints = !showOnlyOne || activeAnaliseStep === "analise.prints";
  const showDados = !showOnlyOne || activeAnaliseStep === "analise.dados_instagram";
  const showDashboard = !showOnlyOne || activeAnaliseStep === "analise.dashboard_instagram";
  const showConclusao = !showOnlyOne || activeAnaliseStep === "analise.conclusao";

  return (
    <div className="space-y-10">
      {showPrints && (
        <section>
          <h2 className="text-lg font-semibold mb-3">1. Prints</h2>
          <AnaliseEnvioPrints
            secaoAnalise={secaoAnalise}
            onChange={onSecaoAnaliseChange}
            disabled={disabled}
          />
        </section>
      )}
      {showDados && (
        <section>
          <h2 className="text-lg font-semibold mb-3">2. Dados do Instagram</h2>
          <AnaliseMonthForm
            meses={meses}
            onSave={handleSaveMonth}
            onRemove={handleRemoveMonth}
            disabled={disabled}
          />
        </section>
      )}
      {(showDashboard && meses.length >= 1) && (
        <section>
          <h2 className="text-lg font-semibold mb-3">3. Dashboard Instagram</h2>
          <AnaliseDashboardGraficos meses={meses} />
        </section>
      )}
      {showDashboard && meses.length === 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">3. Dashboard Instagram</h2>
          <div className="rounded-lg border border-border bg-muted/30 p-6 text-center text-muted-foreground">
            Preencha e salve pelo menos um mês em <strong>Dados do Instagram</strong> para o dashboard aparecer aqui.
          </div>
        </section>
      )}
      {showConclusao && (
        <section>
          <h2 className="text-lg font-semibold mb-3">4. Conclusão</h2>
          <ChecklistConclusao
            state={stateForChecklist}
            onConcluir={onConcluir}
            isConcluindo={isConcluindo}
          />
        </section>
      )}
    </div>
  );
}
