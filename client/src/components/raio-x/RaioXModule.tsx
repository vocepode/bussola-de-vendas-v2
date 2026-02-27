"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MeuInstagram } from "./secao-01-redes-sociais/instagram/MeuInstagram";
import { Concorrentes } from "./secao-01-redes-sociais/instagram/Concorrentes";
import { MeuTikTok } from "./secao-01-redes-sociais/tiktok/MeuTikTok";
import { MeuYoutube } from "./secao-01-redes-sociais/youtube/MeuYoutube";
import { Ecommerce } from "./secao-02-web/Ecommerce";
import { LandingPage } from "./secao-02-web/LandingPage";
import { Site } from "./secao-02-web/Site";
import {
  mergeSecaoRedesSociais,
  mergeSecaoWeb,
  mergeSecaoAnalise,
  type SecaoRedesSociais as SecaoRedesSociaisType,
  type SecaoWeb as SecaoWebType,
  type SecaoAnalise as SecaoAnaliseType,
  type NorteData,
  type RaioXState,
} from "@/lib/raio-x/schema";
import {
  RAIO_X_SIDEBAR_TREE,
  RAIO_X_STEP_KEYS_ORDER,
  getLabelByStepKey,
  type RaioXSidebarNode,
  type RaioXStepKey,
} from "@/lib/raio-x/sidebar";
import { getModuleHref, PILLARS_ORDER } from "@/constants/pillars";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { CheckCircle2, Circle, ChevronDown, ChevronRight, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

function RaioXSidebarTree({
  nodes,
  activeStepKey,
  setActiveStepKey,
  cardClass,
  titleClass,
  buttonInactiveClass,
}: {
  nodes: RaioXSidebarNode[];
  activeStepKey: RaioXStepKey;
  setActiveStepKey: (k: RaioXStepKey) => void;
  cardClass: string;
  titleClass: string;
  buttonInactiveClass: string;
}) {
  const [openFolders, setOpenFolders] = useState<Set<string>>(() => new Set(["Instagram", "Outras redes", "Web"]));

  const toggleFolder = (label: string) => {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <div className="space-y-0.5">
      {nodes.map((node) => {
        if (node.type === "folder") {
          const isOpen = openFolders.has(node.label);
          return (
            <div key={node.label}>
              <button
                type="button"
                className="w-full text-left py-2 rounded-md transition-colors flex items-center gap-2 px-2 font-medium text-sm hover:bg-muted"
                onClick={() => toggleFolder(node.label)}
              >
                {isOpen ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                <span className="truncate">{node.label}</span>
              </button>
              {isOpen && (
                <div className="pl-4 border-l border-muted ml-2 space-y-0.5">
                  <RaioXSidebarTree
                    nodes={node.children}
                    activeStepKey={activeStepKey}
                    setActiveStepKey={setActiveStepKey}
                    cardClass={cardClass}
                    titleClass={titleClass}
                    buttonInactiveClass={buttonInactiveClass}
                  />
                </div>
              )}
            </div>
          );
        }
        const isActive = node.stepKey === activeStepKey;
        return (
          <button
            key={node.stepKey}
            type="button"
            className={cn(
              "w-full text-left py-2 rounded-md transition-colors flex items-center justify-between gap-2 px-2",
              isActive ? "bg-violet-500/10 text-violet-600 dark:text-violet-400" : buttonInactiveClass
            )}
            onClick={() => setActiveStepKey(node.stepKey)}
          >
            <span className="truncate text-sm">{node.label}</span>
            {isActive ? <Circle className="w-4 h-4 shrink-0" /> : <Circle className="w-4 h-4 shrink-0 opacity-30" />}
          </button>
        );
      })}
    </div>
  );
}

const DEBOUNCE_MS = 2500;
/** Debounce para a seção Análise (dados do mês). */
const DEBOUNCE_ANALISE_MS = 1500;

export function RaioXModule({
  data,
  norteData,
  progresso: progressoInicial,
  onSaveSecao,
  onConcluirEtapa,
  isConcluindoEtapa,
  etapasConcluidas: etapasConcluidasProp = [],
}: {
  data: {
    progressoGeral?: number;
    secaoRedesSociais?: Record<string, unknown>;
    secaoWeb?: Record<string, unknown>;
    secaoAnalise?: Record<string, unknown>;
    etapasConcluidas?: string[];
    concluido?: boolean;
  } | null | undefined;
  norteData: NorteData | Record<string, unknown> | null | undefined;
  progresso: number;
  onSaveSecao?: (secao: "redes_sociais" | "web" | "analise", payload: Record<string, unknown>) => void;
  onConcluirEtapa?: (secao: "redes_sociais" | "web" | "analise") => void;
  isConcluindoEtapa?: boolean;
  etapasConcluidas?: string[];
}) {
  const etapasConcluidas = Array.isArray(data?.etapasConcluidas) ? data.etapasConcluidas : etapasConcluidasProp;
  const [activeStepKey, setActiveStepKey] = useState<RaioXStepKey>("redes_sociais.instagram");
  const [secaoRedesSociais, setSecaoRedesSociais] = useState<SecaoRedesSociaisType>(() =>
    mergeSecaoRedesSociais(data?.secaoRedesSociais)
  );
  const [secaoWeb, setSecaoWeb] = useState<SecaoWebType>(() =>
    mergeSecaoWeb(data?.secaoWeb)
  );
  const [secaoAnalise, setSecaoAnalise] = useState<SecaoAnaliseType>(() =>
    mergeSecaoAnalise(data?.secaoAnalise)
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerAnaliseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current == null) {
      setSecaoRedesSociais((prev) =>
        mergeSecaoRedesSociais((data?.secaoRedesSociais ?? prev) as Record<string, unknown> | undefined)
      );
      setSecaoWeb((prev) =>
        mergeSecaoWeb((data?.secaoWeb ?? prev) as Record<string, unknown> | undefined)
      );
    }
    if (timerAnaliseRef.current == null) {
      setSecaoAnalise((prev) =>
        mergeSecaoAnalise((data?.secaoAnalise ?? prev) as Record<string, unknown> | undefined)
      );
    }
  }, [data?.secaoRedesSociais, data?.secaoWeb, data?.secaoAnalise]);

  const saveRedes = useCallback(
    (payload: SecaoRedesSociaisType) => {
      setSecaoRedesSociais(payload);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onSaveSecao?.("redes_sociais", payload as unknown as Record<string, unknown>);
        timerRef.current = null;
      }, DEBOUNCE_MS);
    },
    [onSaveSecao]
  );

  const saveWeb = useCallback(
    (payload: SecaoWebType) => {
      setSecaoWeb(payload);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onSaveSecao?.("web", payload as unknown as Record<string, unknown>);
        timerRef.current = null;
      }, DEBOUNCE_MS);
    },
    [onSaveSecao]
  );

  const saveAnalise = useCallback(
    (payload: SecaoAnaliseType, options?: { immediate?: boolean }) => {
      setSecaoAnalise(payload);
      if (timerAnaliseRef.current) {
        clearTimeout(timerAnaliseRef.current);
        timerAnaliseRef.current = null;
      }
      const flush = () => {
        onSaveSecao?.("analise", payload as unknown as Record<string, unknown>);
      };
      if (options?.immediate) {
        flush();
      } else {
        timerAnaliseRef.current = setTimeout(() => {
          flush();
          timerAnaliseRef.current = null;
        }, DEBOUNCE_ANALISE_MS);
      }
    },
    [onSaveSecao, secaoRedesSociais, secaoWeb]
  );

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (timerAnaliseRef.current) clearTimeout(timerAnaliseRef.current);
  }, []);

  const progressoLocal = progressoInicial ?? 0;
  const norteDataTyped = norteData as NorteData | undefined;

  const stateForChecklist: RaioXState = useMemo(
    () => ({
      version: "2.0.3",
      userId: "",
      criadoEm: new Date(),
      atualizadoEm: new Date(),
      norteCompleto: true,
      norteData: null,
      secaoRedesSociais,
      secaoWeb,
      secaoAnalise,
      progressoGeral: progressoLocal,
      checklistConclusao: {
        analiseInstagramCompleta: !!(
          secaoRedesSociais.instagram.meuNegocio.bio.linha1Transformacao.valor &&
          secaoRedesSociais.instagram.meuNegocio.chamadaAcao.valor
        ),
        passou3Segundos:
          secaoRedesSociais.instagram.meuNegocio.teste3Segundos.realizado &&
          secaoRedesSociais.instagram.meuNegocio.teste3Segundos.resultado === "aprovado",
        bioOtimizada: !!secaoRedesSociais.instagram.meuNegocio.chamadaAcao.valor,
        destaquesOrganizados: secaoRedesSociais.instagram.meuNegocio.destaques.organizados,
        linkFuncional: !!secaoRedesSociais.instagram.meuNegocio.links.valor,
        feedIdentidadeVisual: secaoRedesSociais.instagram.meuNegocio.feed.ultimos9Posts.identidadeVisual != null,
        analise3Concorrentes: secaoRedesSociais.instagram.concorrentes.concorrentes.length >= 3,
        melhorasImplementadas: !!secaoRedesSociais.instagram.concorrentes.conclusao,
        provaSocialVisivel: secaoRedesSociais.instagram.meuNegocio.feed.provaSocial.visivel,
      },
      concluido: data?.concluido ?? false,
    }),
    [secaoRedesSociais, secaoWeb, secaoAnalise, progressoLocal, data?.concluido]
  );

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const cardClass = cn(
    "border-border bg-card",
    isDark && "border-[#262626] bg-[#161616]"
  );
  const titleClass = cn("text-base", isDark && "text-white");
  const buttonInactiveClass = isDark ? "hover:bg-white/10" : "hover:bg-muted";

  const updateRedes = useCallback(
    (patch: Partial<SecaoRedesSociaisType>) => {
      saveRedes({ ...secaoRedesSociais, ...patch });
    },
    [secaoRedesSociais, saveRedes]
  );
  const updateWeb = useCallback(
    (patch: Partial<SecaoWebType>) => {
      saveWeb({ ...secaoWeb, ...patch });
    },
    [secaoWeb, saveWeb]
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="lg:sticky lg:top-[84px] lg:h-[calc(100vh-120px)]">
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className={titleClass}>RAIO-X</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0.5">
            <RaioXSidebarTree
              nodes={RAIO_X_SIDEBAR_TREE}
              activeStepKey={activeStepKey}
              setActiveStepKey={setActiveStepKey}
              cardClass={cardClass}
              titleClass={titleClass}
              buttonInactiveClass={buttonInactiveClass}
            />
          </CardContent>
        </Card>
      </aside>

      <section className="space-y-4">
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className={titleClass}>{getLabelByStepKey(activeStepKey)}</CardTitle>
          </CardHeader>
          <CardContent className={isDark ? "text-white/90" : undefined}>
            {activeStepKey === "redes_sociais.instagram" && (
              <MeuInstagram
                data={secaoRedesSociais.instagram.meuNegocio}
                norteData={norteDataTyped}
                onChange={(meuNegocio) => updateRedes({ instagram: { ...secaoRedesSociais.instagram, meuNegocio } })}
              />
            )}
            {activeStepKey === "redes_sociais.concorrentes" && (
              <Concorrentes
                data={secaoRedesSociais.instagram.concorrentes}
                onChange={(concorrentes) => updateRedes({ instagram: { ...secaoRedesSociais.instagram, concorrentes } })}
              />
            )}
            {activeStepKey === "redes_sociais.tiktok" && (
              <MeuTikTok data={secaoRedesSociais.tiktok} onChange={(tiktok) => updateRedes({ tiktok })} />
            )}
            {activeStepKey === "redes_sociais.youtube" && (
              <MeuYoutube data={secaoRedesSociais.youtube} onChange={(youtube) => updateRedes({ youtube })} />
            )}
            {activeStepKey === "web.ecommerce" && (
              <Ecommerce data={secaoWeb.ecommerce} onChange={(ecommerce) => updateWeb({ ecommerce })} />
            )}
            {activeStepKey === "web.landing" && (
              <LandingPage data={secaoWeb.landingPage} onChange={(landingPage) => updateWeb({ landingPage })} />
            )}
            {activeStepKey === "web.site" && (
              <Site data={secaoWeb.site} onChange={(site) => updateWeb({ site })} />
            )}
            {/* Análise: v1 = aviso "Em breve". Estrutura completa (SecaoAnaliseContainer) preservada para v2 em ./secao-03-analise/ */}
            {activeStepKey === "analise.em_breve" && (
              <Card className={cardClass}>
                <CardHeader>
                  <CardTitle className={titleClass}>Análise — Em breve</CardTitle>
                </CardHeader>
                <CardContent className={cn("space-y-3", isDark ? "text-white/90" : "text-muted-foreground")}>
                  <p className="text-sm">
                    Esta seção está em evolução. Em breve você terá:
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    <li>Registro de prints e métricas do Instagram por mês</li>
                    <li>Dashboard com gráficos e indicadores de desempenho</li>
                    <li>Comparativo mês a mês e conclusão da etapa Análise</li>
                  </ul>
                  <p className="text-sm pt-2">
                    Por enquanto, conclua as etapas <strong>Instagram</strong> e <strong>Web</strong> para seguir com o Raio-X.
                  </p>
                </CardContent>
              </Card>
            )}
            <div className="pt-8 mt-8 flex flex-wrap items-center gap-3 border-t border-border">
              {(() => {
                const stepIndex = RAIO_X_STEP_KEYS_ORDER.indexOf(activeStepKey);
                const prevStepKey = stepIndex > 0 ? RAIO_X_STEP_KEYS_ORDER[stepIndex - 1] : null;
                const nextStepKey = stepIndex >= 0 && stepIndex < RAIO_X_STEP_KEYS_ORDER.length - 1
                  ? RAIO_X_STEP_KEYS_ORDER[stepIndex + 1]
                  : null;
                const pillarIndex = PILLARS_ORDER.findIndex((p) => p.slug === "raio-x");
                const nextPilar = pillarIndex >= 0 && pillarIndex < PILLARS_ORDER.length - 1 ? PILLARS_ORDER[pillarIndex + 1] : null;
                const nextPilarHref = nextPilar ? (nextPilar.href ?? getModuleHref(nextPilar.slug)) : null;
                const secaoAtual: "redes_sociais" | "web" | "analise" | null =
                  activeStepKey === "redes_sociais.instagram" ||
                  activeStepKey === "redes_sociais.concorrentes" ||
                  activeStepKey === "redes_sociais.tiktok" ||
                  activeStepKey === "redes_sociais.youtube"
                    ? "redes_sociais"
                    : activeStepKey === "web.site" || activeStepKey === "web.landing" || activeStepKey === "web.ecommerce"
                      ? "web"
                      : activeStepKey === "analise.em_breve"
                        ? "analise"
                        : null;
                const secaoJaConcluida = secaoAtual != null && etapasConcluidas.includes(secaoAtual);
                return (
                  <>
                    {prevStepKey ? (
                      <Button variant="outline" size="sm" onClick={() => setActiveStepKey(prevStepKey)}>
                        ← Seção anterior
                      </Button>
                    ) : null}
                    {nextStepKey ? (
                      <Button size="sm" onClick={() => setActiveStepKey(nextStepKey)}>
                        Avançar →
                      </Button>
                    ) : nextPilarHref ? (
                      <Link href={nextPilarHref}>
                        <Button size="sm">Avançar → Próximo pilar</Button>
                      </Link>
                    ) : null}
                    {secaoAtual && onConcluirEtapa ? (
                      secaoJaConcluida ? (
                        <span className="inline-flex items-center gap-2 rounded-md border border-green-500/50 bg-green-500/10 px-3 py-2 text-sm font-medium text-green-700 dark:text-green-400">
                          <CheckCircle2 className="h-4 w-4" />
                          Etapa concluída
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => onConcluirEtapa(secaoAtual)}
                          disabled={isConcluindoEtapa}
                        >
                          {isConcluindoEtapa ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Concluindo…
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Concluir etapa
                            </>
                          )}
                        </Button>
                      )
                    ) : null}
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export function BloqueioNorte() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/5 p-8 text-center">
      <Lock className="mb-4 h-12 w-12 text-amber-600" />
      <h2 className="mb-2 text-xl font-semibold text-foreground">Complete o Norte primeiro</h2>
      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        Impossível fazer Raio-X sem Norte definido.
        <br />
        Você precisa saber <strong>onde quer chegar</strong> antes de analisar <strong>onde está</strong>.
      </p>
      <a
        href="/norte"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Completar o Norte →
      </a>
    </div>
  );
}
