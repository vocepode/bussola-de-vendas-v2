"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/_core/hooks/useAuth";
import { useRequirePillarAccess } from "@/_core/hooks/useRequirePillarAccess";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowLeft, CheckCircle2, Circle, AlertTriangle, Printer, FileDown, Eye, ChevronDown, ChevronRight, Lock } from "lucide-react";
import { getLoginUrl } from "@/const";
import { getModuleHref, PILLARS_ORDER } from "@/constants/pillars";
import { listNorthSubsteps, NORTH_SIDEBAR_TREE, isNorthSidebarStep, type NorthSidebarNode } from "@/north/schema";
import { NorthStepForm } from "@/components/north/NorthStepForm";
import { buildStepPrintHtml, buildAllStepsPrintHtml } from "@/lib/workspacePrint";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const SUBSTEPS = listNorthSubsteps();
type StepKey = (typeof SUBSTEPS)[number]["key"];

function NorthSidebarTree(props: {
  nodes: NorthSidebarNode[];
  activeStep: StepKey;
  setActiveStep: (k: StepKey) => void;
  lessonIdByStepKey: Map<StepKey, number>;
  statusByStep: Partial<Record<StepKey, "draft" | "completed">>;
  isLocked: (stepKey: StepKey) => boolean;
}) {
  const { nodes, activeStep, setActiveStep, lessonIdByStepKey, statusByStep, isLocked } = props;
  const [openFolders, setOpenFolders] = useState<Set<string>>(() => new Set(["Matrioska", "Sua Audiência", "Posicionamento"]));

  const toggleFolder = (key: string) => {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
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
                  <NorthSidebarTree
                    nodes={node.children}
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                    lessonIdByStepKey={lessonIdByStepKey}
                    statusByStep={statusByStep}
                    isLocked={isLocked}
                  />
                </div>
              )}
            </div>
          );
        }
        const stepKey = node.stepKey as StepKey;
        const isActive = stepKey === activeStep;
        const resolvedLessonId = lessonIdByStepKey.get(stepKey);
        const isResolved = !!resolvedLessonId;
        const stepStatus = statusByStep[stepKey];
        return (
          <button
            key={node.stepKey}
            type="button"
            className={cn(
              "w-full text-left py-2 rounded-md transition-colors flex items-center justify-between gap-2 px-2",
              isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
            )}
            onClick={() => setActiveStep(stepKey)}
          >
            <span className="truncate text-sm">{node.label}</span>
            {stepStatus === "completed" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : isActive ? (
              <Circle className="w-4 h-4 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 shrink-0 opacity-30" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function NorthWorkspace() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { allowed, isLoading: pillarCheckLoading } = useRequirePillarAccess("norte");
  const utils = trpc.useUtils();
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has("print_debug")) return;
    document.body.classList.add("print-debug");
    return () => document.body.classList.remove("print-debug");
  }, []);

  const { data: norteModule, isLoading: norteLoading } = trpc.modules.getBySlug.useQuery(
    { slug: "norte" },
    { enabled: true }
  );

  const { data: norteLessons, isLoading: norteLessonsLoading } = trpc.lessons.listByModule.useQuery(
    { moduleId: norteModule?.id || 0 },
    { enabled: !!norteModule?.id }
  );

  const { data: norteWorkspaceState } = trpc.workspaces.getWorkspaceStateBySlug.useQuery(
    { slug: "norte" },
    { enabled: isAuthenticated && !!norteModule?.id }
  );

  const { data: comecePorAquiState } = trpc.workspaces.getWorkspaceStateBySlug.useQuery(
    { slug: "comece-por-aqui" },
    { enabled: isAuthenticated }
  );

  const { data: marcoZeroWorkspaceState } = trpc.workspaces.getWorkspaceStateBySlug.useQuery(
    { slug: "marco-zero" },
    { enabled: isAuthenticated }
  );

  const ensureWorkspace = trpc.workspaces.ensureNorthWorkspaceLessons.useMutation({
    onSuccess: async (data) => {
      await utils.modules.getBySlug.invalidate({ slug: "norte" });
      if (data?.moduleId) await utils.lessons.listByModule.invalidate({ moduleId: data.moduleId });
    },
  });

  const lessonIdByStepKey = useMemo(() => {
    const map = new Map<StepKey, number>();
    const list = norteLessons ?? [];
    for (const s of SUBSTEPS) {
      const found =
        (s.lessonSlug ? list.find((l) => (l.slug ?? "").toLowerCase() === s.lessonSlug!.toLowerCase()) : undefined) ??
        (s.lessonTitleIncludes
          ? list.find((l) => (l.title ?? "").toLowerCase().includes(s.lessonTitleIncludes!.toLowerCase()))
          : undefined);
      if (found) map.set(s.key, found.id);
    }
    return map;
  }, [norteLessons]);

  const { data: progress } = trpc.workspaces.getProgressBySlug.useQuery(
    { slug: "norte" },
    { enabled: isAuthenticated && !!norteModule?.id }
  );

  const [activeStep, setActiveStep] = useState<StepKey>(() => SUBSTEPS[0]?.key ?? "matrioska_meu_negocio");
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [printing, setPrinting] = useState(false);

  const activeLessonId = lessonIdByStepKey.get(activeStep) ?? null;

  const { data: activeState, isLoading: stateLoading, refetch: refetchState } =
    trpc.lessonState.get.useQuery(
      { lessonId: activeLessonId ?? 0 },
      { enabled: !!activeLessonId && isAuthenticated }
    );

  const statusByStep = useMemo(() => {
    const steps = norteWorkspaceState?.steps ?? [];
    const out: Partial<Record<StepKey, "draft" | "completed">> = {};
    SUBSTEPS.forEach((s) => {
      const lessonId = lessonIdByStepKey.get(s.key);
      const st = steps.find((step: { lessonId?: number }) => step.lessonId === lessonId);
      out[s.key] = (st?.status === "completed" ? "completed" : "draft") as "draft" | "completed";
    });
    return out;
  }, [norteWorkspaceState?.steps, lessonIdByStepKey]);

  // Travado por enquanto para permitir validar todas as etapas
  const isLocked = useCallback((_stepKey: StepKey) => false, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (ensureWorkspace.isPending || ensureWorkspace.isSuccess) return;
    ensureWorkspace.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const companyName = useMemo(() => {
    const first = comecePorAquiState?.steps?.[0];
    const d = first?.data as Record<string, unknown> | undefined;
    return (typeof d?.nomeFantasia === "string" && d.nomeFantasia.trim() !== "" ? d.nomeFantasia : null) ?? "";
  }, [comecePorAquiState?.steps]);

  const concorrentesNames = useMemo(() => {
    const steps = marcoZeroWorkspaceState?.steps ?? [];
    const diagnosticoStep =
      steps.find((s) => s.data && typeof s.data === "object" && "s3_concorrentes" in s.data) ??
      steps.find((s) => s.title === "Diagnóstico do Negócio");
    const data = diagnosticoStep?.data as Record<string, unknown> | undefined;
    const arr = data?.s3_concorrentes;
    return Array.isArray(arr) ? (arr as unknown[]).filter((x): x is string => typeof x === "string" && !!x.trim()) : [];
  }, [marcoZeroWorkspaceState?.steps]);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (
    pillarCheckLoading ||
    !allowed ||
    authLoading ||
    norteLoading ||
    norteLessonsLoading ||
    (ensureWorkspace.isPending && !norteModule) ||
    (isAuthenticated && stateLoading)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!norteModule) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">NORTE não encontrado</h2>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const status = (activeState as any)?.status as "draft" | "completed" | undefined;
  const currentStepDef = SUBSTEPS.find((s) => s.key === activeStep);
  const currentData = (activeState as any)?.data as Record<string, unknown> | undefined ?? {};

  const handlePreviewPrint = () => {
    if (!currentStepDef || !norteModule) return;
    const html = buildStepPrintHtml(currentStepDef, currentData, {
      title: `${norteModule.title} – ${currentStepDef.title}`,
    });
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head><meta charset="utf-8"><title>${norteModule.title} – ${currentStepDef.title}</title>
      <style>body{font-family:system-ui,sans-serif;padding:2rem;max-width:800px;margin:0 auto;}</style></head>
      <body><div class="print-document">${html}</div></body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  const handlePrintCurrentStep = () => {
    if (!currentStepDef || !printAreaRef.current || !norteModule) return;
    const html = buildStepPrintHtml(currentStepDef, currentData, {
      title: `${norteModule.title} – ${currentStepDef.title}`,
    });
    printAreaRef.current.innerHTML = `<div class="print-document">${html}</div>`;
    console.info("[print] norte current html length", printAreaRef.current.innerHTML.length);
    setPrinting(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
        setPrinting(false);
      });
    });
  };

  const handlePrintAllSteps = async () => {
    if (!printAreaRef.current || !norteModule) return;
    setPrinting(true);
    printAreaRef.current.innerHTML = `<div class="print-document"><h1 class="print-doc-title">${norteModule.title} – Todas as etapas</h1><p>Carregando conteúdo...</p></div>`;
    console.info("[print] norte all loading html length", printAreaRef.current.innerHTML.length);
    try {
      const result = await utils.workspaces.getWorkspaceStateBySlug.fetch({ slug: "norte" });
      const apiSteps = result.steps ?? [];
      const stepsWithDefs = SUBSTEPS.map((stepDef) => {
        const lessonId = lessonIdByStepKey.get(stepDef.key);
        const apiStep = apiSteps.find((s: { lessonId?: number }) => s.lessonId === lessonId);
        return {
          step: stepDef,
          data: (apiStep?.data ?? {}) as Record<string, unknown>,
          title: apiStep?.title ?? stepDef.title,
        };
      });
      const html = `<div class="print-document"><h1 class="print-doc-title">${norteModule.title} – Todas as etapas</h1>${buildAllStepsPrintHtml(stepsWithDefs)}</div>`;
      printAreaRef.current.innerHTML = html;
      console.info("[print] norte all html length", printAreaRef.current.innerHTML.length);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => window.print());
      });
    } finally {
      setPrinting(false);
    }
  };

  return (
    <DashboardLayout>
      <div
        ref={printAreaRef}
        id="workspace-print-area"
        className="print-only"
        aria-hidden
      />
      <div className="pillar-inner north-inner min-h-screen bg-background screen-only">
      <header
        className={cn(
          "border-b sticky top-0 z-10 shadow-sm",
          isDark ? "border-[#262626] bg-[#111111]" : "bg-white"
        )}
      >
        <div className="container py-4 space-y-3">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className={isDark ? "text-white/90 hover:bg-white/10" : ""}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <div className={cn("text-sm", isDark ? "text-white/60" : "text-muted-foreground")}>Estratégia</div>
              <h1 className={cn("text-xl font-bold truncate", isDark ? "text-white" : "")}>{norteModule.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("text-sm", isDark ? "text-white/60" : "text-muted-foreground")}>
                {progress ? `${progress.completed} de 7 etapas` : "—"}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={printing}
                onClick={() => window.open("/norte/preview", "_blank")}
                className={cn("gap-2", isDark ? "border-white/20 text-white/90 hover:bg-white/10" : "")}
              >
                <Eye className="w-4 h-4" />
                Pré-visualizar
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={printing}
                    className={cn("gap-2", isDark ? "border-white/20 text-white/90 hover:bg-white/10" : "")}
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir / Salvar PDF
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handlePrintAllSteps}>
                    <FileDown className="w-4 h-4 mr-2" />
                    PDF Completo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open("/norte/preview?pdf=full", "_blank")}>
                    <FileDown className="w-4 h-4 mr-2" />
                    PDF por Etapa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {progress != null && (
            <div className="flex items-center gap-3">
              <Progress value={progress.percentage} className="h-2 flex-1 max-w-xs" />
              <span className={cn("text-sm font-medium tabular-nums", isDark ? "text-white/90" : "")}>{progress.percentage}%</span>
            </div>
          )}
        </div>
      </header>

      <main className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-[84px] lg:h-[calc(100vh-120px)]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">NORTE</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0.5">
                <NorthSidebarTree
                  nodes={NORTH_SIDEBAR_TREE}
                  activeStep={activeStep}
                  setActiveStep={setActiveStep}
                  lessonIdByStepKey={lessonIdByStepKey}
                  statusByStep={statusByStep}
                  isLocked={isLocked}
                />
              </CardContent>
            </Card>
          </aside>

          {/* Conteúdo */}
          <section className="space-y-4">
            <div className={cn("rounded-lg border p-4 text-sm", isDark ? "bg-blue-950/30 border-blue-800/50 text-blue-100" : "bg-blue-50 border-blue-200 text-blue-900")}>
              <strong>Antes de começar:</strong> O Pilar Norte é dividido em três partes. Nas seções você vai preencher com as informações seu negócio com base em tudo que estudou na Formação compass. Além disso você tem a opção de ir preenchendo junto com o Agente Professor ou ir validar com o agente analista. Siga a ordem, cada seção alimenta a próxima.
            </div>
            <Card>
              <CardHeader>
                <CardTitle>{SUBSTEPS.find((s) => s.key === activeStep)?.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {!activeLessonId ? (
                  <div className="flex items-start gap-3 rounded-lg border p-4 bg-muted/20">
                    <AlertTriangle className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">Etapa não encontrada</div>
                      <div className="text-sm text-muted-foreground">
                        Essa etapa ainda não existe como lição no banco. Execute a sincronização do workspace.
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {activeStep === "matrioska_concorrentes" && concorrentesNames.length === 0 ? (
                      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800/50 p-4 mb-4">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                        <p className="text-sm">
                          Você ainda não cadastrou concorrentes no Marco Zero. Volte ao Marco Zero e preencha o campo Concorrentes diretos (Diagnóstico do Negócio) para liberar este campo automaticamente, ou preencha manualmente abaixo.
                        </p>
                      </div>
                    ) : null}
                    <NorthStepForm
                      lessonId={activeLessonId}
                      step={SUBSTEPS.find((s) => s.key === activeStep)!}
                      workspaceSlug="norte"
                      tablePrefill={
                        activeStep === "matrioska_concorrentes"
                          ? { fieldId: "n1_matrioska_concorrentes", rowKey: "concorrente", values: concorrentesNames }
                          : undefined
                      }
                      fixedRowLabelsByFieldId={
                        activeStep === "matrioska_meu_negocio" && companyName
                          ? { n1_matrioska_empresa: [companyName] }
                          : undefined
                      }
                    />
                    <div className="pt-8 mt-8 flex flex-wrap items-center gap-4 border-t border-border">
                      <Button variant="outline" size="sm" onClick={() => refetchState()}>
                        Recarregar estado
                      </Button>
                      <div className="flex flex-wrap items-center gap-3">
                        {(() => {
                          const stepIndex = SUBSTEPS.findIndex((s) => s.key === activeStep);
                          const prevStep = stepIndex > 0 ? SUBSTEPS[stepIndex - 1] : null;
                          const nextStep = stepIndex >= 0 && stepIndex < SUBSTEPS.length - 1 ? SUBSTEPS[stepIndex + 1] : null;
                          const pillarIndex = PILLARS_ORDER.findIndex((p) => p.slug === "norte");
                          const nextPilar = pillarIndex >= 0 && pillarIndex < PILLARS_ORDER.length - 1 ? PILLARS_ORDER[pillarIndex + 1] : null;
                          const nextPilarHref = nextPilar ? (nextPilar.href ?? getModuleHref(nextPilar.slug)) : null;
                          return (
                            <>
                              {prevStep ? (
                                <Button variant="outline" size="sm" onClick={() => setActiveStep(prevStep.key)}>
                                  ← Seção anterior
                                </Button>
                              ) : null}
                              {nextStep ? (
                                <Button size="sm" onClick={() => setActiveStep(nextStep.key)}>
                                  Avançar →
                                </Button>
                              ) : nextPilarHref ? (
                                <Link href={nextPilarHref}>
                                  <Button size="sm">Avançar → Próximo pilar</Button>
                                </Link>
                              ) : null}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
      </div>
    </DashboardLayout>
  );
}
