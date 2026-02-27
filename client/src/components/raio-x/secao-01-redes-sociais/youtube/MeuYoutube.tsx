"use client";

import { CampoAnalise } from "../../shared/CampoAnalise";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { YoutubeMeuNegocio } from "@/lib/raio-x/schema";

export function MeuYoutube({
  data,
  onChange,
}: {
  data: YoutubeMeuNegocio;
  onChange: (data: YoutubeMeuNegocio) => void;
}) {
  if (!data.ativo) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-6 text-center">
        <p className="text-muted-foreground mb-4">O negócio tem YouTube?</p>
        <button
          type="button"
          onClick={() => onChange({ ...data, ativo: true })}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Sim, tenho YouTube — ativar análise
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <span className="text-sm font-medium">YouTube ativo</span>
        <button
          type="button"
          onClick={() => onChange({ ...data, ativo: false })}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Desativar
        </button>
      </div>

      <CampoAnalise
        titulo="Nome do canal"
        campo={data.nomeCanal}
        onChange={(nomeCanal) => onChange({ ...data, nomeCanal })}
        instrucao="Nome exibido do canal."
      />
      <CampoAnalise
        titulo="Identificador / URL personalizada"
        campo={data.identificadorUrl}
        onChange={(identificadorUrl) => onChange({ ...data, identificadorUrl })}
        instrucao="Nome de usuário ou URL personalizada do canal."
      />
      <CampoAnalise
        titulo="Imagem de perfil"
        campo={data.imagemPerfil}
        onChange={(imagemPerfil) => onChange({ ...data, imagemPerfil })}
        instrucao="Avatar do canal."
      />
      <CampoAnalise
        titulo="Capa / Banner do canal"
        campo={data.capaBanner}
        onChange={(capaBanner) => onChange({ ...data, capaBanner })}
        instrucao="Banner do canal."
      />
      <CampoAnalise
        titulo="Descrição do canal"
        campo={data.descricaoCanal}
        onChange={(descricaoCanal) => onChange({ ...data, descricaoCanal })}
        instrucao="Texto da descrição do canal."
      />
      <CampoAnalise
        titulo="Vídeo em destaque"
        campo={data.videoDestaque}
        onChange={(videoDestaque) => onChange({ ...data, videoDestaque })}
        instrucao="Vídeo em destaque para novos visitantes."
      />
      <CampoAnalise
        titulo="Links externos"
        campo={data.linksExternos}
        onChange={(linksExternos) => onChange({ ...data, linksExternos })}
        instrucao="Links para outras redes/site."
      />
      <CampoAnalise
        titulo="CTA na descrição/banner"
        campo={data.cta}
        onChange={(cta) => onChange({ ...data, cta })}
        instrucao="Chamada para ação na descrição ou banner."
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Inscritos</Label>
          <Input
            value={data.inscritos}
            onChange={(e) => onChange({ ...data, inscritos: e.target.value })}
            placeholder="ex: 5k"
          />
        </div>
        <div className="space-y-2">
          <Label>Vídeos publicados</Label>
          <Input
            value={data.videosPublicados}
            onChange={(e) => onChange({ ...data, videosPublicados: e.target.value })}
            placeholder="ex: 120"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Nota geral</Label>
        <textarea
          value={data.notaGeral}
          onChange={(e) => onChange({ ...data, notaGeral: e.target.value })}
          placeholder="Resumo da análise do YouTube..."
          className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
