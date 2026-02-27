"use client";

import { CampoAnalise } from "../shared/CampoAnalise";
import { ChecklistItem } from "../shared/ChecklistItem";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LandingPage as LandingPageType } from "@/lib/raio-x/schema";

export function LandingPage({
  data,
  onChange,
}: {
  data: LandingPageType;
  onChange: (data: LandingPageType) => void;
}) {
  if (!data.ativo) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-6 text-center">
        <p className="text-muted-foreground mb-4">O negócio tem landing page?</p>
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
          <Label>URL da Landing Page</Label>
          <Input
            value={data.url}
            onChange={(e) => onChange({ ...data, url: e.target.value })}
            placeholder="https://..."
          />
          <Input
            value={data.objetivo}
            onChange={(e) => onChange({ ...data, objetivo: e.target.value })}
            placeholder="Objetivo / conversão esperada"
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
        titulo="Título"
        instrucao="Claro e atraente. Comunica o propósito em 1 leitura."
        campo={data.titulo}
        onChange={(titulo) => onChange({ ...data, titulo })}
      />
      <CampoAnalise
        titulo="Primeira dobra"
        instrucao="Conteúdo relevante visível sem rolar. Título + Imagem + CTA estrategicamente posicionados."
        campo={data.primeiraDobra}
        onChange={(primeiraDobra) => onChange({ ...data, primeiraDobra })}
      />
      <CampoAnalise
        titulo="Promessa"
        instrucao="Clara, única, urgente e útil. A promessa do anúncio deve ser CONSISTENTE com a LP."
        campo={data.promessa}
        onChange={(promessa) => onChange({ ...data, promessa })}
      />
      <CampoAnalise
        titulo="Conteúdo"
        instrucao="Relevante e persuasivo. Fala para a persona. Texto conciso, sem jargões."
        campo={data.conteudo}
        onChange={(conteudo) => onChange({ ...data, conteudo })}
      />
      <CampoAnalise
        titulo="CTAs"
        instrucao="Claras, visíveis e persuasivas. Ex: 'Quero meu diagnóstico gratuito', não 'Saiba mais'."
        campo={data.ctas}
        onChange={(ctas) => onChange({ ...data, ctas })}
      />
      <CampoAnalise
        titulo="Navegação"
        instrucao="Fluxo lógico que guia o usuário. Sem distrações que tiram do objetivo."
        campo={data.navegacao}
        onChange={(navegacao) => onChange({ ...data, navegacao })}
      />
      <ChecklistItem
        label="Responsividade (mobile, tablet, desktop)"
        item={data.responsividade}
        onChange={(responsividade) => onChange({ ...data, responsividade })}
      />
      <CampoAnalise
        titulo="Velocidade de carregamento"
        instrucao="Site lento = abandono. Teste no Google PageSpeed Insights."
        campo={data.velocidadeCarregamento}
        onChange={(velocidadeCarregamento) => onChange({ ...data, velocidadeCarregamento })}
      />
      <ChecklistItem
        label="Contato acessível"
        item={data.contato}
        onChange={(contato) => onChange({ ...data, contato })}
      />

      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
        <p className="font-medium text-foreground">O que uma LP NÃO deve ser:</p>
        <ul className="list-disc list-inside mt-2 text-muted-foreground">
          <li>Um blog (muitas páginas e posts)</li>
          <li>Um catálogo de produtos</li>
          <li>Um portfólio</li>
        </ul>
        <p className="mt-2 text-foreground">LP tem UM objetivo e UM CTA principal. Foco total em conversão.</p>
      </div>

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
