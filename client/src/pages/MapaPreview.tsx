"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { CONTEUDO_TOPICOS, CONTEUDO_FUNIL } from "@/constants/mapa";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

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

  const sectionStatusList = useMemo(() => {
    const temasPorEditoriaOk = editoriaisOrdenadas.some((ed) =>
      temasOrdenados.some((t) => t.editorialId === ed.id)
    );
    return [
      { key: "editoriais", title: "Editoriais", completed: editoriaisOrdenadas.length > 0 },
      { key: "temas", title: "Temas", completed: temasOrdenados.length > 0 },
      { key: "temas_por_editoria", title: "Temas por editoria", completed: temasPorEditoriaOk },
      { key: "ideias", title: "Ideias de Conteúdo", completed: (ideias?.length ?? 0) > 0 },
    ];
  }, [editoriaisOrdenadas, temasOrdenados, ideias?.length]);

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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Carregando preview...</div>}>
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
          .mapa-preview .print-section { break-inside: avoid; page-break-inside: avoid; }
          @page { size: A4; margin: 1cm; }
        `}</style>

        <div className="screen-only-preview border-b border-slate-200 sticky top-0 z-20 bg-white">
          <div className="container flex flex-wrap items-center gap-3 py-4">
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-[0.08em] text-slate-500">Método COMPASS · Bússola de Vendas</div>
              <div className="text-2xl font-bold leading-tight">MAPA · Estrutura de Conteúdo</div>
              <div className="text-sm text-slate-600">
                Cliente: {clienteDisplay} · Gerado em: {today}
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
          {/* ——— Capa (padrão Norte / Raio-X) ——— */}
          <section>
            <div className="text-center space-y-4 py-8">
              <div className="text-xs uppercase tracking-widest text-slate-500">VocêPode+</div>
              <h1 className="text-2xl font-bold uppercase tracking-tight">Método COMPASS · Bússola de Vendas</h1>
              <h2 className="text-xl font-semibold text-slate-700">MAPA · Estrutura de Conteúdo</h2>
            </div>
            <div className="max-w-md mx-auto space-y-2 text-sm border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <div><strong>Cliente:</strong> {clienteDisplay}</div>
              <div><strong>Gerado em:</strong> {today}</div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Progresso</span>
                <span className="font-semibold">{pct}%</span>
              </div>
              <Progress value={pct} className="h-3" />
              <p className="text-xs text-slate-600 mt-1">
                {progress?.completed ?? 0} de {progress?.total ?? 4} etapas da Estrutura de Conteúdo
              </p>
            </div>
            <div className="mt-6 space-y-2">
              <div className="text-sm font-semibold text-slate-700">Status das seções</div>
              {sectionStatusList.map((s) => (
                <div key={s.key} className="flex items-center gap-2 text-sm">
                  {s.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  )}
                  <span>{s.title}</span>
                  <span className="text-slate-500">— {s.completed ? "Concluído" : "Em andamento"}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ——— SEÇÃO 1 · EDITORIAIS ——— */}
          <Card
            className="p-5 border border-slate-200 shadow-sm bg-white text-black print:break-before-page"
            style={{ backgroundColor: "#ffffff", color: "#000000", pageBreakBefore: "always" }}
          >
            <h2 className="text-lg font-bold uppercase tracking-tight border-b border-slate-200 pb-2 mb-4">
              Seção 1 · Editoriais
            </h2>
            {editoriaisOrdenadas.length === 0 ? (
              <p className="text-sm text-slate-600">Nenhuma editoria cadastrada.</p>
            ) : (
              <ul className="space-y-3">
                {editoriaisOrdenadas.map((ed) => (
                  <li key={ed.id} className="border-l-2 border-slate-200 pl-3">
                    <div className="font-semibold text-slate-800">{ed.name}</div>
                    {ed.whyExplore && <div className="text-sm text-slate-700 mt-1">{ed.whyExplore}</div>}
                    {ed.context && <div className="text-sm text-slate-600 mt-0.5">{ed.context}</div>}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* ——— SEÇÃO 2 · TEMAS ——— */}
          <Card
            className="p-5 border border-slate-200 shadow-sm bg-white text-black print:break-before-page"
            style={{ backgroundColor: "#ffffff", color: "#000000", pageBreakBefore: "always" }}
          >
            <h2 className="text-lg font-bold uppercase tracking-tight border-b border-slate-200 pb-2 mb-4">
              Seção 2 · Temas
            </h2>
            {temasOrdenados.length === 0 ? (
              <p className="text-sm text-slate-600">Nenhum tema cadastrado.</p>
            ) : (
              <ul className="space-y-2">
                {temasOrdenados.map((t) => (
                  <li key={t.id} className="flex gap-2 text-sm">
                    <span className="text-slate-600 shrink-0">
                      {editoriais?.find((e) => e.id === t.editorialId)?.name ?? "—"}:
                    </span>
                    <span className="font-semibold text-slate-800">{t.name}</span>
                    {t.context && <span className="text-slate-600">— {t.context}</span>}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* ——— SEÇÃO 3 · TEMAS POR EDITORIA ——— */}
          <Card
            className="p-5 border border-slate-200 shadow-sm bg-white text-black print:break-before-page"
            style={{ backgroundColor: "#ffffff", color: "#000000", pageBreakBefore: "always" }}
          >
            <h2 className="text-lg font-bold uppercase tracking-tight border-b border-slate-200 pb-2 mb-4">
              Seção 3 · Temas por editoria
            </h2>
            {temasPorEditoria.length === 0 ? (
              <p className="text-sm text-slate-600">Nenhuma editoria.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {temasPorEditoria.map(({ editorial, temas: temasEd }) => (
                  <div key={editorial.id} className="border border-slate-200 rounded p-3">
                    <div className="font-semibold text-slate-800">{editorial.name}</div>
                    <ul className="mt-1 space-y-0.5 text-sm text-slate-700">
                      {temasEd.map((t) => (
                        <li key={t.id}>• {t.name}</li>
                      ))}
                      {temasEd.length === 0 && <li className="text-slate-600">Nenhum tema</li>}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ——— SEÇÃO 4 · IDEIAS DE CONTEÚDO ——— */}
          <Card
            className="p-5 border border-slate-200 shadow-sm bg-white text-black print:break-before-page"
            style={{ backgroundColor: "#ffffff", color: "#000000", pageBreakBefore: "always" }}
          >
            <h2 className="text-lg font-bold uppercase tracking-tight border-b border-slate-200 pb-2 mb-4">
              Seção 4 · Ideias de Conteúdo
            </h2>
            {(!ideias || ideias.length === 0) ? (
              <p className="text-sm text-slate-600">Nenhuma ideia cadastrada.</p>
            ) : (
              <ul className="space-y-2">
                {ideias.map((idea) => (
                  <li key={idea.id} className="flex flex-wrap gap-x-2 gap-y-0 text-sm border-l-2 border-slate-200 pl-2">
                    <span className="font-semibold text-slate-800">{idea.title}</span>
                    <span className="text-slate-600">
                      Tema: {temas?.find((t) => t.id === idea.themeId)?.name ?? idea.theme ?? "—"} ·
                      Tópico: {CONTEUDO_TOPICOS.find((t) => t.value === idea.topic)?.label ?? idea.topic} ·
                      {CONTEUDO_FUNIL.find((f) => f.value === idea.funnel)?.label ?? idea.funnel}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </main>
      </div>
    </Suspense>
  );
}
