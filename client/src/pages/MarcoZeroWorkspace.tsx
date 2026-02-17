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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowLeft, CheckCircle2, Circle, AlertTriangle, Printer, FileDown } from "lucide-react";
import { getLoginUrl } from "@/const";
import { MARCO_ZERO_STEPS } from "@/marcoZero/schema";
import { NorthStepForm } from "@/components/north/NorthStepForm";
import { buildStepPrintHtml, buildWorkspaceReportHtml } from "@/lib/workspacePrint";

const STEPS = MARCO_ZERO_STEPS;
type StepKey = (typeof STEPS)[number]["key"];

export default function MarcoZeroWorkspace() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
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

  const { data: marcoZeroModule, isLoading: marcoZeroLoading } = trpc.modules.getBySlug.useQuery(
    { slug: "marco-zero" },
    { enabled: true }
  );

  const { data: norteLessons, isLoading: norteLessonsLoading } = trpc.lessons.listByModule.useQuery(
    { moduleId: norteModule?.id || 0 },
    { enabled: !!norteModule?.id }
  );

  const { data: marcoZeroLessons, isLoading: marcoZeroLessonsLoading } = trpc.lessons.listByModule.useQuery(
    { moduleId: marcoZeroModule?.id || 0 },
    { enabled: !!marcoZeroModule?.id }
  );

  const ensureWorkspace = trpc.workspaces.ensureMarcoZeroWorkspaceLessons.useMutation({
    onSuccess: async (data) => {
      await utils.modules.getBySlug.invalidate({ slug: "marco-zero" });
      if (data?.moduleId) await utils.lessons.listByModule.invalidate({ moduleId: data.moduleId });
    },
  });

  const { data: progress } = trpc.workspaces.getProgressBySlug.useQuery(
    { slug: "marco-zero" },
    { enabled: isAuthenticated && !!marcoZeroModule?.id }
  );

  const [activeStep, setActiveStep] = useState<StepKey>(() => STEPS[0]?.key ?? "jornada");
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [printing, setPrinting] = useState(false);

  const lessonIdByStepKey = useMemo(() => {
    const map = new Map<StepKey, number>();
    const allByModule: Record<string, typeof norteLessons> = {
      norte: norteLessons,
      "marco-zero": marcoZeroLessons,
    };

    for (const s of STEPS) {
      const primaryList = allByModule[s.moduleSlug] ?? [];
      const fallbackList = s.moduleSlug === "marco-zero" ? (allByModule["norte"] ?? []) : [];

      const normalize = (t: string) => (t ?? "").toLowerCase();
      const titleNeedle = s.lessonTitleIncludes ?? s.title;
      const predicate = (l: any) => normalize(l?.title).includes(normalize(titleNeedle));

      const found =
        (s.lessonSlug
          ? (primaryList ?? []).find((l: any) => normalize(l?.slug) === normalize(s.lessonSlug!))
          : undefined) ??
        (primaryList ?? []).find(predicate) ??
        (fallbackList ?? []).find(predicate);
      if (found) map.set(s.key, found.id);
    }

    return map;
  }, [norteLessons, marcoZeroLessons]);

  const activeLessonId = lessonIdByStepKey.get(activeStep) ?? null;

  const { data: activeState, isLoading: stateLoading, refetch: refetchState } =
    trpc.lessonState.get.useQuery(
      { lessonId: activeLessonId ?? 0 },
      { enabled: !!activeLessonId && isAuthenticated }
    );

  const [statusByStep, setStatusByStep] = useState<Partial<Record<StepKey, "draft" | "completed">>>({});

  useEffect(() => {
    if (!activeState) return;
    const s = (activeState as any).status as "draft" | "completed" | undefined;
    if (!s) return;
    setStatusByStep((prev) => ({ ...prev, [activeStep]: s }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    marcoZeroLoading ||
    norteLessonsLoading ||
    marcoZeroLessonsLoading ||
    (ensureWorkspace.isPending && !marcoZeroModule) ||
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

  if (!marcoZeroModule) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Marco Zero não encontrado</h2>
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
  const currentStepDef = STEPS.find((s) => s.key === activeStep);
  const currentData = (activeState as any)?.data as Record<string, unknown> | undefined ?? {};

  const handlePrintCurrentStep = () => {
    if (!currentStepDef || !printAreaRef.current) return;
    const html = buildStepPrintHtml(currentStepDef, currentData, {
      title: `${marcoZeroModule.title} – ${currentStepDef.title}`,
    });
    printAreaRef.current.innerHTML = `<div class="print-document">${html}</div>`;
    console.info("[print] marco-zero current html length", printAreaRef.current.innerHTML.length);
    setPrinting(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
        setPrinting(false);
      });
    });
  };

  const handlePrintAllSteps = async () => {
    if (!printAreaRef.current) return;
    setPrinting(true);
    printAreaRef.current.innerHTML = `<div class="print-document"><h1 class="print-doc-title">${marcoZeroModule.title} – Todas as etapas</h1><p>Carregando conteúdo...</p></div>`;
    console.info("[print] marco-zero all loading html length", printAreaRef.current.innerHTML.length);
    try {
      const result = await utils.workspaces.getWorkspaceStateBySlug.fetch({ slug: "marco-zero" });
      const stepsWithDefs = (result.steps ?? []).map((s, i) => ({
        step: STEPS[i] ?? { key: "", title: s.title, moduleSlug: "marco-zero" as const, blocks: [] },
        data: s.data ?? {},
        title: s.title,
      }));

      const progressPercent = progress?.percentage ?? 0;
      const html = buildWorkspaceReportHtml({
        moduleTitle: marcoZeroModule.title,
        steps: stepsWithDefs,
        studentName: user?.name ?? undefined,
        progressPercentage: progressPercent,
      });

      printAreaRef.current.innerHTML = html;
      console.info("[print] marco-zero all html length", printAreaRef.current.innerHTML.length);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => window.print());
      });
    } finally {
      setPrinting(false);
    }
  };

  // Pré-visualização agora é uma página dedicada (/marco-zero/preview).

  return (
    <>
      <div
        ref={printAreaRef}
        id="workspace-print-area"
        className="print-only"
        aria-hidden
      />
      <div className="min-h-screen bg-background screen-only">
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
              <div className="text-sm text-muted-foreground">Diagnóstico</div>
              <h1 className="text-xl font-bold truncate">{marcoZeroModule.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {progress ? `${progress.completed} de ${progress.total} etapas` : "—"}
              </span>
              <Link href="/marco-zero/preview">
                <Button variant="secondary" size="sm">Pré-visualizar página</Button>
              </Link>
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
          <aside className="lg:sticky lg:top-[84px] lg:h-[calc(100vh-120px)]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Etapas do Marco Zero</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {STEPS.map((s) => {
                  const isActive = s.key === activeStep;
                  const resolvedLessonId = lessonIdByStepKey.get(s.key);
                  const isResolved = !!resolvedLessonId;
                  const stepStatus = statusByStep[s.key];
                  return (
                    <button
                      key={s.key}
                      type="button"
                      className={[
                        "w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between gap-3",
                        isActive ? "bg-primary/10 text-primary" : "hover:bg-muted",
                        !isResolved ? "opacity-60" : "",
                      ].join(" ")}
                      onClick={() => setActiveStep(s.key)}
                      disabled={!isResolved}
                    >
                      <span className="truncate">{s.title}</span>
                      {stepStatus === "completed" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isActive ? (
                        <Circle className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4 opacity-30" />
                      )}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </aside>

          <section className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{STEPS.find((s) => s.key === activeStep)?.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {!activeLessonId ? (
                  <div className="flex items-start gap-3 rounded-lg border p-4 bg-muted/20">
                    <AlertTriangle className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">Etapa não encontrada no conteúdo importado</div>
                      <div className="text-sm text-muted-foreground">
                        Essa etapa ainda não existe como lição no banco (ou o título mudou). Reimporte o HTML e tente de
                        novo.
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <NorthStepForm
                      lessonId={activeLessonId}
                      step={STEPS.find((s) => s.key === activeStep)!}
                      workspaceSlug="marco-zero"
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
    </>
  );
}
