"use client";

import { CampoAnalise } from "../shared/CampoAnalise";
import { ChecklistItem } from "../shared/ChecklistItem";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SiteInstitucional } from "@/lib/raio-x/schema";

export function Site({
  data,
  onChange,
}: {
  data: SiteInstitucional;
  onChange: (data: SiteInstitucional) => void;
}) {
  if (!data.ativo) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-6 text-center">
        <p className="text-muted-foreground mb-4">O negócio tem site institucional?</p>
        <button
          type="button"
          onClick={() => onChange({ ...data, ativo: true })}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Sim — ativar análise
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div className="space-y-2 flex-1 max-w-md">
          <Label>URL do site</Label>
          <Input
            value={data.url}
            onChange={(e) => onChange({ ...data, url: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...data, ativo: false })}
          className="text-xs text-muted-foreground hover:text-foreground shrink-0"
        >
          Desativar
        </button>
      </div>

      <CampoAnalise
        titulo="Primeira dobra"
        instrucao="O que aparece sem rolar?"
        campo={data.primeiraDobra}
        onChange={(primeiraDobra) => onChange({ ...data, primeiraDobra })}
      />
      <CampoAnalise
        titulo="Navegação"
        instrucao="Clara e intuitiva."
        campo={data.navegacao}
        onChange={(navegacao) => onChange({ ...data, navegacao })}
      />
      <CampoAnalise
        titulo="Conteúdo"
        instrucao="Claro sobre o que faz e para quem."
        campo={data.conteudo}
        onChange={(conteudo) => onChange({ ...data, conteudo })}
      />
      <CampoAnalise
        titulo="CTA"
        instrucao="Chamada para ação visível."
        campo={data.cta}
        onChange={(cta) => onChange({ ...data, cta })}
      />
      <ChecklistItem
        label="Contato acessível"
        item={data.contato}
        onChange={(contato) => onChange({ ...data, contato })}
      />
      <ChecklistItem
        label="Responsividade"
        item={data.responsividade}
        onChange={(responsividade) => onChange({ ...data, responsividade })}
      />
      <CampoAnalise
        titulo="Velocidade"
        instrucao="Carregamento rápido."
        campo={data.velocidade}
        onChange={(velocidade) => onChange({ ...data, velocidade })}
      />

      <div className="space-y-2">
        <Label>Nota geral e prioridades</Label>
        <textarea
          value={data.notaGeral}
          onChange={(e) => onChange({ ...data, notaGeral: e.target.value })}
          className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <textarea
          value={data.prioridades}
          onChange={(e) => onChange({ ...data, prioridades: e.target.value })}
          placeholder="Prioridades de melhoria..."
          className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
