"use client";

import { getModuleGradient, getModuleHref, PILLARS_ORDER } from "@/constants/pillars";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Lock, LayoutList } from "lucide-react";
import Link from "next/link";

export default function MyCompassPage() {
  const { data: overview, isLoading: loadingOverview } = trpc.dashboard.getOverview.useQuery();
  const { data: modules, isLoading: loadingModules } = trpc.modules.list.useQuery();

  const progressByModuleId = new Map((overview?.moduleProgress ?? []).map((p) => [p.moduleId, p]));
  const lessonCounts = overview?.lessonCounts ?? {};
  const moduleBySlug = new Map((modules ?? []).map((m) => [m.slug, m]));

  return (
    <DashboardLayout>
      <div className="content-inner bussola-inner w-full space-y-6 pl-1 pr-2 md:pl-2 md:pr-4">
        <section className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-white">Minha Bússola</h1>
          <p className="text-sm text-white/60">Acompanhe seu progresso em cada pilar do método</p>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {PILLARS_ORDER.map((pillar, pillarIndex) => {
            const module = moduleBySlug.get(pillar.slug);
            const progress = module ? progressByModuleId.get(module.id) : null;
            const percentage = progress?.progressPercentage ?? 0;
            const totalLessons = module ? lessonCounts[module.id] ?? 0 : 0;
            const completedLessons = totalLessons > 0 ? Math.round((percentage / 100) * totalLessons) : 0;
            const href = pillar.href ?? (module ? getModuleHref(module.slug) : "/");

            const prevPillar = pillarIndex > 0 ? PILLARS_ORDER[pillarIndex - 1] : null;
            const prevModule = prevPillar ? moduleBySlug.get(prevPillar.slug) : null;
            const prevProgress = prevModule ? progressByModuleId.get(prevModule.id) : null;
            const isLocked = false;

            const cardContent = (
              <Card
                className={
                  isLocked
                    ? "group flex h-full min-h-[280px] flex-col gap-0 overflow-hidden rounded-2xl border border-[#262626] bg-[#161616] p-0 text-white shadow-none opacity-75"
                    : "group flex h-full min-h-[280px] flex-col gap-0 overflow-hidden rounded-2xl border border-[#262626] bg-[#161616] p-0 text-white shadow-none transition hover:-translate-y-0.5 hover:border-violet-500/40"
                }
              >
                <div
                  className="relative flex h-[160px] w-full shrink-0 overflow-hidden rounded-t-2xl"
                  style={
                    module
                      ? { background: getModuleGradient(module.color) }
                      : { background: "linear-gradient(135deg, #b11f83, #2e1269 48%, #0f123f)" }
                  }
                >
                  <img
                    src={pillar.cover}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-90"
                    aria-hidden
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/25" />
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Lock className="h-10 w-10 text-white/90" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 z-10">
                    <span className="rounded bg-black/35 px-2 py-0.5 text-[11px] font-medium text-white">
                      {percentage}%
                    </span>
                  </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col justify-between space-y-2 bg-[#1a1a1a] p-3">
                  <p className="line-clamp-2 text-sm font-medium leading-snug text-white">
                    {pillar.subtitle}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-white/85">
                    <LayoutList className="h-3.5 w-3.5 shrink-0 text-white/90" />
                    <span>{totalLessons > 0 ? `${totalLessons} ${totalLessons === 1 ? "seção" : "seções"}` : "—"}</span>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-2 bg-white/20 [&>*]:bg-green-500"
                  />
                  {totalLessons > 0 ? (
                    <p className="text-xs text-white/60">
                      {completedLessons} de {totalLessons} {totalLessons === 1 ? "seção concluída" : "seções concluídas"}
                    </p>
                  ) : null}
                  {isLocked ? (
                    <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-white/5 py-2 text-xs font-medium text-white/80">
                      <Lock className="h-3.5 w-3.5" />
                      Conclua &quot;{prevPillar?.title}&quot; para desbloquear
                    </span>
                  ) : (
                    <span
                      className="inline-flex w-full items-center justify-center rounded-lg border border-white/30 bg-white/5 py-2 text-sm font-medium text-white transition group-hover:bg-white/10"
                      aria-hidden
                    >
                      {percentage > 0 ? "Continuar" : "Começar"}
                    </span>
                  )}
                </div>
              </Card>
            );

            if (isLocked) {
              return <div key={pillar.slug} className="min-w-0 cursor-not-allowed">{cardContent}</div>;
            }
            return (
              <Link key={pillar.slug} href={href} className="min-w-0">
                {cardContent}
              </Link>
            );
          })}

          {(loadingOverview || loadingModules) && !(modules && modules.length) ? (
            <Card className="col-span-full border border-[#262626] bg-[#161616] p-6 text-center text-sm text-white/60 shadow-none xl:col-span-6">
              Carregando sua bússola...
            </Card>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}
