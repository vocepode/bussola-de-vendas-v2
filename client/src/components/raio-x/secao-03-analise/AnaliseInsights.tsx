"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import type { AnaliseMensal } from "@/lib/raio-x/schema";
import {
  engagementRate,
  profileActivityTotal,
  momPct,
  engagementTotal,
} from "@/lib/raio-x/analysis-metrics";

interface AnaliseInsightsProps {
  atual: AnaliseMensal | null;
  anterior: AnaliseMensal | null;
}

export function AnaliseInsights({ atual, anterior }: AnaliseInsightsProps) {
  if (!atual) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4" />
            Insights automáticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Selecione e salve um mês no formulário acima para ver insights baseados nas métricas.
          </p>
        </CardContent>
      </Card>
    );
  }

  const er = engagementRate(atual);
  const profileActivity = profileActivityTotal(atual);
  const engagement = engagementTotal(atual);
  const reachMoM = anterior ? momPct(atual.reach, anterior.reach) : null;
  const engagementMoM = anterior ? momPct(engagement, engagementTotal(anterior)) : null;
  const newFollowersMoM = anterior ? momPct(atual.newFollowers, anterior.newFollowers) : null;

  const messages: string[] = [];

  if (er !== null) {
    if (er >= 5) messages.push("Taxa de engajamento forte (≥5%). Continue mantendo a qualidade do conteúdo.");
    else if (er >= 2) messages.push("Taxa de engajamento na média. Há espaço para testar mais CTAs e interação.");
    else if (atual.reach > 0)
      messages.push("Taxa de engajamento baixa. Vale revisar o tipo de conteúdo e horários de publicação.");
  }

  if (atual.newFollowers > 0)
    messages.push("Novos seguidores no mês. Ótimo sinal de relevância do conteúdo.");
  else if (newFollowersMoM !== null && newFollowersMoM < -20)
    messages.push("Queda nos novos seguidores em relação ao mês anterior. Verifique se o conteúdo está alinhado à audiência.");

  if (profileActivity > 0 && atual.bioLinkClicks > 0)
    messages.push("Link na bio está gerando cliques. Bom uso do perfil para conversão.");

  if (reachMoM !== null && reachMoM < -10)
    messages.push("Alcance caiu em relação ao mês anterior. Considere testar novos formatos ou horários.");

  if (engagementMoM !== null && engagementMoM > 20)
    messages.push("Engajamento total subiu em relação ao mês anterior. Conteúdo está ressoando.");

  if (atual.conversions > 0)
    messages.push("Conversões registradas. Acompanhe a jornada da audiência até a venda.");

  if (messages.length === 0)
    messages.push("Preencha mais métricas e salve outro mês para comparação e insights mais ricos.");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-4 w-4" />
          Insights automáticos
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Mensagens baseadas em regras simples a partir dos dados do mês selecionado.
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {messages.map((msg, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-primary shrink-0">•</span>
              <span>{msg}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
