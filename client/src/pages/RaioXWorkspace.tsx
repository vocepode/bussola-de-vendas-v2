"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useRequirePillarAccess } from "@/_core/hooks/useRequirePillarAccess";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { RaioXModule, BloqueioNorte } from "@/components/raio-x/RaioXModule";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Eye, Loader2, Printer, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RaioXWorkspace() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { allowed, isLoading: pillarCheckLoading } = useRequirePillarAccess("raio-x");
  const utils = trpc.useUtils();
  const [printing, setPrinting] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const { data, isLoading, isError, error } = trpc.raioX.get.useQuery();
  useEffect(() => {
    if (data?.data?.updatedAt) {
      const t = data.data.updatedAt;
      setLastSavedAt(t instanceof Date ? t : new Date(t));
    }
  }, [data?.data?.updatedAt]);
  const saveSecao = trpc.raioX.saveSecao.useMutation({
    onSuccess: async (result, variables) => {
      if (result.updatedAt) setLastSavedAt(new Date(result.updatedAt));
      await utils.raioX.get.invalidate();
      await utils.dashboard.getOverview.invalidate();
      if (variables.secao === "analise") {
        toast.success("Dados do Instagram salvos.");
      }
    },
    onError: (err, variables) => {
      if (variables.secao === "analise") {
        toast.error(err.message || "Erro ao salvar os dados. Tente novamente.");
      }
    },
  });
  const concluirEtapa = trpc.raioX.concluirEtapa.useMutation({
    onSuccess: async (result) => {
      if (result.updatedAt) setLastSavedAt(new Date(result.updatedAt));
      await utils.raioX.get.invalidate();
      await utils.dashboard.getOverview.invalidate();
      toast.success("Etapa concluída!");
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao concluir etapa.");
    },
  });

  const handleSaveSecao = (secao: "redes_sociais" | "web" | "analise", payload: Record<string, unknown>) => {
    saveSecao.mutate({ secao, data: payload });
  };

  const handleConcluirEtapa = (secao: "redes_sociais" | "web" | "analise") => {
    concluirEtapa.mutate({ secao });
  };

  if (pillarCheckLoading || !allowed || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    const message = error?.message ?? "Erro ao carregar o módulo Raio-X.";
    return (
      <DashboardLayout>
        <div className="container py-8">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <p className="font-medium">Não foi possível carregar o Raio-X</p>
            <p className="mt-1 text-sm">{message}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div id="workspace-print-area" className="print-only" aria-hidden />
      <div className={cn("pillar-inner raio-x-inner min-h-screen screen-only", isDark ? "bg-[#0a0a0a]" : "bg-background")}>
        <header
          className={cn(
            "sticky top-0 z-10 border-b shadow-sm",
            isDark ? "border-[#262626] bg-[#111111]" : "bg-white border-border"
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
                <div className={cn("text-sm", isDark ? "text-white/60" : "text-muted-foreground")}>
                  Análise de canais
                </div>
                <h1 className={cn("text-xl font-bold truncate", isDark ? "text-white" : "text-foreground")}>
                  Raio-X
                </h1>
              </div>
              {data && !data.bloqueado && data.data && (
                <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
                  {saveSecao.isPending ? (
                    <span className={cn("text-xs", isDark ? "text-white/60" : "text-muted-foreground")}>Salvando…</span>
                  ) : lastSavedAt ? (
                    <span className={cn("text-xs", isDark ? "text-white/60" : "text-muted-foreground")}>
                      Salvo {lastSavedAt.toLocaleString("pt-BR")}
                    </span>
                  ) : null}
                  {(data.data.progressoGeral ?? 0) < 100 ? (
                    <Badge variant="secondary" className={cn("text-xs", isDark && "border-white/20 bg-white/10")}>
                      Rascunho
                    </Badge>
                  ) : (
                    <Badge className={cn("gap-1 text-xs", isDark ? "bg-green-600" : "bg-green-600")}>
                      Concluído
                    </Badge>
                  )}
                  <span className={cn("text-sm", isDark ? "text-white/60" : "text-muted-foreground")}>
                    {Math.round(((data.data.progressoGeral ?? 0) / 100) * 3)} de 3 etapas
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={printing}
                    className={cn("gap-2", isDark ? "border-white/20 text-white/90 hover:bg-white/10" : "")}
                    onClick={() => window.open("/raio-x/preview", "_blank")}
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
                      <DropdownMenuItem onClick={() => window.open("/raio-x/preview?pdf=full", "_blank")}>
                        <FileDown className="w-4 h-4 mr-2" />
                        PDF Completo
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open("/raio-x/preview", "_blank")}>
                        <FileDown className="w-4 h-4 mr-2" />
                        PDF por Etapa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
            {data && !data.bloqueado && data.data && (
              <div className="flex items-center gap-3">
                <Progress
                  value={data.data.progressoGeral ?? 0}
                  className={cn("h-2 flex-1 max-w-xs", isDark && "[&>div]:bg-primary")}
                />
                <span className={cn("text-sm font-medium tabular-nums", isDark ? "text-white/90" : "text-foreground")}>
                  {data.data.progressoGeral ?? 0}%
                </span>
              </div>
            )}
          </div>
        </header>

        <main className="container py-6">
          {data?.bloqueado ? (
            <BloqueioNorte />
          ) : data?.data ? (
            <RaioXModule
              data={data.data}
              norteData={data.norteData ?? undefined}
              progresso={data.data.progressoGeral ?? 0}
              onSaveSecao={handleSaveSecao}
              onConcluirEtapa={handleConcluirEtapa}
              isConcluindoEtapa={concluirEtapa.isPending}
              etapasConcluidas={data.data.etapasConcluidas}
            />
          ) : null}
        </main>
      </div>
    </DashboardLayout>
  );
}
