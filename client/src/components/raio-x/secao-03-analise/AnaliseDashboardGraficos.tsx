"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import type { AnaliseMensal } from "@/lib/raio-x/schema";
import {
  engagementRate,
  profileActivityTotal,
  momPct,
  engagementTotal,
  formatDelta,
} from "@/lib/raio-x/analysis-metrics";
import { AnaliseInsights } from "./AnaliseInsights";

interface AnaliseDashboardGraficosProps {
  meses: AnaliseMensal[];
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

export function AnaliseDashboardGraficos({ meses }: AnaliseDashboardGraficosProps) {
  const sortedMeses = useMemo(
    () => [...meses].sort((a, b) => (a.mes < b.mes ? 1 : -1)),
    [meses]
  );
  const selected = sortedMeses[0] ?? null;
  const anterior = sortedMeses[1] ?? null;

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

  if (meses.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Registre pelo menos um mês em &quot;Dados do Instagram&quot; para ver KPIs, gráficos e insights.
        </CardContent>
      </Card>
    );
  }

  if (!selected) return null;

  const soUmMes = meses.length === 1;
  const engRate = engagementRate(selected);

  return (
    <div className="space-y-8">
      {/* Resumo em destaque do mês (dados atuais sempre visíveis) */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Resumo do mês — {selected.mes}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {soUmMes
              ? "Dados atuais do mês registrado. Adicione mais um mês para ver comparação MoM e tendência."
              : "Valores atuais e variação em relação ao mês anterior (MoM)."}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <div className="rounded-lg border bg-background p-3">
              <p className="text-xs text-muted-foreground">Visualizações</p>
              <p className="text-xl font-semibold tabular-nums">{selected.views.toLocaleString("pt-BR")}</p>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <p className="text-xs text-muted-foreground">Alcance</p>
              <p className="text-xl font-semibold tabular-nums">{selected.reach.toLocaleString("pt-BR")}</p>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <p className="text-xs text-muted-foreground">Engajamento total</p>
              <p className="text-xl font-semibold tabular-nums">{engagementTotal(selected).toLocaleString("pt-BR")}</p>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <p className="text-xs text-muted-foreground">Taxa engajamento</p>
              <p className="text-xl font-semibold tabular-nums">{engRate != null ? `${engRate.toFixed(1)}%` : "—"}</p>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <p className="text-xs text-muted-foreground">Novos seguidores</p>
              <p className="text-xl font-semibold tabular-nums">{selected.newFollowers.toLocaleString("pt-BR")}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-3">
            <div className="rounded-lg border bg-background p-2">
              <p className="text-xs text-muted-foreground">Cliques na bio</p>
              <p className="text-lg font-semibold tabular-nums">{selected.bioLinkClicks.toLocaleString("pt-BR")}</p>
            </div>
            <div className="rounded-lg border bg-background p-2">
              <p className="text-xs text-muted-foreground">DMs iniciadas</p>
              <p className="text-lg font-semibold tabular-nums">{selected.dmsStarted.toLocaleString("pt-BR")}</p>
            </div>
            <div className="rounded-lg border bg-background p-2">
              <p className="text-xs text-muted-foreground">Conversões</p>
              <p className="text-lg font-semibold tabular-nums">{selected.conversions.toLocaleString("pt-BR")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>KPIs do mês selecionado ({selected.mes})</CardTitle>
          <p className="text-sm text-muted-foreground">
            Detalhe e variação em relação ao mês anterior (MoM).
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
              delta={anterior ? momPct(selected.newFollowers, anterior.newFollowers) : null}
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
          {soUmMes && (
            <p className="text-sm text-muted-foreground">
              Com mais de um mês registrado, os gráficos abaixo mostrarão a tendência ao longo do tempo.
            </p>
          )}
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
              <CardTitle>Tendência — Engajamento e novos seguidores</CardTitle>
              <p className="text-sm text-muted-foreground">
                Taxa de engajamento (%) e novos seguidores ao longo dos meses.
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
    </div>
  );
}
