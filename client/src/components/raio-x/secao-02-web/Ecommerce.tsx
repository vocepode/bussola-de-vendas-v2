"use client";

import { CampoAnalise } from "../shared/CampoAnalise";
import { ChecklistItem } from "../shared/ChecklistItem";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Ecommerce as EcommerceType } from "@/lib/raio-x/schema";

export function Ecommerce({
  data,
  onChange,
}: {
  data: EcommerceType;
  onChange: (data: EcommerceType) => void;
}) {
  if (!data.ativo) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-6 text-center">
        <p className="text-muted-foreground mb-4">O negócio tem e-commerce?</p>
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
        <div className="space-y-2">
          <Label>URL do e-commerce</Label>
          <Input
            value={data.url}
            onChange={(e) => onChange({ ...data, url: e.target.value })}
            placeholder="https://..."
            className="max-w-md"
          />
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...data, ativo: false })}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Desativar
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <h3 className="font-semibold text-foreground">Experiência do usuário</h3>
        <CampoAnalise
          titulo="Primeira dobra"
          instrucao="Análise MOBILE FIRST. O que aparece na tela sem rolar? Logo + proposta + CTA devem estar visíveis."
          campo={data.primeiraDobra}
          onChange={(primeiraDobra) => onChange({ ...data, primeiraDobra })}
        />
        <CampoAnalise
          titulo="Segunda dobra"
          instrucao="Produtos em destaque e mais vendidos aparecem aqui?"
          campo={data.segundaDobra}
          onChange={(segundaDobra) => onChange({ ...data, segundaDobra })}
        />
        <ChecklistItem
          label="Banners clicáveis"
          instrucao="Todos os banners do site levam para algum lugar relevante?"
          item={data.bannersClicaveis}
          onChange={(bannersClicaveis) => onChange({ ...data, bannersClicaveis })}
        />
        <ChecklistItem
          label="Boa estrutura"
          instrucao="Carregamento rápido + navegação intuitiva + mobile responsivo."
          item={data.boaEstrutura}
          onChange={(boaEstrutura) => onChange({ ...data, boaEstrutura })}
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <h3 className="font-semibold text-foreground">Clareza da informação</h3>
        <CampoAnalise
          titulo="Categorias"
          instrucao="Estrutura lógica e fácil de entender."
          campo={data.categorias}
          onChange={(categorias) => onChange({ ...data, categorias })}
        />
        <CampoAnalise
          titulo="Descrições dos produtos"
          instrucao="O MAIOR erro de e-commerces: produto sem descrição adequada."
          campo={data.descricoes}
          onChange={(descricoes) => onChange({ ...data, descricoes })}
        />
        <ChecklistItem
          label="Política de frete"
          item={data.politicaFrete}
          onChange={(politicaFrete) => onChange({ ...data, politicaFrete })}
        />
        <ChecklistItem
          label="Política de trocas"
          item={data.politicaTrocas}
          onChange={(politicaTrocas) => onChange({ ...data, politicaTrocas })}
        />
        <ChecklistItem
          label="Política de privacidade e cookies"
          item={data.politicaPrivacidade}
          onChange={(politicaPrivacidade) => onChange({ ...data, politicaPrivacidade })}
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <h3 className="font-semibold text-foreground">Jornada de compra e atendimento</h3>
        <CampoAnalise
          titulo="A compra é fácil?"
          instrucao="Liste os pontos que impedem a venda: sem clareza de produto? Checkout complexo? Poucos métodos de pagamento?"
          campo={data.compraEFacil}
          onChange={(compraEFacil) => onChange({ ...data, compraEFacil })}
        />
        <ChecklistItem
          label="Processo de pagamento"
          instrucao="Diversidade de métodos + segurança visível = mais conversão."
          item={data.processoPagamento}
          onChange={(processoPagamento) => onChange({ ...data, processoPagamento })}
        />
        <CampoAnalise
          titulo="Canais de atendimento"
          instrucao="WhatsApp, chat, e-mail, telefone visíveis. O cliente não deve se sentir perdido."
          campo={data.canaisAtendimento}
          onChange={(canaisAtendimento) => onChange({ ...data, canaisAtendimento })}
        />
      </div>

      <div className="space-y-2">
        <Label>Nota geral e prioridades (top 3 melhorias)</Label>
        <textarea
          value={data.notaGeral}
          onChange={(e) => onChange({ ...data, notaGeral: e.target.value })}
          placeholder="Nota geral..."
          className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <textarea
          value={data.prioridades}
          onChange={(e) => onChange({ ...data, prioridades: e.target.value })}
          placeholder="Top 3 prioridades de melhoria..."
          className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
