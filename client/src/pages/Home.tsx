"use client";

import { getModuleGradient, getModuleHref, PILLARS_ORDER } from "@/constants/pillars";
import { COURSES } from "@/constants/courses";
import { GUIDES } from "@/constants/guides";
import DashboardLayout from "@/components/DashboardLayout";
import { CourseCard } from "@/components/CourseCard";
import { GuideCard } from "@/components/GuideCard";
import { ProgressStatsCards } from "@/components/ProgressStatsCards";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { AlertCircle, Check, LayoutList, Play, RefreshCw, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { data: overview, isLoading: loadingOverview, isError: errorOverview, refetch: refetchOverview } = trpc.dashboard.getOverview.useQuery();
  const { data: modules, isLoading: loadingModules, isError: errorModules, refetch: refetchModules } = trpc.modules.list.useQuery();

  const progressByModuleId = new Map((overview?.moduleProgress ?? []).map((p) => [p.moduleId, p]));
  const lessonCounts = overview?.lessonCounts ?? {};
  const overallProgress = overview?.overallProgress ?? 0;
  const pillarsCompleted = overview?.pillarsCompleted ?? 0;
  const pillarsRemaining = overview?.pillarsRemaining ?? Math.max((modules?.length ?? 0) - pillarsCompleted, 0);
  const moduleBySlug = new Map((modules ?? []).map((m) => [m.slug, m]));

  const hasError = errorOverview || errorModules;
  const isLoading = loadingOverview || loadingModules;

  const retry = () => {
    refetchOverview();
    refetchModules();
  };

  return (
    <DashboardLayout>
      <div
        className={cn(
          "dashboard-inner min-h-full w-full space-y-6 pl-1 pr-2 md:pl-2 md:pr-4",
          isDark ? "bg-[#0a0a0a] text-white" : "bg-background text-foreground"
        )}
      >
        {hasError ? (
          <Card className="border-amber-500/50 bg-amber-500/10 p-6 text-amber-200">
            <div className="flex flex-col items-center gap-3 text-center">
              <AlertCircle className="h-10 w-10 text-amber-400" />
              <p className="font-medium">Não foi possível carregar os dados do dashboard.</p>
              <p className={cn("text-sm", isDark ? "text-white/70" : "text-muted-foreground")}>Tente novamente ou faça logout e entre de novo.</p>
              <button
                type="button"
                onClick={retry}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500/30 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-500/50"
              >
                <RefreshCw className="h-4 w-4" /> Tentar de novo
              </button>
            </div>
          </Card>
        ) : null}
        {!hasError ? (
          <>
        <section className="space-y-1">
          <h1 className={cn("text-3xl font-semibold tracking-tight", isDark ? "text-white" : "text-foreground")}>Olá, {user?.name ?? "Aluno"}</h1>
          <p className={cn("text-sm", isDark ? "text-white/60" : "text-muted-foreground")}>continue de onde parou</p>
        </section>

        <section className="w-full">
          <ProgressStatsCards
            items={[
              { name: "Progresso da Jornada", value: `${overallProgress}%`, icon: TrendingUp },
              { name: "Pilares a finalizar", value: pillarsRemaining, icon: Play },
              { name: "Pilares Finalizados", value: pillarsCompleted, icon: Check },
            ]}
          />
        </section>

        <section className="space-y-3">
          <h2 className={cn("text-2xl font-semibold", isDark ? "text-white" : "text-foreground")}>Minha Bússola</h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {PILLARS_ORDER.map((pillar) => {
              const isRaioX = pillar.slug === "raio-x";
              const isMapa = pillar.slug === "mapa";
              const isComingSoon = (pillar as { comingSoon?: boolean }).comingSoon === true;
              const raioXOverview = overview?.raioXOverview;
              const mapaOverview = overview?.mapaOverview;
              const module = moduleBySlug.get(pillar.slug);
              const progress = module ? progressByModuleId.get(module.id) : null;
              const percentage = isRaioX && raioXOverview
                ? raioXOverview.progressPercentage
                : isMapa && mapaOverview
                  ? mapaOverview.progressPercentage
                  : (progress?.progressPercentage ?? 0);
              const lessonCount = isRaioX && raioXOverview
                ? raioXOverview.sectionCount
                : isMapa && mapaOverview
                  ? mapaOverview.sectionCount
                  : (module ? lessonCounts[module.id] ?? 0 : 0);
              const completedLabel = isRaioX && raioXOverview
                ? raioXOverview.completedSections
                : isMapa && mapaOverview
                  ? mapaOverview.completedSections
                  : (lessonCount > 0 ? Math.round((percentage / 100) * lessonCount) : 0);
              const href = pillar.href ?? (module ? getModuleHref(module.slug) : getModuleHref(pillar.slug));

              const cardContent = (
                <Card
                  className={cn(
                    "group flex h-full min-h-[280px] flex-col gap-0 overflow-hidden rounded-2xl border p-0 shadow-none transition",
                    !isComingSoon && "hover:-translate-y-0.5",
                    isDark
                      ? "border-[#262626] bg-[#161616] text-white hover:border-violet-500/40"
                      : "border-border bg-card text-foreground hover:border-primary/50",
                    isComingSoon && "opacity-90"
                  )}
                >
                  <div
                    className="relative flex h-[160px] w-full shrink-0 overflow-hidden rounded-t-2xl"
                    style={
                      module && !isComingSoon
                        ? { background: getModuleGradient(module.color) }
                        : { background: "linear-gradient(135deg, #b11f83, #2e1269 48%, #0f123f)" }
                    }
                  >
                    <img
                      src={pillar.cover}
                      alt=""
                      className={cn(
                        "absolute inset-0 h-full w-full object-cover opacity-90",
                        isComingSoon && "grayscale"
                      )}
                      aria-hidden
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/25" />
                    {!isComingSoon && (
                      <div className="absolute bottom-2 right-2 z-10">
                        <span className="rounded bg-black/35 px-2 py-0.5 text-[11px] font-medium text-white">
                          {percentage}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={cn("flex min-h-0 flex-1 flex-col justify-between space-y-2 p-3", isDark ? "bg-[#1a1a1a]" : "bg-muted/20")}>
                    <p className={cn("line-clamp-2 text-sm font-medium leading-snug", isDark ? "text-white" : "text-foreground")}>
                      {pillar.subtitle}
                    </p>
                    {isComingSoon ? (
                      <span
                        className={cn(
                          "inline-flex w-full items-center justify-center rounded-lg border py-2 text-sm font-medium",
                          isDark ? "border-white/20 bg-white/5 text-white/70" : "border-border bg-muted/30 text-muted-foreground"
                        )}
                      >
                        Em breve
                      </span>
                    ) : (
                      <>
                        <div className={cn("flex items-center gap-1.5 text-xs", isDark ? "text-white/85" : "text-muted-foreground")}>
                          <LayoutList className={cn("h-3.5 w-3.5 shrink-0", isDark ? "text-white/90" : "text-foreground/80")} />
                          <span>{lessonCount > 0 ? `${lessonCount} ${lessonCount === 1 ? "seção" : "seções"}` : "—"}</span>
                        </div>
                        <Progress
                          value={percentage}
                          className={cn("h-2 [&>*]:bg-green-500", isDark ? "bg-white/20" : "bg-muted")}
                        />
                        {lessonCount > 0 ? (
                          <p className={cn("text-xs", isDark ? "text-white/60" : "text-muted-foreground")}>
                            {completedLabel} de {lessonCount} {lessonCount === 1 ? "seção concluída" : "seções concluídas"}
                          </p>
                        ) : null}
                      </>
                    )}
                  </div>
                </Card>
              );

              if (isComingSoon) {
                return <div key={pillar.slug} className="min-w-0 cursor-default">{cardContent}</div>;
              }
              return (
                <Link key={pillar.slug} href={href} className="min-w-0">
                  {cardContent}
                </Link>
              );
            })}

            {isLoading && !(modules && modules.length) ? (
              <Card className={cn("col-span-full p-6 text-center text-sm shadow-none xl:col-span-6", isDark ? "border-[#262626] bg-[#161616] text-white/60" : "border-border bg-card text-muted-foreground")}>
                Carregando sua bússola...
              </Card>
            ) : null}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className={cn("text-2xl font-semibold", isDark ? "text-white" : "text-foreground")}>Meus cursos</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {COURSES.map((course) => (
              <CourseCard
                key={course.id}
                title={course.title}
                href={course.href}
                acronym={course.acronym}
                cover={course.cover}
                dark={isDark}
              />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className={cn("text-2xl font-semibold", isDark ? "text-white" : "text-foreground")}>Guias de uso</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {GUIDES.map((guide) => (
              <GuideCard
                key={guide.id}
                title={guide.title}
                href={guide.href}
                cover={guide.cover}
                dark={isDark}
              />
            ))}
          </div>
        </section>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
