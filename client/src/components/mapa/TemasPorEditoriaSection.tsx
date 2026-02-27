"use client";

import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export function TemasPorEditoriaSection() {
  const { data: editoriais, isLoading: loadingEd } = trpc.mapa.editoriais.list.useQuery();
  const { data: temas, isLoading: loadingTemas } = trpc.mapa.temas.list.useQuery();

  const isLoading = loadingEd || loadingTemas;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const editoriaisOrdenadas = (editoriais ?? []).sort(
    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
  );
  const temasPorEditoria = editoriaisOrdenadas.map((ed) => ({
    editorial: ed,
    temas: (temas ?? [])
      .filter((t) => t.editorialId === ed.id)
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Temas por editoria</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Visão consolidada: editorias e seus temas. Somente leitura.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {temasPorEditoria.map(({ editorial, temas: temasEd }) => (
          <Card key={editorial.id}>
            <CardContent className="pt-4">
              <p className="font-semibold text-foreground">{editorial.name}</p>
              {editorial.whyExplore && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{editorial.whyExplore}</p>
              )}
              <ul className="mt-3 space-y-1">
                {temasEd.map((t) => (
                  <li key={t.id} className="text-sm flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{t.name}</span>
                  </li>
                ))}
                {temasEd.length === 0 && (
                  <li className="text-sm text-muted-foreground">Nenhum tema</li>
                )}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {editoriaisOrdenadas.length === 0 && (
        <p className="text-sm text-muted-foreground">Crie editoriais e temas nas abas anteriores.</p>
      )}
    </div>
  );
}
