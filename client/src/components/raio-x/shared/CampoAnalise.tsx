"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { CampoBase, Classificacao } from "@/lib/raio-x/schema";
import { ChevronDown, ChevronRight, Info } from "lucide-react";

const CLASSIFICACOES: { value: Classificacao; label: string; className: string }[] = [
  { value: "ruim", label: "Ruim", className: "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300" },
  { value: "medio", label: "Médio", className: "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  { value: "bom", label: "Bom", className: "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-300" },
  { value: "otimo", label: "Ótimo", className: "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-300" },
];

interface CampoAnaliseProps {
  titulo: string;
  instrucao: string;
  exemplos?: { ruim: string; bom: string };
  campo: CampoBase;
  onChange: (campo: CampoBase) => void;
  maxLength?: number;
  obrigatorio?: boolean;
}

export function CampoAnalise({
  titulo,
  instrucao,
  exemplos,
  campo,
  onChange,
  maxLength,
  obrigatorio,
}: CampoAnaliseProps) {
  const [instrucaoAberta, setInstrucaoAberta] = useState(true);

  const update = (patch: Partial<CampoBase>) => {
    onChange({ ...campo, ...patch });
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-foreground">
          {titulo}
          {obrigatorio ? <span className="text-destructive ml-1">*</span> : null}
        </h3>
      </div>

      <button
        type="button"
        onClick={() => setInstrucaoAberta((v) => !v)}
        className="flex w-full items-center gap-2 rounded-md py-1 text-left text-sm text-muted-foreground hover:text-foreground"
      >
        {instrucaoAberta ? (
          <ChevronDown className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0" />
        )}
        <Info className="h-4 w-4 shrink-0" />
        <span>Por que isso importa</span>
      </button>
      {instrucaoAberta ? (
        <p className="text-sm text-muted-foreground pl-6">{instrucao}</p>
      ) : null}

      {exemplos ? (
        <div className="grid grid-cols-2 gap-3 rounded-md border border-border bg-muted/30 p-3">
          <div>
            <span className="text-xs font-medium text-red-600 dark:text-red-400">Ruim</span>
            <p className="mt-1 text-xs text-muted-foreground">{exemplos.ruim}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-green-600 dark:text-green-400">Bom</span>
            <p className="mt-1 text-xs text-muted-foreground">{exemplos.bom}</p>
          </div>
        </div>
      ) : null}

      <Textarea
        placeholder="Escreva aqui..."
        value={campo.valor}
        onChange={(e) => update({ valor: e.target.value })}
        maxLength={maxLength}
        className="min-h-[80px] resize-y"
      />
      {maxLength ? (
        <p className="text-xs text-muted-foreground">
          {campo.valor.length}/{maxLength} caracteres
        </p>
      ) : null}

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Classificação</p>
        <div className="flex flex-wrap gap-2">
          {CLASSIFICACOES.map((c) => (
            <button
              key={c.value ?? "null"}
              type="button"
              onClick={() => update({ classificacao: campo.classificacao === c.value ? null : c.value })}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition",
                campo.classificacao === c.value ? c.className : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <Textarea
        placeholder="O que você acha que pode melhorar"
        value={campo.nota}
        onChange={(e) => update({ nota: e.target.value })}
        className="min-h-[60px] resize-y text-sm"
      />
    </div>
  );
}
