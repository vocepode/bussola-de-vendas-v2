"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { NORTE_ETAPAS } from "@/norte/etapas";
import type { NorthBlock } from "@/north/schema";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const EMPTY_LABEL = "(não preenchido)";

type StepKey = (typeof NORTE_ETAPAS)[number]["key"];

function formatValue(value: unknown): string {
  if (value == null) return EMPTY_LABEL;
  if (Array.isArray(value)) {
    if (value.length === 0) return EMPTY_LABEL;
    return value.map((v) => (typeof v === "string" ? v : JSON.stringify(v))).join(", ");
  }
  if (typeof value === "object") return JSON.stringify(value);
  const str = String(value);
  return str.trim() === "" ? EMPTY_LABEL : str;
}

function getVisibleBlocks(blocks: NorthBlock[], data: Record<string, unknown>): NorthBlock[] {
  return blocks.filter((b) => {
    if (b.type !== "field" && b.type !== "table") return false;
    const showWhen = "showWhen" in b ? b.showWhen : undefined;
    if (!showWhen) return true;
    const raw = data[showWhen.fieldId];
    const val = Array.isArray(showWhen.value) ? showWhen.value : [showWhen.value];
    const op = showWhen.operator ?? "eq";
    if (op === "neq") {
      const match = Array.isArray(raw)
        ? (raw as string[]).some((r) => val.includes(r))
        : val.includes(String(raw ?? ""));
      return !match;
    }
    if (op === "contains") {
      if (!Array.isArray(raw)) return val.includes(String(raw ?? ""));
      return (raw as string[]).some((r) => val.includes(r));
    }
    return Array.isArray(raw)
      ? (raw as string[]).some((r) => val.includes(r))
      : val.includes(String(raw ?? ""));
  });
}

const ETAPA_LABELS: Record<string, string> = {
  matrioska_meu_negocio: "Matrioska do Meu Negócio",
  matrioska_concorrentes: "Matrioska dos Concorrentes",
  dados_demograficos: "Dados Demográficos",
  os_sentimentos: "Os Sentimentos",
  atitudes_interesses: "Atitudes e Interesses",
  laddering: "Laddering",
  proposta_valor: "Proposta de Valor",
};

