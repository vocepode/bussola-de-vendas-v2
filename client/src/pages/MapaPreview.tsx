"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { CONTEUDO_TOPICOS, CONTEUDO_FUNIL } from "@/constants/mapa";
import { Loader2 } from "lucide-react";

export default function MapPreview() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { data: progress } = trpc.workspaces.getProgressBySlug.useQuery({ slug: "mapa" }, { enabled: !!user });
  const { data: editoriais, isLoading: loadingEd } = trpc.mapa.editoriais.list.useQuery(undefined, { enabled: !!user });
  const { data: temas, isLoading: loadingTemas } = trpc.mapa.temas.list.useQuery(undefined, { enabled: !!user });
  const { data: ideias, isLoading: loadingIdeias } = trpc.contentIdeas.list.useQuery(undefined, { enabled: !!user });

  const isLoading = authLoading || loadingEd || loadingTemas || loadingIdeias;
  const pct = progress?.percentage ?? 0;
  const today = new Date().toLocaleDateString("pt-BR");
  const clienteDisplay = user?.name ?? "Cliente";

  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    html.classList.remove("dark");
    html.classList.add("preview-light-theme");
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.color = "#000000";
    return () => {
      html.classList.add("dark");
      html.classList.remove("preview-light-theme");
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    };
  }, []);

  useEffect(() => {
    if (searchParams?.get("print") !== "1" || isLoading) return;
    const t = setTimeout(() => window.print(), 500);
    return () => clearTimeout(t);
  }, [searchParams, isLoading]);

  const editoriaisOrdenadas = (editoriais ?? []).sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  const temasOrdenados = (temas ?? []).sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  const temasPorEditoria = editoriaisOrdenadas.map((ed) => ({
    editorial: ed,
    temas: temasOrdenados.filter((t) => t.editorialId === ed.id),
  }));

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      id="mapa-preview"
      className="min-h-screen bg-white text-slate-900 print:bg-white print:text-slate-900"
      style={{ backgroundColor: "#ffffff", color: "#000000" }}
    >
      <style>{`
        @media print {
          .print-only-footer {
            position: fixed; bottom: 0; left: 0; right: 0;
            font-size: 10px; color: #666; padding: 8px 16px;
            border-top: 1px solid #ddd;
            display: flex; justify-content: space-between; align-items: center;
          }
          .screen-only-preview { display: none !important; }
        }
        @media screen {
          .print-only-footer { display: none; }
        }
        .mapa-preview .print-section { break-inside: avoid; page-break-inside: avoid; margin-bottom: 1.5rem; }
        @page { size: A4; margin: 1cm; }
      `}</style>

      <div className="screen-only-preview border-b border-slate-200 sticky top-0 z-20 bg-white">
        <div className="container flex flex-wrap items-center gap-3 py-4">
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-[0.08em] text-slate-500">Método Compass · Bússola de Vendas</div>
            <div className="text-2xl font-bold leading-tight">Estrutura de Conteúdo | MAPA</div>
            <div className="text-sm text-slate-600">
              Cliente: {clienteDisplay} · Gerado em {today}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700">
              Progresso · {pct}%
            </div>
            <Button variant="outline" asChild>
              <Link href="/mapa">Voltar</Link>
            </Button>
            <Button onClick={() => window.print()}>Imprimir / Salvar PDF</Button>
          </div>
        </div>
      </div>

      <div className="print-only-footer">
        <span>MÉTODO COMPASS · BÚSSOLA DE VENDAS · VocêPode+</span>
        <span>{clienteDisplay} · Gerado em {today} · MAPA</span>
      </div>

      <main className="container py-6 space-y-8 pb-16" style={{ backgroundColor: "#ffffff", color: "#000000" }}>
      <div className="mapa-preview print-doc max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">MAPA – Estrutura de Conteúdo</h1>

        {/* 1. Editoriais */}
        <section className="print-section">
          <h2 className="text-lg font-semibold border-b pb-1">1. Editoriais</h2>
          {editoriaisOrdenadas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma editoria cadastrada.</p>
          ) : (
            <ul className="space-y-3 mt-2">
              {editoriaisOrdenadas.map((ed) => (
                <li key={ed.id} className="border-l-2 border-muted pl-3">
                  <strong>{ed.name}</strong>
                  {ed.whyExplore && <p className="text-sm mt-1">{ed.whyExplore}</p>}
                  {ed.context && <p className="text-sm text-muted-foreground mt-0.5">{ed.context}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 2. Temas */}
        <section className="print-section">
          <h2 className="text-lg font-semibold border-b pb-1">2. Temas</h2>
          {temasOrdenados.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum tema cadastrado.</p>
          ) : (
            <ul className="space-y-2 mt-2">
              {temasOrdenados.map((t) => (
                <li key={t.id} className="flex gap-2">
                  <span className="text-muted-foreground shrink-0">
                    {editoriais?.find((e) => e.id === t.editorialId)?.name ?? "—"}:
                  </span>
                  <span><strong>{t.name}</strong></span>
                  {t.context && <span className="text-sm text-muted-foreground">— {t.context}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 3. Temas por editoria */}
        <section className="print-section">
          <h2 className="text-lg font-semibold border-b pb-1">3. Temas por editoria</h2>
          {temasPorEditoria.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma editoria.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 mt-2">
              {temasPorEditoria.map(({ editorial, temas: temasEd }) => (
                <div key={editorial.id} className="border rounded p-3">
                  <p className="font-semibold">{editorial.name}</p>
                  <ul className="mt-1 space-y-0.5 text-sm">
                    {temasEd.map((t) => (
                      <li key={t.id}>• {t.name}</li>
                    ))}
                    {temasEd.length === 0 && <li className="text-muted-foreground">Nenhum tema</li>}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. Ideias de Conteúdo */}
        <section className="print-section">
          <h2 className="text-lg font-semibold border-b pb-1">4. Ideias de Conteúdo</h2>
          {(!ideias || ideias.length === 0) ? (
            <p className="text-sm text-muted-foreground">Nenhuma ideia cadastrada.</p>
          ) : (
            <ul className="space-y-2 mt-2">
              {ideias.map((idea) => (
                <li key={idea.id} className="flex flex-wrap gap-x-2 gap-y-0 text-sm border-l-2 border-muted pl-2">
                  <strong>{idea.title}</strong>
                  <span className="text-muted-foreground">
                    Tema: {temas?.find((t) => t.id === idea.themeId)?.name ?? idea.theme ?? "—"} · 
                    Tópico: {CONTEUDO_TOPICOS.find((t) => t.value === idea.topic)?.label ?? idea.topic} · 
                    {CONTEUDO_FUNIL.find((f) => f.value === idea.funnel)?.label ?? idea.funnel}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="print-section mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-slate-700">Progresso do MAPA</span>
            <span className="font-semibold">{pct}%</span>
          </div>
          <Progress value={pct} className="h-3" />
          <p className="text-xs text-slate-600 mt-1">
            {progress?.completed ?? 0} de {progress?.total ?? 4} etapas da Estrutura de Conteúdo
          </p>
        </section>
      </div>
      </main>
    </div>
  );
}
