"use client";

import { useMemo } from "react";
import { getModuleGradient, getModuleHref, PILLARS_ORDER } from "@/constants/pillars";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "@/contexts/ThemeContext";
import { hasClientAdminPrivileges } from "@/lib/adminAccess";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { Lock, LayoutList } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/_core/hooks/useAuth";

export default function MyCompassPage() {
  const { user } = useAuth();
  const isAdmin = hasClientAdminPrivileges(user);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { data: overview, isLoading: loadingOverview } = trpc.dashboard.getOverview.useQuery();
  const { data: modules, isLoading: loadingModules } = trpc.modules.list.useQuery();

  const progressByModuleId = new Map((overview?.moduleProgress ?? []).map((p) => [p.moduleId, p]));
  const lessonCounts = overview?.lessonCounts ?? {};
  const moduleBySlug = new Map((modules ?? []).map((m) => [m.slug, m]));
  const raioXOverview = overview?.raioXOverview;
  const mapaOverview = overview?.mapaOverview;

  const percentagesByIndex = useMemo(() => {
    return PILLARS_ORDER.map((pillar) => {
      const isRaioX = pillar.slug === "raio-x";
      const isMapa = pillar.slug === "mapa";
      const module = moduleBySlug.get(pillar.slug);
      const progress = module ? progressByModuleId.get(module.id) : null;
      if (isRaioX && raioXOverview) return raioXOverview.progressPercentage;
      if (isMapa && mapaOverview) return mapaOverview.progressPercentage;
      return progress?.progressPercentage ?? 0;
    });
  }, [overview, modules]);

  return (
    <DashboardLayout>
      <div
        className={cn(
          "content-inner bussola-inner w-full space-y-6 pl-1 pr-2 md:pl-2 md:pr-4",
          isDark ? "text-white" : "text-foreground"
        )}
      >
        <section className="space-y-1">
          <h1 className={cn("text-3xl font-semibold tracking-tight", isDark ? "text-white" : "text-foreground")}>Minha Bússola</h1>
          <p className={cn("text-sm", isDark ? "text-white/60" : "text-muted-foreground")}>Acompanhe seu progresso em cada pilar do método</p>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {PILLARS_ORDER.map((pillar, pillarIndex) => {
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
            const totalLessons = isRaioX && raioXOverview
              ? raioXOverview.sectionCount
              : isMapa && mapaOverview
                ? mapaOverview.sectionCount
                : (module ? lessonCounts[module.id] ?? 0 : 0);
            const completedLessons = isRaioX && raioXOverview
              ? raioXOverview.completedSections
              : isMapa && mapaOverview
                ? mapaOverview.completedSections
                : (totalLessons > 0 ? Math.round((percentage / 100) * totalLessons) : 0);
            const href = pillar.href ?? (module ? getModuleHref(module.slug) : getModuleHref(pillar.slug));

            const prevPillar = pillarIndex > 0 ? PILLARS_ORDER[pillarIndex - 1] : null;
            const prevPercentage = pillarIndex > 0 ? percentagesByIndex[pillarIndex - 1] ?? 0 : 100;
            const isLocked = !isAdmin && !isComingSoon && pillarIndex > 0 && prevPercentage < 100;

            const cardContent = (
              <Card
                className={cn(
                  "group flex h-full min-h-[280px] flex-col gap-0 overflow-hidden rounded-2xl border p-0 shadow-none transition",
                  !isComingSoon && "hover:-translate-y-0.5",
                  isLocked && "opacity-75",
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
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Lock className="h-10 w-10 text-white/90" />
                    </div>
                  )}
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
                        <span>{totalLessons > 0 ? `${totalLessons} ${totalLessons === 1 ? "seção" : "seções"}` : "—"}</span>
                      </div>
                      <Progress
                        value={percentage}
                        className={cn("h-2 [&>*]:bg-green-500", isDark ? "bg-white/20" : "bg-muted")}
                      />
                      {totalLessons > 0 ? (
                        <p className={cn("text-xs", isDark ? "text-white/60" : "text-muted-foreground")}>
                          {completedLessons} de {totalLessons} {totalLessons === 1 ? "seção concluída" : "seções concluídas"}
                        </p>
                      ) : null}
                      {isLocked ? (
                        <span
                          className={cn(
                            "inline-flex w-full items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium",
                            isDark ? "border-white/20 bg-white/5 text-white/80" : "border-border bg-muted/30 text-muted-foreground"
                          )}
                        >
                          <Lock className="h-3.5 w-3.5" />
                          Conclua &quot;{prevPillar?.title}&quot; para desbloquear
                        </span>
                      ) : (
                        <span
                          className={cn(
                            "inline-flex w-full items-center justify-center rounded-lg border py-2 text-sm font-medium transition",
                            isDark
                              ? "border-white/30 bg-white/5 text-white group-hover:bg-white/10"
                              : "border-border bg-muted/50 text-foreground group-hover:bg-muted"
                          )}
                          aria-hidden
                        >
                          {percentage > 0 ? "Continuar" : "Começar"}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </Card>
            );

            if (isLocked) {
              return <div key={pillar.slug} className="min-w-0 cursor-not-allowed">{cardContent}</div>;
            }
            if (isComingSoon) {
              return <div key={pillar.slug} className="min-w-0 cursor-default">{cardContent}</div>;
            }
            return (
              <Link key={pillar.slug} href={href} className="min-w-0">
                {cardContent}
              </Link>
            );
          })}

          {(loadingOverview || loadingModules) && !(modules && modules.length) ? (
            <Card className={cn("col-span-full p-6 text-center text-sm shadow-none xl:col-span-6", isDark ? "border-[#262626] bg-[#161616] text-white/60" : "border-border bg-card text-muted-foreground")}>
              Carregando sua bússola...
            </Card>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}