export default function NorthPreview() {
  const search = useSearchParams();
  const scope = (search?.get("step") as StepKey | "all" | null) ?? "all";
  const pdfFull = search?.get("pdf") === "full";

  const { user } = useAuth();
  const { data: module } = trpc.modules.getBySlug.useQuery({ slug: "norte" }, { enabled: true });
  const { data: norteLessons } = trpc.lessons.listByModule.useQuery(
    { moduleId: module?.id ?? 0 },
    { enabled: !!module?.id }
  );
  const { data: progress } = trpc.workspaces.getProgressBySlug.useQuery({ slug: "norte" });
  const { data: workspace, isLoading } = trpc.workspaces.getWorkspaceStateBySlug.useQuery({ slug: "norte" });
  const { data: comecePorAqui } = trpc.workspaces.getWorkspaceStateBySlug.useQuery(
    { slug: "comece-por-aqui" },
    { enabled: true }
  );

  const lessonIdByStepKey = useMemo(() => {
    const map = new Map<StepKey, number>();
    const list = norteLessons ?? [];
    const normalize = (t: string) => (t ?? "").toLowerCase();
    for (const stepDef of NORTE_ETAPAS) {
      const slug = stepDef.lessonSlug ?? "";
      const found = slug
        ? list.find((l: { slug?: string }) => normalize(l?.slug ?? "") === normalize(slug))
        : list.find((l: { title?: string }) => normalize(l?.title ?? "").includes(normalize(stepDef.title)));
      if (found) map.set(stepDef.key, (found as { id: number }).id);
    }
    return map;
  }, [norteLessons]);

  const stepsWithData = useMemo(() => {
    const steps = workspace?.steps ?? [];
    return NORTE_ETAPAS.map((def) => {
      const lessonId = lessonIdByStepKey.get(def.key);
      const step = steps.find((s: { lessonId?: number }) => s.lessonId === lessonId);
      const data = (step?.data ?? {}) as Record<string, unknown>;
      const status = (step?.status ?? "draft") as "draft" | "completed";
      return { def, data, status };
    });
  }, [workspace?.steps, lessonIdByStepKey]);

  const comeceData = useMemo(() => {
    const first = comecePorAqui?.steps?.[0];
    if (!first) return null;
    const d = (first.data ?? {}) as Record<string, unknown>;
    return {
      nomeFantasia: typeof d.nomeFantasia === "string" ? d.nomeFantasia : "",
      nomePreferido: typeof d.comoChamar === "string" ? d.comoChamar : "",
    };
  }, [comecePorAqui?.steps]);

  const stepsToShow = useMemo(() => {
    return scope === "all" ? stepsWithData : stepsWithData.filter((s) => s.def.key === scope);
  }, [stepsWithData, scope]);

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
    if (!pdfFull || isLoading) return;
    const t = setTimeout(() => window.print(), 500);
    return () => clearTimeout(t);
  }, [pdfFull, isLoading]);

  const pct = progress?.percentage ?? 0;
  const empresaDisplay = comeceData?.nomeFantasia ?? EMPTY_LABEL;
  const clienteDisplay = comeceData?.nomePreferido ?? user?.name ?? "Cliente";
  const today = new Date().toLocaleDateString("pt-BR");

  const sectionStatusList = stepsWithData.map(({ def, status }) => ({
    key: def.key,
    title: ETAPA_LABELS[def.key] ?? def.title,
    completed: status === "completed",
  }));

  const allDataByKey = useMemo(() => {
    const m = new Map<string, Record<string, unknown>>();
    stepsWithData.forEach(({ def, data }) => m.set(def.key, data));
    return m;
  }, [stepsWithData]);

  const matrioskaMeu = allDataByKey.get("matrioska_meu_negocio") ?? {};
  const n1Rows = Array.isArray(matrioskaMeu.n1_matrioska_empresa) ? (matrioskaMeu.n1_matrioska_empresa as Record<string, unknown>[]) : [];
  const n1Row = n1Rows[0] && typeof n1Rows[0] === "object" ? n1Rows[0] : null;
  const dadosDemog = allDataByKey.get("dados_demograficos") ?? {};
  const osSentimentos = allDataByKey.get("os_sentimentos") ?? {};
  const atitudes = allDataByKey.get("atitudes_interesses") ?? {};
  const ladderingData = allDataByKey.get("laddering") ?? {};
  const propostaValor = allDataByKey.get("proposta_valor") ?? {};

  const mercado = n1Row ? String((n1Row as Record<string, unknown>).mercado ?? "").trim() : "";
  const nicho = n1Row ? String((n1Row as Record<string, unknown>).nicho ?? "").trim() : "";
  const subnicho = n1Row ? String((n1Row as Record<string, unknown>).subnicho ?? "").trim() : "";
  const segmento = n1Row ? String((n1Row as Record<string, unknown>).segmento ?? "").trim() : "";

  const resumoExecutivo = useMemo(
    () => [
      { label: "POSICIONAMENTO", lines: [`Mercado: ${mercado || EMPTY_LABEL}`, `Nicho: ${nicho || EMPTY_LABEL}`, `Subnicho: ${subnicho || EMPTY_LABEL}`, `Segmento: ${segmento || EMPTY_LABEL}`] },
      { label: "ESSÊNCIA DA MARCA", lines: [formatValue(ladderingData.n5_essencia)] },
      { label: "PROPOSTA DE VALOR", lines: [formatValue(propostaValor.n6_proposta_rascunho)] },
      {
        label: "AUDIÊNCIA",
        lines: [
          `Perfil: ${formatValue(dadosDemog.n2_faixa_etaria)} · ${formatValue(dadosDemog.n2_genero)} · ${formatValue(dadosDemog.n2_localizacao)}`,
          `Desejo central: ${formatValue(osSentimentos.n3_desejo_central)}`,
          `Dor central: ${formatValue(osSentimentos.n3_dor_central).split("\n").slice(0, 2).join(" ")}`,
        ],
      },
      { label: "VALORES DA MARCA", lines: [formatValue(propostaValor.n6_valores)] },
    ],
    [ladderingData, propostaValor, dadosDemog, osSentimentos, mercado, nicho, subnicho, segmento]
  );

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Carregando preview...</div>}>
      <div
        id="norte-preview"
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
        `}</style>

        <div className="screen-only-preview border-b border-slate-200 sticky top-0 z-20 bg-white">
          <div className="container flex flex-wrap items-center gap-3 py-4">
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-[0.08em] text-slate-500">Método COMPASS · Bússola de Vendas</div>
              <div className="text-2xl font-bold leading-tight">Carta de Navegação | Pilar Norte</div>
              <div className="text-sm text-slate-600">
                Empresa: {empresaDisplay} · Cliente: {clienteDisplay} · Gerado em {today}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700">
                Progresso · {pct}%
              </div>
              <Button variant="outline" asChild>
                <Link href="/norte">Voltar</Link>
              </Button>
              <Button onClick={() => window.print()}>Imprimir / Salvar PDF</Button>
            </div>
          </div>
        </div>

        <div className="print-only-footer">
          <span>MÉTODO COMPASS · BÚSSOLA DE VENDAS · VocêPode+</span>
          <span>{empresaDisplay} · Gerado em {today} · Pilar Norte</span>
        </div>

        <main className="container py-6 space-y-8 pb-16" style={{ backgroundColor: "#ffffff", color: "#000000" }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Carregando...
            </div>
          ) : (
            <>
              {/* ——— Capa ——— */}
              <section>
                <div className="text-center space-y-4 py-8">
                  <div className="text-xs uppercase tracking-widest text-slate-500">VocêPode+</div>
                  <h1 className="text-2xl font-bold uppercase tracking-tight">Método COMPASS · Bússola de Vendas</h1>
                  <h2 className="text-xl font-semibold text-slate-700">Carta de Navegação | Pilar Norte</h2>
                </div>
                <div className="max-w-md mx-auto space-y-2 text-sm border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                  <div><strong>Empresa:</strong> {empresaDisplay}</div>
                  <div><strong>Cliente:</strong> {clienteDisplay}</div>
                  <div><strong>Gerado em:</strong> {today}</div>
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium">Progresso do Norte</span>
                    <span className="font-semibold">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-3" />
                  {sectionStatusList.length > 0 ? (
                    <p className="text-xs text-slate-600 mt-1">
                      {sectionStatusList.filter((s) => s.completed).length} de {sectionStatusList.length}{" "}
                      {sectionStatusList.length === 1 ? "seção concluída" : "seções concluídas"}
                    </p>
                  ) : null}
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
                      <span className="text-slate-500">— {s.completed ? "Concluído" : "Incompleto"}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* ——— Resumo executivo ——— */}
              <section className="print:break-before-page" style={{ pageBreakBefore: "always" }}>
                <h2 className="text-lg font-bold uppercase tracking-tight border-b border-slate-300 pb-2 mb-4">
                  Resumo executivo — Pilar Norte
                </h2>
                <div className="space-y-4">
                  {resumoExecutivo.map((block, i) => (
                    <div key={i}>
                      <div className="font-bold text-slate-800 mb-1">{block.label}</div>
                      <div className="text-sm text-slate-700 whitespace-pre-wrap">
                        {block.lines.join("\n")}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ——— Conteúdo completo por seção ——— */}
              {stepsToShow.map(({ def, data }, sectionIndex) => {
                const visible = getVisibleBlocks(
                  def.blocks.filter((b) => b.type === "field" || b.type === "table"),
                  data
                );
                return (
                  <Card
                    key={def.key}
                    className="p-5 border border-slate-200 shadow-sm bg-white text-black print:break-before-page"
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      ...(sectionIndex > 0 ? { pageBreakBefore: "always" } : {}),
                    }}
                  >
                    <h2 className="text-lg font-bold uppercase tracking-tight border-b border-slate-200 pb-2 mb-4">
                      Seção {NORTE_ETAPAS.findIndex((s) => s.key === def.key) + 1} · {(ETAPA_LABELS[def.key] ?? def.title).toUpperCase()}
                    </h2>
                    <div className="space-y-4">
                      {visible.map((b, i) => {
                        if (b.type === "field") {
                          const value = formatValue((data as Record<string, unknown>)[b.fieldId]);
                          return (
                            <div key={i}>
                              <div className="font-semibold text-slate-800">{b.label}</div>
                              <div className="text-sm text-slate-700 whitespace-pre-wrap">{value}</div>
                            </div>
                          );
                        }
                        if (b.type === "table") {
                          const rows = Array.isArray((data as Record<string, unknown>)[b.fieldId])
                            ? ((data as Record<string, unknown>)[b.fieldId] as unknown[]).filter((r) => r && typeof r === "object")
                            : [];
                          return (
                            <div key={i} className="space-y-2">
                              <div className="font-semibold text-slate-800">{b.label}</div>
                              <div className="overflow-x-auto">
                                <table className="w-full border border-slate-200 text-sm">
                                  <thead className="bg-slate-50">
                                    <tr>
                                      {b.columns.map((c) => (
                                        <th key={c.key} className="border border-slate-200 px-2 py-1 text-left font-semibold">
                                          {c.label}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {rows.length === 0 ? (
                                      <tr>
                                        <td className="px-2 py-2 text-slate-500" colSpan={b.columns.length}>
                                          {EMPTY_LABEL}
                                        </td>
                                      </tr>
                                    ) : (
                                      (rows as Record<string, unknown>[]).map((r, ridx) => (
                                        <tr key={ridx}>
                                          {b.columns.map((c) => (
                                            <td key={c.key} className="border border-slate-200 px-2 py-1">
                                              {String(r[c.key] ?? "").trim() || EMPTY_LABEL}
                                            </td>
                                          ))}
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </Card>
                );
              })}
            </>
          )}
        </main>
      </div>
    </Suspense>
  );
}
