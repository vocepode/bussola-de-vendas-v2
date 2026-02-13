"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowLeft, CheckCircle2, Circle, AlertTriangle, ChevronRight, Folder, Printer, FileDown } from "lucide-react";
import { getLoginUrl } from "@/const";
import { listNorthSubsteps, NORTH_SIDEBAR_TREE, isNorthSidebarStep, type NorthSidebarNode } from "@/north/schema";
import { NorthStepForm } from "@/components/north/NorthStepForm";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { buildStepPrintHtml, buildAllStepsPrintHtml } from "@/lib/workspacePrint";

const SUBSTEPS = listNorthSubsteps();
type StepKey = (typeof SUBSTEPS)[number]["key"];

function NorthSidebarTree(props: {
  nodes: NorthSidebarNode[];
  activeStep: StepKey;
  setActiveStep: (k: StepKey) => void;
  lessonIdByStepKey: Map<StepKey, number>;
  statusByStep: Partial<Record<StepKey, "draft" | "completed">>;
  depth?: number;
}) {
  const { nodes, activeStep, setActiveStep, lessonIdByStepKey, statusByStep, depth = 0 } = props;
  const paddingLeft = 8 + depth * 14;

  return (
    <div className="space-y-0.5">
      {nodes.map((node, idx) => {
        if (isNorthSidebarStep(node)) {
          const stepKey = node.stepKey as StepKey;
          const isActive = stepKey === activeStep;
          const resolvedLessonId = lessonIdByStepKey.get(stepKey);
          const isResolved = !!resolvedLessonId;
          const stepStatus = statusByStep[stepKey];
          return (
            <button
              key={node.stepKey}
              type="button"
              className={[
                "w-full text-left py-2 rounded-md transition-colors flex items-center justify-between gap-2",
                isActive ? "bg-primary/10 text-primary" : "hover:bg-muted",
                !isResolved ? "opacity-60" : "",
              ].join(" ")}
              style={{ paddingLeft: `${paddingLeft}px` }}
              onClick={() => setActiveStep(stepKey)}
              disabled={!isResolved}
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
        }
        return (
          <Collapsible key={`folder-${depth}-${idx}-${node.label}`} defaultOpen={depth < 2} className="group">
            <CollapsibleTrigger
              className={[
                "w-full flex items-center gap-2 py-2 rounded-md transition-colors text-left",
                "hover:bg-muted text-muted-foreground hover:text-foreground",
              ].join(" ")}
              style={{ paddingLeft: `${paddingLeft}px` }}
            >
              <ChevronRight className="w-4 h-4 shrink-0 transition-transform group-data-[state=open]:rotate-90" />
              <Folder className="w-4 h-4 shrink-0 opacity-70" />
              <span className="text-xs font-semibold uppercase tracking-wide truncate">{node.label}</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <NorthSidebarTree
                nodes={node.children}
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                lessonIdByStepKey={lessonIdByStepKey}
                statusByStep={statusByStep}
                depth={depth + 1}
              />
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}

export default function NorthWorkspace() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const utils = trpc.useUtils();

  const { data: norteModule, isLoading: norteLoading } = trpc.modules.getBySlug.useQuery(
    { slug: "norte" },
    { enabled: true }
  );

  const { data: norteLessons, isLoading: norteLessonsLoading } = trpc.lessons.listByModule.useQuery(
    { moduleId: norteModule?.id || 0 },
    { enabled: !!norteModule?.id }
  );

  // Para puxar a lista de concorrentes do Diagnóstico do negócio (Marco Zero)
  const { data: marcoZeroModule } = trpc.modules.getBySlug.useQuery({ slug: "marco-zero" }, { enabled: true });
  const { data: marcoZeroLessons } = trpc.lessons.listByModule.useQuery(
    { moduleId: marcoZeroModule?.id || 0 },
    { enabled: !!marcoZeroModule?.id }
  );

  const diagnosticoLessonId = useMemo(() => {
    const normalize = (t: string) => (t ?? "").toLowerCase();
    const needle = "1. diagnóstico";
    const primary = marcoZeroLessons ?? [];
    const fallback = norteLessons ?? [];
    const found =
      primary.find((l) => normalize(l.title ?? "").includes(needle)) ??
      fallback.find((l) => normalize(l.title ?? "").includes(needle));
    return found?.id ?? null;
  }, [marcoZeroLessons, norteLessons]);

  const { data: diagnosticoState } = trpc.lessonState.get.useQuery(
    { lessonId: diagnosticoLessonId ?? 0 },
    { enabled: !!diagnosticoLessonId && isAuthenticated }
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

  const [activeStep, setActiveStep] = useState<StepKey>(() => SUBSTEPS[0]?.key ?? "ondeVoceEsta_minhaEmpresa");
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [printing, setPrinting] = useState(false);

  const activeLessonId = lessonIdByStepKey.get(activeStep) ?? null;

  const { data: activeState, isLoading: stateLoading, refetch: refetchState } =
    trpc.lessonState.get.useQuery(
      { lessonId: activeLessonId ?? 0 },
      { enabled: !!activeLessonId && isAuthenticated }
    );

  const [statusByStep, setStatusByStep] = useState<
    Partial<Record<StepKey, "draft" | "completed">>
  >({});

  useEffect(() => {
    if (!activeState) return;
    const s = (activeState as any).status as "draft" | "completed" | undefined;
    if (!s) return;
    setStatusByStep((prev) => ({ ...prev, [activeStep]: s }));
  }, [activeState?.lessonId]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (ensureWorkspace.isPending || ensureWorkspace.isSuccess) return;
    ensureWorkspace.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (
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

  const diagnosticoData = (diagnosticoState as any)?.data as any;
  const concorrentesNames = Array.isArray(diagnosticoData?.diag_concorrentes)
    ? (diagnosticoData.diag_concorrentes as unknown[]).filter((x): x is string => typeof x === "string" && !!x.trim())
    : [];

  const currentStepDef = SUBSTEPS.find((s) => s.key === activeStep);
  const currentData = (activeState as any)?.data as Record<string, unknown> | undefined ?? {};

  const handlePrintCurrentStep = () => {
    if (!currentStepDef || !printAreaRef.current || !norteModule) return;
    const html = buildStepPrintHtml(currentStepDef, currentData, {
      title: `${norteModule.title} – ${currentStepDef.title}`,
    });
    printAreaRef.current.innerHTML = `<div class="print-document">${html}</div>`;
    setPrinting(true);
    requestAnimationFrame(() => {
      window.print();
      setPrinting(false);
    });
  };

  const handlePrintAllSteps = async () => {
    if (!printAreaRef.current || !norteModule) return;
    setPrinting(true);
    try {
      const result = await utils.workspaces.getWorkspaceStateBySlug.fetch({ slug: "norte" });
      const stepsWithDefs = (result.steps ?? []).map((s, i) => ({
        step: SUBSTEPS[i] ?? { key: "", title: s.title, moduleSlug: "norte" as const, blocks: [] },
        data: s.data ?? {},
        title: s.title,
      }));
      const html = `<div class="print-document"><h1 class="print-doc-title">${norteModule.title} – Todas as etapas</h1>${buildAllStepsPrintHtml(stepsWithDefs)}</div>`;
      printAreaRef.current.innerHTML = html;
      requestAnimationFrame(() => window.print());
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background screen-only">
      <div
        ref={printAreaRef}
        id="workspace-print-area"
        className="print-only hidden"
        aria-hidden
      />
      <header className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="container py-4 space-y-3">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-muted-foreground">Estratégia</div>
              <h1 className="text-xl font-bold truncate">{norteModule.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {progress ? `${progress.completed} de ${progress.total} etapas` : "—"}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={printing} className="gap-2">
                    <Printer className="w-4 h-4" />
                    Imprimir / PDF
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handlePrintCurrentStep}>
                    <FileDown className="w-4 h-4 mr-2" />
                    Imprimir etapa atual
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handlePrintAllSteps}>
                    <FileDown className="w-4 h-4 mr-2" />
                    Imprimir todas as etapas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {progress != null && (
            <div className="flex items-center gap-3">
              <Progress value={progress.percentage} className="h-2 flex-1 max-w-xs" />
              <span className="text-sm font-medium tabular-nums">{progress.percentage}%</span>
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
                />
              </CardContent>
            </Card>
          </aside>

          {/* Conteúdo */}
          <section className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{SUBSTEPS.find((s) => s.key === activeStep)?.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {!activeLessonId ? (
                  <div className="flex items-start gap-3 rounded-lg border p-4 bg-muted/20">
                    <AlertTriangle className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">Etapa não encontrada no conteúdo importado</div>
                      <div className="text-sm text-muted-foreground">
                        Essa etapa ainda não existe como lição no banco (ou o título mudou). Reimporte o HTML e tente de novo.
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <NorthStepForm
                      lessonId={activeLessonId}
                      step={SUBSTEPS.find((s) => s.key === activeStep)!}
                      workspaceSlug="norte"
                      tablePrefill={
                        activeStep === "ondeVoceEsta_concorrentes"
                          ? { fieldId: "ondeVoceEsta_concorrentes", rowKey: "concorrente", values: concorrentesNames }
                          : undefined
                      }
                    />
                    <div className="pt-4">
                      <Button variant="outline" onClick={() => refetchState()}>
                        Recarregar estado
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}

