"use client";

import { CampoAnalise } from "../../shared/CampoAnalise";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TikTokMeuNegocio } from "@/lib/raio-x/schema";

export function MeuTikTok({
  data,
  onChange,
}: {
  data: TikTokMeuNegocio;
  onChange: (data: TikTokMeuNegocio) => void;
}) {
  if (!data.ativo) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-6 text-center">
        <p className="text-muted-foreground mb-4">O negócio tem TikTok?</p>
        <button
          type="button"
          onClick={() => onChange({ ...data, ativo: true })}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Sim, tenho TikTok — ativar análise
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <span className="text-sm font-medium">TikTok ativo</span>
        <button
          type="button"
          onClick={() => onChange({ ...data, ativo: false })}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Desativar
        </button>
      </div>

      <CampoAnalise
        titulo="Nome de usuário @"
        instrucao="Handle do TikTok."
        campo={data.nomeUsuario}
        onChange={(nomeUsuario) => onChange({ ...data, nomeUsuario })}
      />
      <CampoAnalise
        titulo="Imagem de perfil"
        instrucao="Reconhecível e alinhada à marca."
        campo={data.imagemPerfil}
        onChange={(imagemPerfil) => onChange({ ...data, imagemPerfil })}
      />
      <CampoAnalise
        titulo="Bio"
        instrucao="Concisa, indica transformação, destaca proposta de valor."
        campo={data.bio}
        onChange={(bio) => onChange({ ...data, bio })}
      />
      <CampoAnalise
        titulo="Links"
        instrucao="Instagram vinculado + outros links relevantes."
        campo={data.links}
        onChange={(links) => onChange({ ...data, links })}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Seguidores</Label>
          <Input
            value={data.seguidores}
            onChange={(e) => onChange({ ...data, seguidores: e.target.value })}
            placeholder="ex: 1.2k"
          />
        </div>
        <div className="space-y-2">
          <Label>Vídeos publicados</Label>
          <Input
            value={data.videosPublicados}
            onChange={(e) => onChange({ ...data, videosPublicados: e.target.value })}
            placeholder="ex: 45"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Nota geral</Label>
        <textarea
          value={data.notaGeral}
          onChange={(e) => onChange({ ...data, notaGeral: e.target.value })}
          placeholder="Resumo da análise do TikTok..."
          className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
