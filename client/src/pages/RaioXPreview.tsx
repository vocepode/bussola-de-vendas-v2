"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import {
  RAIO_X_STEP_KEYS_ORDER,
  getLabelByStepKey,
  type RaioXStepKey,
} from "@/lib/raio-x/sidebar";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const EMPTY_LABEL = "(não preenchido)";

function formatVal(value: unknown): string {
  if (value == null) return EMPTY_LABEL;
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (Array.isArray(value)) {
    if (value.length === 0) return EMPTY_LABEL;
    return value.map((v) => (typeof v === "object" && v && "username" in v ? String((v as { username?: string }).username) : String(v))).join(", ");
  }
  if (typeof value === "object") return JSON.stringify(value);
  const str = String(value).trim();
  return str === "" ? EMPTY_LABEL : str;
}

function num(m: Record<string, unknown>, key: string): number {
  const v = m[key];
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

function engagementTotalFromRecord(m: Record<string, unknown>): number {
  return num(m, "likes") + num(m, "comentarios") + num(m, "compartilhamentos") + num(m, "repost") + num(m, "salvamentos");
}

function engagementRateFromRecord(m: Record<string, unknown>): number | null {
  const reach = num(m, "reach");
  if (reach <= 0) return null;
  return (num(m, "engagedAccounts") / reach) * 100;
}

function momPctStr(current: number, previous: number): string {
  if (previous <= 0) return current > 0 ? "+100%" : "—";
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

/** Itens da seção Análise: dados do mês atual, anterior e indicadores comparativos para preview/PDF */
function getAnaliseItems(secaoAnalise: Record<string, unknown>, checklist: Record<string, unknown>, printsPorCanal: Record<string, string[]>, data: Record<string, unknown>): { label: string; value: string }[] {
  const mesesRaw = (secaoAnalise.meses ?? []) as Record<string, unknown>[];
  const meses = [...mesesRaw].sort((a, b) => String(b.mes ?? "").localeCompare(String(a.mes ?? "")));
  const mesAtual = meses[0];
  const mesAnterior = meses[1];

  const canalLabels: Record<string, string> = {
    instagram: "Instagram", concorrentes: "Concorrentes", tiktok: "TikTok", youtube: "YouTube",
    site: "Site", landing: "Landing", ecommerce: "E-commerce",
  };
  const printItems: { label: string; value: string }[] = [];
  Object.entries(printsPorCanal).forEach(([canal, urls]) => {
    const urlsFiltered = Array.isArray(urls) ? urls.filter((u): u is string => typeof u === "string" && u.length > 0) : [];
    urlsFiltered.forEach((url, i) => {
      printItems.push({ label: `Print ${canalLabels[canal] ?? canal} ${i + 1}`, value: url });
    });
  });

  const items: { label: string; value: string }[] = [
    { label: "Meses registrados", value: meses.length > 0 ? meses.map((m) => m.mes).filter(Boolean).join(", ") : EMPTY_LABEL },
  ];

  if (mesAtual) {
    const mes = String(mesAtual.mes ?? "");
    items.push({ label: `Mês atual (${mes})`, value: "" });
    items.push({ label: "Visualizações", value: num(mesAtual, "views").toLocaleString("pt-BR") });
    items.push({ label: "Alcance", value: num(mesAtual, "reach").toLocaleString("pt-BR") });
    items.push({ label: "Engajamento total", value: engagementTotalFromRecord(mesAtual).toLocaleString("pt-BR") });
    const er = engagementRateFromRecord(mesAtual);
    items.push({ label: "Taxa de engajamento", value: er != null ? `${er.toFixed(1)}%` : "—" });
    items.push({ label: "Novos seguidores", value: num(mesAtual, "newFollowers").toLocaleString("pt-BR") });
    items.push({ label: "Cliques na bio", value: num(mesAtual, "bioLinkClicks").toLocaleString("pt-BR") });
    items.push({ label: "DMs iniciadas", value: num(mesAtual, "dmsStarted").toLocaleString("pt-BR") });
    items.push({ label: "Conversões", value: num(mesAtual, "conversions").toLocaleString("pt-BR") });
  }

  if (mesAnterior) {
    const mes = String(mesAnterior.mes ?? "");
    items.push({ label: `Mês anterior (${mes})`, value: "" });
    items.push({ label: "Visualizações", value: num(mesAnterior, "views").toLocaleString("pt-BR") });
    items.push({ label: "Alcance", value: num(mesAnterior, "reach").toLocaleString("pt-BR") });
    items.push({ label: "Engajamento total", value: engagementTotalFromRecord(mesAnterior).toLocaleString("pt-BR") });
    const er = engagementRateFromRecord(mesAnterior);
    items.push({ label: "Taxa de engajamento", value: er != null ? `${er.toFixed(1)}%` : "—" });
    items.push({ label: "Novos seguidores", value: num(mesAnterior, "newFollowers").toLocaleString("pt-BR") });
    items.push({ label: "Cliques na bio", value: num(mesAnterior, "bioLinkClicks").toLocaleString("pt-BR") });
    items.push({ label: "DMs iniciadas", value: num(mesAnterior, "dmsStarted").toLocaleString("pt-BR") });
    items.push({ label: "Conversões", value: num(mesAnterior, "conversions").toLocaleString("pt-BR") });
  }

  if (mesAtual && mesAnterior) {
    items.push({ label: "Indicadores comparativos (MoM)", value: "" });
    items.push({ label: "Alcance", value: momPctStr(num(mesAtual, "reach"), num(mesAnterior, "reach")) });
    items.push({ label: "Engajamento total", value: momPctStr(engagementTotalFromRecord(mesAtual), engagementTotalFromRecord(mesAnterior)) });
    const erA = engagementRateFromRecord(mesAtual) ?? 0;
    const erB = engagementRateFromRecord(mesAnterior) ?? 0;
    items.push({ label: "Taxa de engajamento", value: momPctStr(erA, erB) });
    items.push({ label: "Novos seguidores", value: momPctStr(num(mesAtual, "newFollowers"), num(mesAnterior, "newFollowers")) });
    items.push({ label: "Cliques na bio", value: momPctStr(num(mesAtual, "bioLinkClicks"), num(mesAnterior, "bioLinkClicks")) });
  }

  return [
    ...items,
    ...printItems,
    { label: "Análise Instagram completa", value: checklist.analiseInstagramCompleta ? "Sim" : "Não" },
    { label: "Teste 3 segundos aprovado", value: checklist.passou3Segundos ? "Sim" : "Não" },
    { label: "Bio otimizada", value: checklist.bioOtimizada ? "Sim" : "Não" },
    { label: "Destaques organizados", value: checklist.destaquesOrganizados ? "Sim" : "Não" },
    { label: "Link funcional", value: checklist.linkFuncional ? "Sim" : "Não" },
    { label: "Módulo concluído", value: data.concluido ? "Sim" : "Não" },
  ];
}

function getStepItems(stepKey: RaioXStepKey, data: Record<string, unknown>): { label: string; value: string }[] {
  const redes = (data.secaoRedesSociais ?? {}) as Record<string, unknown>;
  const web = (data.secaoWeb ?? {}) as Record<string, unknown>;
  const instagram = (redes.instagram ?? {}) as Record<string, unknown>;
  const meuNegocio = (instagram.meuNegocio ?? {}) as Record<string, unknown>;
  const bio = (meuNegocio.bio ?? {}) as Record<string, unknown>;
  const concorrentes = (instagram.concorrentes ?? {}) as Record<string, unknown>;
  const tiktok = (redes.tiktok ?? {}) as Record<string, unknown>;
  const youtube = (redes.youtube ?? {}) as Record<string, unknown>;
  const ecommerce = (web.ecommerce ?? {}) as Record<string, unknown>;
  const landingPage = (web.landingPage ?? {}) as Record<string, unknown>;
  const site = (web.site ?? {}) as Record<string, unknown>;
  const checklist = (data.checklistConclusao ?? {}) as Record<string, unknown>;
  const secaoAnalise = (data.secaoAnalise ?? {}) as Record<string, unknown>;
  const meses = (secaoAnalise.meses ?? []) as { mes?: string }[];
  const printsPorCanal = (secaoAnalise.printsPorCanal ?? {}) as Record<string, string[]>;

  const campo = (o: unknown) => (o && typeof o === "object" && "valor" in o ? String((o as { valor?: string }).valor ?? "") : "");

  switch (stepKey) {
    case "redes_sociais.instagram": {
      const l1 = (bio.linha1Transformacao as unknown) as { valor?: string } | undefined;
      const l2 = (bio.linha2Autoridade as unknown) as { valor?: string } | undefined;
      const l3 = (bio.linha3Complemento as unknown) as { valor?: string } | undefined;
      return [
        { label: "Nome de usuário", value: campo(meuNegocio.nomeUsuario) },
        { label: "Nome na bio", value: campo(meuNegocio.nomeBio) },
        { label: "Linha 1 (transformação)", value: l1?.valor?.trim() || EMPTY_LABEL },
        { label: "Linha 2 (autoridade)", value: l2?.valor?.trim() || EMPTY_LABEL },
        { label: "Linha 3 (complemento)", value: l3?.valor?.trim() || EMPTY_LABEL },
        { label: "Chamada à ação", value: campo(meuNegocio.chamadaAcao) },
        { label: "Links", value: campo(meuNegocio.links) },
      ];
    }
    case "redes_sociais.concorrentes": {
      const list = Array.isArray(concorrentes.concorrentes) ? concorrentes.concorrentes as Record<string, unknown>[] : [];
      const conclusao = String(concorrentes.conclusao ?? "").trim();
      const dims = ["clareza", "fotoPerfil", "bio", "destaques", "feed", "links"] as const;
      const dimLabel: Record<string, string> = { clareza: "Clareza", fotoPerfil: "Foto de perfil", bio: "Bio", destaques: "Destaques", feed: "Feed", links: "Links" };
      const items: { label: string; value: string }[] = [];
      list.slice(0, 5).forEach((c, i) => {
        items.push({ label: `Concorrente ${i + 1}`, value: formatVal(c.username ?? c.id) });
        const analise = (c.analise ?? {}) as Record<string, unknown>;
        dims.forEach((dim) => {
          const v = analise[dim];
          const avaliacao = v != null && typeof v === "object" && "avaliacao" in v
            ? (v as { avaliacao?: number | null }).avaliacao
            : typeof v === "number" ? v : null;
          if (avaliacao != null) {
            items.push({ label: `  ${dimLabel[dim] ?? dim} (0-5)`, value: String(avaliacao) });
          }
        });
      });
      items.push({ label: "Conclusão da análise", value: conclusao || EMPTY_LABEL });
      return items;
    }
    case "redes_sociais.tiktok":
      return [
        { label: "Ativo", value: tiktok.ativo ? "Sim" : "Não" },
        { label: "Nome de usuário", value: campo(tiktok.nomeUsuario) },
        { label: "Nota geral", value: formatVal(tiktok.notaGeral) },
      ];
    case "redes_sociais.youtube":
      return [
        { label: "Ativo", value: youtube.ativo ? "Sim" : "Não" },
        { label: "Canal / URL", value: campo(youtube.nomeCanal) || campo(youtube.identificadorUrl) },
        { label: "Nota geral", value: formatVal(youtube.notaGeral) },
      ];
    case "web.ecommerce":
      return [
        { label: "Ativo", value: ecommerce.ativo ? "Sim" : "Não" },
        { label: "URL", value: formatVal(ecommerce.url) },
        { label: "Nota geral", value: formatVal(ecommerce.notaGeral) },
        { label: "Prioridades", value: formatVal(ecommerce.prioridades) },
      ];
    case "web.landing":
      return [
        { label: "Ativo", value: landingPage.ativo ? "Sim" : "Não" },
        { label: "URL", value: formatVal(landingPage.url) },
        { label: "Nota geral", value: formatVal(landingPage.notaGeral) },
        { label: "Prioridades", value: formatVal(landingPage.prioridades) },
      ];
    case "web.site":
      return [
        { label: "Ativo", value: site.ativo ? "Sim" : "Não" },
        { label: "URL", value: formatVal(site.url) },
        { label: "Nota geral", value: formatVal(site.notaGeral) },
        { label: "Prioridades", value: formatVal(site.prioridades) },
      ];
    case "conclusao":
      return getAnaliseItems(secaoAnalise, checklist, printsPorCanal, data);
    case "analise.em_breve":
      return [{ label: "Análise", value: "Em breve — esta seção está em evolução com novas melhorias." }];
    default:
      return [];
  }
}

export default function RaioXPreview() {
  const search = useSearchParams();
  const scope = (search?.get("step") as RaioXStepKey | "all" | null) ?? "all";
  const pdfFull = search?.get("pdf") === "full";

  const { user } = useAuth();
  const { data, isLoading, isError } = trpc.raioX.get.useQuery();

  const today = new Date().toLocaleDateString("pt-BR");
  const studentDisplay = user?.name ?? "—";
  const raioXData = data?.bloqueado ? null : (data?.data as Record<string, unknown> | undefined);
  const pct = raioXData && typeof raioXData.progressoGeral === "number" ? raioXData.progressoGeral : 0;
  const completedSections = Math.round((pct / 100) * 3);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    html.classList.remove("dark");
    html.classList.add("preview-light-theme");
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.color = "#000000";
    return () => {
      html.classList.remove("preview-light-theme");
      html.classList.add("dark");
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    };
  }, []);

  useEffect(() => {
    if (!pdfFull || isLoading || isError) return;
    const t = setTimeout(() => window.print(), 500);
    return () => clearTimeout(t);
  }, [pdfFull, isLoading, isError]);

  const stepsWithData = useMemo(() => {
    if (!raioXData) return [];
    return RAIO_X_STEP_KEYS_ORDER.map((stepKey) => ({
      stepKey,
      label: getLabelByStepKey(stepKey),
      items: getStepItems(stepKey, raioXData),
    }));
  }, [raioXData]);

  const stepsToShow = useMemo(() => {
    return scope === "all" ? stepsWithData : stepsWithData.filter((s) => s.stepKey === scope);
  }, [stepsWithData, scope]);

  const sectionStatusList = useMemo(() => {
    const sectionKeys: { key: string; title: string }[] = [
      { key: "instagram", title: "Instagram" },
      { key: "outras_redes", title: "Outras redes" },
      { key: "web", title: "Web" },
    ];
    return sectionKeys.map((s, i) => {
      const threshold = ((i + 1) / 3) * 100;
      const completed = pct >= threshold || (i === 2 && !!raioXData?.concluido);
      return { ...s, completed };
    });
  }, [pct, raioXData?.concluido]);

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Carregando preview...</div>}>
      <div
        id="raio-x-preview"
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
              <div className="text-2xl font-bold leading-tight">Raio-X · Análise de canais</div>
              <div className="text-sm text-slate-600">
                Cliente: {studentDisplay} · Gerado em {today}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700">
                Progresso · {pct}%
              </div>
              <Button variant="outline" asChild>
                <Link href="/raio-x">Voltar</Link>
              </Button>
              <Button onClick={() => window.print()}>Imprimir / Salvar PDF</Button>
            </div>
          </div>
        </div>

        <div className="print-only-footer">
          <span>MÉTODO COMPASS · BÚSSOLA DE VENDAS · VocêPode+</span>
          <span>{studentDisplay} · Gerado em {today} · Raio-X</span>
        </div>

        <main className="container py-6 space-y-8 pb-16" style={{ backgroundColor: "#ffffff", color: "#000000" }}>
          {data?.bloqueado ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
              Complete o pilar Norte para desbloquear o Raio-X.
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Carregando...
            </div>
          ) : isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              Não foi possível carregar os dados do Raio-X.
            </div>
          ) : (
            <>
              {/* ——— Capa (igual Norte) ——— */}
              <section>
                <div className="text-center space-y-4 py-8">
                  <div className="text-xs uppercase tracking-widest text-slate-500">VocêPode+</div>
                  <h1 className="text-2xl font-bold uppercase tracking-tight">Método COMPASS · Bússola de Vendas</h1>
                  <h2 className="text-xl font-semibold text-slate-700">Raio-X · Análise de canais</h2>
                </div>
                <div className="max-w-md mx-auto space-y-2 text-sm border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                  <div><strong>Cliente:</strong> {studentDisplay}</div>
                  <div><strong>Gerado em:</strong> {today}</div>
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium">Progresso</span>
                    <span className="font-semibold">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-3" />
                  <p className="text-xs text-slate-600 mt-1">
                    {completedSections} de 3 seções concluídas
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

              {/* ——— Conteúdo por etapa (igual Norte) ——— */}
              {stepsToShow.map(({ stepKey, label, items }, sectionIndex) => (
                <Card
                  key={stepKey}
                  className="p-5 border border-slate-200 shadow-sm bg-white text-black print:break-before-page"
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#000000",
                    ...(sectionIndex > 0 ? { pageBreakBefore: "always" } : {}),
                  }}
                >
                  <h2 className="text-lg font-bold uppercase tracking-tight border-b border-slate-200 pb-2 mb-4">
                    Seção {RAIO_X_STEP_KEYS_ORDER.indexOf(stepKey) + 1} · {label.toUpperCase()}
                  </h2>
                  <div className="space-y-4">
                    {items.length === 0 ? (
                      <p className="text-sm text-slate-600">{EMPTY_LABEL}</p>
                    ) : (
                      items.map((item, i) => {
                        const isImageUrl =
                          typeof item.value === "string" &&
                          (item.value.startsWith("http://") || item.value.startsWith("https://"));
                        const isSectionHeader = item.value === "" && (item.label.includes("Mês ") || item.label.includes("Indicadores comparativos"));
                        return (
                          <div key={i}>
                            {isSectionHeader ? (
                              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 mt-4 first:mt-0">{item.label}</div>
                            ) : (
                              <>
                                <div className="font-semibold text-slate-800">{item.label}</div>
                                {isImageUrl ? (
                              <div className="mt-1">
                                <img
                                  src={item.value}
                                  alt={item.label}
                                  className="max-w-full max-h-48 object-contain rounded border border-slate-200"
                                />
                                <a
                                  href={item.value}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-slate-600 hover:underline mt-1 inline-block"
                                >
                                  Ver print
                                </a>
                              </div>
                            ) : (
                              <div className="text-sm text-slate-700 whitespace-pre-wrap">
                                {item.value}
                              </div>
                            )}
                              </>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </Card>
              ))}
            </>
          )}
        </main>
      </div>
    </Suspense>
  );
}
