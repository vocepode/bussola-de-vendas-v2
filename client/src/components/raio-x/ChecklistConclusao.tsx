"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2 } from "lucide-react";
import { podeConcluir } from "@/lib/raio-x/validations";
import type { RaioXState } from "@/lib/raio-x/schema";

const CHECKLIST_ITENS = [
  { id: "analiseInstagramCompleta", label: "Análise completa do Instagram feita", obrigatorio: true },
  { id: "passou3Segundos", label: "Passou no teste dos 3 segundos", obrigatorio: true },
  { id: "bioOtimizada", label: "Bio otimizada com CTA claro", obrigatorio: true },
  { id: "destaquesOrganizados", label: "Destaques organizados estrategicamente", obrigatorio: false },
  { id: "linkFuncional", label: "Link funcional e estratégico", obrigatorio: true },
  { id: "feedIdentidadeVisual", label: "Feed com identidade visual", obrigatorio: false },
  { id: "analise3Concorrentes", label: "Análise de 3+ concorrentes completa", obrigatorio: true },
  { id: "melhorasImplementadas", label: "Lista de melhorias identificada", obrigatorio: true },
  { id: "provaSocialVisivel", label: "Prova social visível no perfil", obrigatorio: false },
] as const;

export function ChecklistConclusao({
  state,
  onConcluir,
  isConcluindo,
}: {
  state: RaioXState;
  onConcluir: () => void;
  isConcluindo: boolean;
}) {
  const checklist = state.checklistConclusao;
  const todosObrigatorios = CHECKLIST_ITENS.filter((c) => c.obrigatorio).every(
    (c) => checklist[c.id as keyof typeof checklist]
  );
  const podeClicar = podeConcluir(state) && todosObrigatorios && !state.concluido;

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Revise o checklist abaixo. Só é possível concluir o Raio-X quando todos os itens obrigatórios estiverem
        atendidos.
      </p>
      <ul className="space-y-3">
        {CHECKLIST_ITENS.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
          >
            <Checkbox
              checked={!!checklist[item.id as keyof typeof checklist]}
              disabled
              className="pointer-events-none"
            />
            <span className={item.obrigatorio ? "font-medium" : ""}>
              {item.label}
              {item.obrigatorio ? " *" : ""}
            </span>
          </li>
        ))}
      </ul>
      <Button
        onClick={onConcluir}
        disabled={!podeClicar || isConcluindo}
        className="gap-2"
      >
        {isConcluindo ? (
          "Concluindo…"
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Concluir Raio-X
          </>
        )}
      </Button>
      {state.concluido && (
        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
          Módulo Raio-X concluído com sucesso.
        </p>
      )}
    </div>
  );
}
