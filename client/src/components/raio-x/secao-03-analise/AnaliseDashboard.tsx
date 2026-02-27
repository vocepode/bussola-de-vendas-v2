"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import type { AnaliseMensal, SecaoAnalise } from "@/lib/raio-x/schema";
import {
  engagementRate,
  profileActivityTotal,
  momPct,
  engagementTotal,
  formatDelta,
} from "@/lib/raio-x/analysis-metrics";
import { AnaliseMonthForm } from "./AnaliseMonthForm";
import { AnaliseInsights } from "./AnaliseInsights";

interface AnaliseDashboardProps {
  secaoAnalise: SecaoAnalise | undefined;
  onChange: (secaoAnalise: SecaoAnalise) => void;
  disabled?: boolean;
}

const chartConfigViews = {
  views: { label: "Visualizações", color: "var(--chart-1)" },
  reach: { label: "Alcance", color: "var(--chart-2)" },
};

const chartConfigRates = {
  engagementRate: { label: "Taxa de engajamento %", color: "var(--chart-1)" },
  newFollowers: { label: "Novos seguidores", color: "var(--chart-2)" },
};

const chartConfigAction = {
  profileActivity: { label: "Atividade no perfil", color: "var(--chart-1)" },
  bioLinkClicks: { label: "Cliques na bio", color: "var(--chart-2)" },
  dmsStarted: { label: "DMs iniciadas", color: "var(--chart-3)" },
  conversions: { label: "Conversões", color: "var(--chart-4)" },
};

export function AnaliseDashboard({
  secaoAnalise,
  onChange,
  disabled,
}: AnaliseDashboardProps) {
  const meses = secaoAnalise?.meses ?? [];
  const sortedMeses = useMemo(
    () => [...meses].sort((a, b) => (a.mes < b.mes ? 1 : -1)),
    [meses]
  );
  const selected = sortedMeses[0] ?? null;
  const anterior = sortedMeses[1] ?? null;

  const handleSaveMonth = (mes: AnaliseMensal) => {
    const next = { ...secaoAnalise, canal: "instagram" as const, meses: [...meses] };
    const idx = next.meses.findIndex((m) => m.mes === mes.mes);
    if (idx >= 0) next.meses[idx] = mes;
    else next.meses.push(mes);
    next.meses.sort((a, b) => (a.mes > b.mes ? -1 : 1));
    onChange(next);
  };

  const handleRemoveMonth = (mes: string) => {
    const next = {
      ...secaoAnalise,
      canal: "instagram" as const,
      meses: (secaoAnalise?.meses ?? []).filter((m) => m.mes !== mes),
    };
    onChange(next);
  };

  const chartData = useMemo(
    () =>
      [...meses].sort((a, b) => (a.mes < b.mes ? -1 : 1)).map((m) => ({
        mes: m.mes,
        views: m.views,
        reach: m.reach,
        engagementRate: engagementRate(m) ?? 0,
        newFollowers: m.newFollowers,
        profileActivity: profileActivityTotal(m),
        bioLinkClicks: m.bioLinkClicks,
        dmsStarted: m.dmsStarted,
        conversions: m.conversions,
      })),
    [meses]
  );

  return (
    <div className="space-y-8">
      <AnaliseMonthForm
        meses={meses}
        onSave={handleSaveMonth}
        onRemove={handleRemoveMonth}
        disabled={disabled}
      />

      {selected && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>KPIs do mês selecionado ({selected.mes})</CardTitle>
              <p className="text-sm text-muted-foreground">
                Valores atuais e variação em relação ao mês anterior (MoM).
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard
                  label="Alcance"
                  value={selected.reach}
                  delta={anterior ? momPct(selected.reach, anterior.reach) : null}
                />
                <KpiCard
                  label="Taxa de engajamento"
                  value={engagementRate(selected)}
                  suffix="%"
                  delta={
                    anterior
                      ? momPct(
                          engagementRate(selected) ?? 0,
                          engagementRate(anterior) ?? 0
                        )
                      : null
                  }
                />
                <KpiCard
                  label="Engajamento total"
                  value={engagementTotal(selected)}
                  delta={
                    anterior
                      ? momPct(
                          engagementTotal(selected),
                          engagementTotal(anterior)
                        )
                      : null
                  }
                />
                <KpiCard
                  label="Novos seguidores"
                  value={selected.newFollowers}
                  delta={
                    anterior
                      ? momPct(selected.newFollowers, anterior.newFollowers)
                      : null
                  }
                />
                <KpiCard
                  label="Cliques na bio"
                  value={selected.bioLinkClicks}
                  delta={
                    anterior
                      ? momPct(selected.bioLinkClicks, anterior.bioLinkClicks)
                      : null
                  }
                />
              </div>
            </CardContent>
          </Card>

          {chartData.length >= 1 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Tendência — Distribuição</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Visualizações e alcance ao longo dos meses.
                  </p>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfigViews} className="h-[240px] w-full">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="mes" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(v) => (typeof v === "number" ? v.toLocaleString("pt-BR") : String(v))} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="views"
                        stroke="var(--color-views)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="reach"
                        stroke="var(--color-reach)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tendência — Engajamento e crescimento</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Taxa de engajamento (%) e novos seguidores.
                  </p>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfigRates} className="h-[240px] w-full">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="mes" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(v) => (typeof v === "number" ? v.toLocaleString("pt-BR") : String(v))} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="engagementRate"
                        stroke="var(--color-engagementRate)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="newFollowers"
                        stroke="var(--color-newFollowers)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tendência — Ação e conversão</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Atividade no perfil, cliques na bio, DMs e conversões.
                  </p>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfigAction} className="h-[240px] w-full">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="mes" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(v) => (typeof v === "number" ? v.toLocaleString("pt-BR") : String(v))} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="profileActivity"
                        stroke="var(--color-profileActivity)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="bioLinkClicks"
                        stroke="var(--color-bioLinkClicks)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="dmsStarted"
                        stroke="var(--color-dmsStarted)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="conversions"
                        stroke="var(--color-conversions)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </>
          )}

          <AnaliseInsights atual={selected} anterior={anterior} />
        </>
      )}

      {meses.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Registre pelo menos um mês no formulário acima para ver KPIs, gráficos e insights.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  delta,
  suffix = "",
}: {
  label: string;
  value: number | null;
  delta: number | null;
  suffix?: string;
}) {
  const display =
    value !== null ? `${typeof value === "number" ? value.toLocaleString("pt-BR") : value}${suffix}` : "—";
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{display}</p>
      {delta !== null && (
        <p
          className={
            delta >= 0 ? "text-xs text-green-600 dark:text-green-400" : "text-xs text-red-600 dark:text-red-400"
          }
        >
          {formatDelta(delta)} MoM
        </p>
      )}
    </div>
  );
}
