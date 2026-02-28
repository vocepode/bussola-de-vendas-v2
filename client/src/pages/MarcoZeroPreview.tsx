"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { MARCO_ZERO_STEPS } from "@/marcoZero/schema";
import type { NorthBlock } from "@/north/schema";
import { Loader2, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const EMPTY_LABEL = "(não preenchido)";

type StepKey = (typeof MARCO_ZERO_STEPS)[number]["key"];

/** Encontra bloco scaleChoice pelo fieldId para formatar valor como texto legível. */
function formatScaleChoiceValue(value: unknown, fieldId: string): string {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return EMPTY_LABEL;
  for (const step of MARCO_ZERO_STEPS) {
    for (const b of step.blocks) {
      if (b.type !== "field" || b.fieldId !== fieldId || b.fieldType !== "scaleChoice") continue;
      const rows = b.scaleRows ?? [];
      const opts = b.scaleOptions ?? [];
      const optMap = new Map(opts.map((o) => [o.id, o.label]));
      const parts: string[] = [];
      for (const row of rows) {
        const optId = (value as Record<string, unknown>)[row.id];
        const label = (optMap.get(String(optId ?? "")) ?? String(optId ?? "").trim()) || EMPTY_LABEL;
        parts.push(`${row.label}: ${label}`);
      }
      return parts.length ? parts.join(" · ") : EMPTY_LABEL;
    }
  }
  return EMPTY_LABEL;
}

function formatValue(value: unknown, block?: NorthBlock): string {
  if (value == null) return EMPTY_LABEL;
  if (Array.isArray(value)) {
    if (value.length === 0) return EMPTY_LABEL;
    const first = value[0];
    if (first && typeof first === "object" && !Array.isArray(first)) {
      const rows = value as Record<string, unknown>[];
      const withLink = rows.filter((r) => String(r?.link ?? "").trim() || String(r?.platform ?? "").trim());
      if (withLink.length === 0) return EMPTY_LABEL;
      return withLink.map((r) => `${String(r.platform ?? "—")}: ${String(r.link ?? "").trim() || "—"}`).join(" · ");
    }
    return value.map((v) => (typeof v === "string" ? v : JSON.stringify(v))).join(", ");
  }
  if (typeof value === "object") {
    if (block?.type === "field" && block.fieldType === "scaleChoice" && block.fieldId) {
      return formatScaleChoiceValue(value, block.fieldId);
    }
    return JSON.stringify(value);
  }
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

export default function MarcoZeroPreview() {
  const search = useSearchParams();
  const scope = (search?.get("step") as StepKey | "all" | null) ?? "all";
  const sectionsParam = search?.get("sections") ?? null; // comma-separated keys, e.g. "jornada,desafios,diagnostico"
  const pdfFull = search?.get("pdf") === "full";

  const { user } = useAuth();
  const { data: module } = trpc.modules.getBySlug.useQuery({ slug: "marco-zero" }, { enabled: true });
  const { data: marcoZeroLessons } = trpc.lessons.listByModule.useQuery(
    { moduleId: module?.id ?? 0 },
    { enabled: !!module?.id }
  );
  const { data: progress } = trpc.workspaces.getProgressBySlug.useQuery({ slug: "marco-zero" });
  const { data: workspace, isLoading } = trpc.workspaces.getWorkspaceStateBySlug.useQuery({ slug: "marco-zero" });
  const { data: comecePorAqui } = trpc.workspaces.getWorkspaceStateBySlug.useQuery(
    { slug: "comece-por-aqui" },
    { enabled: true }
  );

  const lessonIdByStepKey = useMemo(() => {
    const map = new Map<StepKey, number>();
    const list = marcoZeroLessons ?? [];
    const normalize = (t: string) => (t ?? "").toLowerCase();
    for (const stepDef of MARCO_ZERO_STEPS) {
      const found = stepDef.lessonSlug
        ? list.find((l: { slug?: string }) => normalize(l?.slug) === normalize(stepDef.lessonSlug!))
        : list.find((l: { title?: string }) => normalize(l?.title).includes(normalize(stepDef.title)));
      if (found) map.set(stepDef.key, (found as { id: number }).id);
    }
    return map;
  }, [marcoZeroLessons]);

  const stepsWithData = useMemo(() => {
    const steps = workspace?.steps ?? [];
    return MARCO_ZERO_STEPS.map((def) => {
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
      comoChamar: typeof d.comoChamar === "string" ? d.comoChamar : "",
      dataInicio: first.createdAt
        ? new Date(first.createdAt).toLocaleDateString("pt-BR")
        : EMPTY_LABEL,
    };
  }, [comecePorAqui?.steps]);

  const sectionKeysFilter = useMemo(() => {
    if (!sectionsParam) return null;
    return new Set(sectionsParam.split(",").map((k) => k.trim()) as StepKey[]);
  }, [sectionsParam]);

  const stepsToShow = useMemo(() => {
    let list = scope === "all" ? stepsWithData : stepsWithData.filter((s) => s.def.key === scope);
    if (sectionKeysFilter && sectionKeysFilter.size > 0) {
      list = list.filter((s) => sectionKeysFilter.has(s.def.key));
    }
    return list;
  }, [stepsWithData, scope, sectionKeysFilter]);

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
  const studentDisplay = user?.name ?? comeceData?.comoChamar ?? "Aluno";
  const empresaDisplay = comeceData?.nomeFantasia ?? EMPTY_LABEL;
  const dataInicioDisplay = comeceData?.dataInicio ?? EMPTY_LABEL;
  const today = new Date().toLocaleDateString("pt-BR");

  const sectionStatusList = stepsWithData.map(({ def, status }) => {
    const isCompleted = status === "completed";
    const label = isCompleted ? "Concluído" : "Incompleto";
    return { key: def.key, title: def.title, completed: isCompleted, label };
  });

  const allDataByKey = useMemo(() => {
    const m = new Map<string, Record<string, unknown>>();
    stepsWithData.forEach(({ def, data }) => m.set(def.key, data));
    return m;
  }, [stepsWithData]);

  const s3Diagnostico = allDataByKey.get("diagnostico") ?? {};
  const tempoDeMercadoDisplay = formatValue(s3Diagnostico.s3_tempo_mercado);

  const resumoItems: { label: string; value: string }[] = useMemo(() => {
    const s2 = allDataByKey.get("desafios") ?? {};
    const s3 = allDataByKey.get("diagnostico") ?? {};
    const s4 = allDataByKey.get("produtos") ?? {};
    const s5 = allDataByKey.get("identidade") ?? {};
    return [
      { label: "Identificação (empresa / cliente)", value: `${empresaDisplay} · ${studentDisplay}` },
      { label: "Dados do Comece por Aqui", value: `Empresa: ${empresaDisplay} · Como chamar: ${studentDisplay} · Início: ${dataInicioDisplay}` },
      { label: "Tempo de mercado", value: formatValue(s3.s3_tempo_mercado) },
      { label: "Situação financeira", value: [s3.s3_faturamento_ano, s3.s3_ticket_medio].map((v) => formatValue(v)).join(" / ") },
      { label: "Canais / marketing", value: formatValue(s3.s3_marketing_estrutura) },
      { label: "Presença digital", value: formatValue(s3.s3_plataformas_links) },
      { label: "Perfil do cliente", value: [s3.s3_publico_regiao, s3.s3_faixa_etaria_principal, s3.s3_genero].map((v) => formatValue(v)).join(" · ") },
      { label: "Nível de tecnologia", value: formatScaleChoiceValue(s3.s3_nivel_tecnologia, "s3_nivel_tecnologia") },
      { label: "Sentimento em relação a vendas online", value: formatValue(s2.s2_5) },
      { label: "Metas declaradas", value: [s5.s5_objetivo_faturamento, s5.s5_objetivo_qualitativo].map((v) => formatValue(v)).join(" — ") },
      { label: "Produto principal", value: formatValue(s4.s4_principal_produto_servico) },
    ];
  }, [allDataByKey, empresaDisplay, studentDisplay, dataInicioDisplay]);

  const sectionProgressList = useMemo(() => {
    return stepsWithData.map(({ def, data }) => {
      const blocks = def.blocks.filter((b) => b.type === "field" || b.type === "table");
      let filled = 0;
      for (const b of blocks) {
        const fieldId = b.type === "field" ? b.fieldId : b.fieldId;
        const val = (data as Record<string, unknown>)[fieldId];
        if (b.type === "table") {
          const rows = Array.isArray(val) ? (val as Record<string, unknown>[]) : [];
          const hasData = rows.some((r) => r && typeof r === "object" && Object.values(r).some((v) => String(v ?? "").trim() !== ""));
          if (hasData) filled++;
        } else {
          if (val == null) continue;
          if (Array.isArray(val)) { if (val.length > 0) filled++; continue; }
          if (typeof val === "object") { if (Object.keys(val as object).length > 0) filled++; continue; }
          if (String(val).trim() !== "") filled++;
        }
      }
      const total = blocks.length;
      const pct = total ? Math.round((filled / total) * 100) : 0;
      return { key: def.key, title: def.title, filled, total, pct };
    });
  }, [stepsWithData]);

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Carregando preview...</div>}>
      <div
        id="marco-zero-preview"
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
              <div className="text-xs uppercase tracking-[0.08em] text-slate-500">Método Compass · Bússola de Vendas</div>
              <div className="text-2xl font-bold leading-tight">Carta de Navegação | {module?.title ?? "Marco Zero"}</div>
              <div className="text-sm text-slate-600">
                Empresa: {empresaDisplay} · Cliente: {studentDisplay} · Gerado em {today}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700">
                Progresso · {pct}%
              </div>
              <Button variant="outline" asChild>
                <Link href="/marco-zero">Voltar</Link>
              </Button>
              <Button onClick={() => window.print()}>Salvar PDF</Button>
            </div>
          </div>
        </div>

        <div className="print-only-footer">
          <span>MÉTODO COMPASS · BÚSSOLA DE VENDAS · VocêPode+</span>
          <span>{empresaDisplay} · Gerado em {today}</span>
        </div>

        <main className="container py-6 space-y-8 pb-16" style={{ backgroundColor: "#ffffff", color: "#000000" }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Carregando...
            </div>
          ) : (
            <>
              {/* ——— Capa (página 1) ——— */}
              <section>
                <div className="text-center space-y-4 py-8">
                  <div className="text-xs uppercase tracking-widest text-slate-500">VocêPode+</div>
                  <h1 className="text-2xl font-bold uppercase tracking-tight">Método Compass · Bússola de Vendas</h1>
                  <h2 className="text-xl font-semibold text-slate-700">Carta de Navegação | Marco Zero</h2>
                </div>
                <div className="max-w-md mx-auto space-y-2 text-sm border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                  <div><strong>Empresa:</strong> {empresaDisplay}</div>
                  <div><strong>Cliente:</strong> {studentDisplay}</div>
                  <div><strong>Início do programa:</strong> {dataInicioDisplay}</div>
                  <div><strong>Tempo de mercado:</strong> {tempoDeMercadoDisplay}</div>
                  <div><strong>Gerado em:</strong> {today}</div>
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium">Progresso geral</span>
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
                  <div className="text-sm font-semibold text-slate-700">Progresso por seção</div>
                  {sectionProgressList.map((s) => (
                    <div key={s.key} className="flex items-center gap-2 text-sm">
                      <div className="min-w-[3rem] font-medium text-slate-700">{s.pct}%</div>
                      <Progress value={s.pct} className="h-2 flex-1 max-w-[120px]" />
                      <span className="text-slate-600">{s.title}</span>
                      <span className="text-slate-400 text-xs">({s.filled}/{s.total})</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-semibold text-slate-700">Status (concluído / rascunho)</div>
                  {sectionStatusList.map((s) => (
                    <div key={s.key} className="flex items-center gap-2 text-sm">
                      {s.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      )}
                      <span>{s.title}</span>
                      <span className="text-slate-500">— {s.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* ——— Resumo executivo ——— */}
              <section className="print:break-before-page" style={{ pageBreakBefore: "always" }}>
                <h2 className="text-lg font-bold uppercase tracking-tight border-b border-slate-300 pb-2 mb-4">
                  Resumo executivo
                </h2>
                <div className="space-y-3">
                  {resumoItems.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="font-semibold text-slate-800 min-w-[200px]">{item.label}:</span>
                      <span className="text-slate-700">{item.value}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* ——— Respostas completas por seção ——— */}
              {stepsToShow.map(({ def, data }, sectionIndex) => {
                const sectionNum = MARCO_ZERO_STEPS.findIndex((s) => s.key === def.key) + 1;
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
                      Seção {sectionNum} · {def.title.toUpperCase()}
                    </h2>
                    <div className="space-y-4">
                      {visible.map((b, i) => {
                        if (b.type === "field") {
                          const value = formatValue((data as Record<string, unknown>)[b.fieldId], b);
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
