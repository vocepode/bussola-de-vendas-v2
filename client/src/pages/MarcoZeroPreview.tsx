"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { MARCO_ZERO_STEPS } from "@/marcoZero/schema";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

type StepKey = (typeof MARCO_ZERO_STEPS)[number]["key"];

export default function MarcoZeroPreview() {
  const search = useSearchParams();
  const scope = (search?.get("step") as StepKey | "all" | null) ?? "all";

  const { user } = useAuth();
  const { data: module } = trpc.modules.getBySlug.useQuery({ slug: "marco-zero" }, { enabled: true });
  const { data: progress } = trpc.workspaces.getProgressBySlug.useQuery({ slug: "marco-zero" });
  const { data: workspace, isLoading } = trpc.workspaces.getWorkspaceStateBySlug.useQuery({ slug: "marco-zero" });

  const stepsWithData = useMemo(() => {
    const steps = workspace?.steps ?? [];
    const byTitle = new Map<string, any>(steps.map((s) => [s.title?.toLowerCase() ?? "", s]));
    return MARCO_ZERO_STEPS.map((def) => {
      const match =
        steps.find((s) => (s.title ?? "").toLowerCase().includes((def.lessonTitleIncludes ?? def.title).toLowerCase())) ??
        byTitle.get(def.title.toLowerCase());
      return { def, data: match?.data ?? {} };
    });
  }, [workspace?.steps]);

  const stepsToShow =
    scope === "all"
      ? stepsWithData
      : stepsWithData.filter((s) => s.def.key === scope);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.add("bg-white");
    return () => document.body.classList.remove("bg-white");
  }, []);

  const pct = progress?.percentage ?? 0;
  const studentDisplay = user?.name ?? "Aluno";
  const status = pct >= 100 ? "Finalizado" : pct > 0 ? "Incompleto" : "À fazer";
  const today = new Date().toLocaleDateString("pt-BR");

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Carregando preview...</div>}>
    <div className="min-h-screen bg-white text-slate-900">
      <div className="border-b bg-white sticky top-0 z-20">
        <div className="container flex flex-wrap items-center gap-3 py-4">
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-[0.08em] text-slate-500">Método Compass · Bússola de Vendas</div>
            <div className="text-2xl font-bold leading-tight">Carta de Navegação | {module?.title ?? "Marco Zero"}</div>
            <div className="text-sm text-slate-600">
              Relatório Completo - Empresa: [—] · {studentDisplay} · {today}
            </div>
            <div className="text-sm text-slate-600">Status: [Finalizado] / [Incompleto] / [ À fazer ]</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700">
              Progresso · {pct}%
            </div>
            <Button variant="outline" onClick={() => window.history.back()}>
              Voltar
            </Button>
            <Button onClick={() => window.print()}>Salvar PDF</Button>
          </div>
        </div>
      </div>

      <main className="container py-6 space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Respostas - Marco Zero</h2>
          <span className="text-sm text-slate-500">Leitura por exercício</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> Carregando...
          </div>
        ) : null}

        {!isLoading &&
          stepsToShow.map(({ def, data }, idx) => (
            <Card
              key={def.key}
              className="p-5 border-slate-200 shadow-sm"
              style={idx > 0 ? { pageBreakBefore: "always", breakBefore: "page" } : undefined}
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3 mb-3">
                <div>
                  <div className="text-xs text-slate-500">Marco Zero</div>
                  <div className="text-lg font-semibold text-slate-800">
                    {def.key === "jornada" ? "Sua jornada até aqui" : def.title}
                  </div>
                </div>
                <div className="text-right text-sm text-slate-500">
                  Progresso
                  <div className="text-base font-semibold text-slate-800">{pct}%</div>
                </div>
              </div>

              <div className="space-y-4">
                {def.blocks
                  .filter((b) => b.type === "field" || b.type === "table")
                  .map((b, i) => {
                    if (b.type === "field") {
                      const value = formatValue((data as any)[b.fieldId]);
                      return (
                        <div key={i}>
                          <div className="font-semibold text-slate-800">{b.label}</div>
                          <div className="text-sm text-slate-700 whitespace-pre-wrap">{value}</div>
                        </div>
                      );
                    }
                    const rows = Array.isArray((data as any)[b.fieldId])
                      ? ((data as any)[b.fieldId] as any[]).filter((r) => r && typeof r === "object")
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
                                    —
                                  </td>
                                </tr>
                              ) : (
                                rows.map((r, ridx) => (
                                  <tr key={ridx}>
                                    {b.columns.map((c) => (
                                      <td key={c.key} className="border border-slate-200 px-2 py-1">
                                        {String((r as any)[c.key] ?? "")}
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
                  })}
              </div>
            </Card>
          ))}
      </main>
    </div>
    </Suspense>
  );
}

function formatValue(value: unknown): string {
  if (value == null) return "—";
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    return value.map((v) => (typeof v === "string" ? v : JSON.stringify(v))).join(", ");
  }
  if (typeof value === "object") return JSON.stringify(value);
  const str = String(value);
  return str.trim() === "" ? "—" : str;
}
