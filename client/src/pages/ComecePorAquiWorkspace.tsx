"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, Mail, MessageCircle } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const WORKSPACE_SLUG = "comece-por-aqui" as const;

const DEBOUNCE_MS = 800;

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

type FormData = Record<string, string>;

const FIELD_KEYS = [
  "nomeCompleto",
  "comoChamar",
  "whatsapp",
  "email",
  "nomeFantasia",
  "oQueFaz",
  "tempoMercado",
  "cidadeEstado",
  "enderecoCompleto",
  "instagram",
  "site",
] as const;

export default function ComecePorAquiWorkspace() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const utils = trpc.useUtils();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data: moduleData, isLoading: moduleLoading } = trpc.modules.getBySlug.useQuery(
    { slug: WORKSPACE_SLUG },
    { enabled: true }
  );

  const { data: lessons, isLoading: lessonsLoading } = trpc.lessons.listByModule.useQuery(
    { moduleId: moduleData?.id ?? 0 },
    { enabled: !!moduleData?.id }
  );

  const ensureWorkspace = trpc.workspaces.ensureComecePorAquiWorkspaceLessons.useMutation({
    onSuccess: async (data) => {
      await utils.modules.getBySlug.invalidate({ slug: WORKSPACE_SLUG });
      if (data?.moduleId) await utils.lessons.listByModule.invalidate({ moduleId: data.moduleId });
    },
  });

  const lessonId = lessons?.[0]?.id ?? null;

  const { data: state, isLoading: stateLoading, refetch: refetchState } = trpc.lessonState.get.useQuery(
    { lessonId: lessonId ?? 0 },
    { enabled: !!lessonId && isAuthenticated }
  );

  const upsertDraft = trpc.lessonState.upsertDraft.useMutation({
    onSuccess: () => {
      utils.lessonState.get.invalidate({ lessonId: lessonId! }).catch(() => {});
    },
  });

  const complete = trpc.lessonState.complete.useMutation({
    onSuccess: async () => {
      toast.success("Etapa concluída!");
      await utils.lessonState.get.invalidate({ lessonId: lessonId! });
      await utils.workspaces.getProgressBySlug.invalidate({ slug: WORKSPACE_SLUG });
      await utils.dashboard.getOverview.invalidate();
    },
    onError: (err) => toast.error(err.message ?? "Não foi possível concluir a etapa."),
  });

  const { data: progress } = trpc.workspaces.getProgressBySlug.useQuery(
    { slug: WORKSPACE_SLUG },
    { enabled: isAuthenticated && !!moduleData?.id }
  );

  const [localData, setLocalData] = useState<FormData>({});
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const raw = (state as any)?.data;
    const next: FormData = {};
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      for (const k of FIELD_KEYS) {
        const v = (raw as Record<string, unknown>)[k];
        next[k] = typeof v === "string" ? v : "";
      }
    }
    setLocalData(next);
    const updatedAt = (state as any)?.updatedAt ? new Date((state as any).updatedAt) : null;
    setLastSavedAt(updatedAt);
  }, [state?.lessonId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const scheduleSave = (patch: Record<string, unknown>) => {
    setLocalData((prev) => ({ ...prev, ...patch } as FormData));
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (!lessonId) return;
      upsertDraft.mutateAsync({ lessonId, patch }).then((res) => {
        setLastSavedAt(new Date(res.updatedAt));
      }).catch(() => {});
    }, DEBOUNCE_MS);
  };

  const handleComplete = () => {
    if (!lessonId) return;
    complete.mutate({ lessonId });
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    if (ensureWorkspace.isPending || ensureWorkspace.isSuccess) return;
    ensureWorkspace.mutate();
  }, [isAuthenticated]);

  if (authLoading || moduleLoading || lessonsLoading || (ensureWorkspace.isPending && !moduleData)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
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

  if (!moduleData || !lessonId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Módulo não encontrado</h2>
          <Link href="/">
            <Button variant="outline">Voltar ao Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const status = (state as any)?.status as "draft" | "completed" | undefined;
  const savedLabel = upsertDraft.isPending ? "Salvando…" : lastSavedAt ? `Salvo ${lastSavedAt.toLocaleString()}` : "Não salvo ainda";

  return (
    <DashboardLayout>
      <div className="pillar-inner comece-inner min-h-screen bg-background screen-only">
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
                  Dashboard
                </Button>
              </Link>
              <div className="flex-1 min-w-0">
                <div className={cn("text-sm", isDark ? "text-white/60" : "text-muted-foreground")}>
                  Primeiros passos
                </div>
                <h1 className={cn("text-xl font-bold truncate", isDark ? "text-white" : "")}>
                  {moduleData.title}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-sm", isDark ? "text-white/60" : "text-muted-foreground")}>
                  {savedLabel}
                </span>
                {status === "completed" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/20 px-2 py-1 text-sm font-medium text-primary">
                    <CheckCircle2 className="h-4 w-4" /> Concluído
                  </span>
                ) : (
                  <Button
                    onClick={handleComplete}
                    disabled={complete.isPending}
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Concluir etapa
                  </Button>
                )}
              </div>
            </div>
            {progress != null && (
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 max-w-xs rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <span className={cn("text-sm font-medium tabular-nums", isDark ? "text-white/90" : "")}>
                  {progress.percentage}%
                </span>
              </div>
            )}
          </div>
        </header>

        <main className="container py-6 max-w-3xl">
          <Card className={cn(isDark ? "border-[#262626] bg-[#161616]" : "")}>
            <CardHeader>
              <CardTitle className={cn(isDark ? "text-white" : "")}>Comece por Aqui</CardTitle>
              <p className={cn("text-sm", isDark ? "text-white/70" : "text-muted-foreground")}>
                Preencha suas informações para personalizar sua jornada.
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* SEÇÃO 1 — Sobre você */}
              <section className="space-y-4">
                <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "")}>Sobre você</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nomeCompleto" className={isDark ? "text-white/80" : ""}>Nome completo</Label>
                    <Input
                      id="nomeCompleto"
                      value={localData.nomeCompleto ?? ""}
                      onChange={(e) => scheduleSave({ nomeCompleto: e.target.value })}
                      className={isDark ? "border-white/20 bg-white/5 text-white placeholder:text-white/50" : "bg-background text-foreground placeholder:text-muted-foreground"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comoChamar" className={isDark ? "text-white/80" : ""}>Como prefere ser chamado(a)</Label>
                    <Input
                      id="comoChamar"
                      value={localData.comoChamar ?? ""}
                      onChange={(e) => scheduleSave({ comoChamar: e.target.value })}
                      className={isDark ? "border-white/20 bg-white/5 text-white placeholder:text-white/50" : "bg-background text-foreground placeholder:text-muted-foreground"}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className={isDark ? "text-white/80" : ""}>WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={localData.whatsapp ?? ""}
                      onChange={(e) => scheduleSave({ whatsapp: formatPhone(e.target.value) })}
                      placeholder="(00) 00000-0000"
                      className={isDark ? "border-white/20 bg-white/5 text-white placeholder:text-white/50" : "bg-background text-foreground placeholder:text-muted-foreground"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className={isDark ? "text-white/80" : ""}>E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={localData.email ?? ""}
                      onChange={(e) => scheduleSave({ email: e.target.value })}
                      className={isDark ? "border-white/20 bg-white/5 text-white placeholder:text-white/50" : "bg-background text-foreground placeholder:text-muted-foreground"}
                    />
                  </div>
                </div>
              </section>

              {/* SEÇÃO 2 — Sobre a empresa */}
              <section className="space-y-4">
                <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "")}>Sobre a empresa</h2>
                <div className="space-y-2">
                  <Label htmlFor="nomeFantasia" className={isDark ? "text-white/80" : ""}>Nome fantasia</Label>
                  <Input
                    id="nomeFantasia"
                    value={localData.nomeFantasia ?? ""}
                    onChange={(e) => scheduleSave({ nomeFantasia: e.target.value })}
                    className={isDark ? "border-white/20 bg-white/5 text-white placeholder:text-white/50" : "bg-background text-foreground placeholder:text-muted-foreground"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oQueFaz" className={isDark ? "text-white/80" : ""}>Em uma linha: o que sua empresa faz?</Label>
                  <Input
                    id="oQueFaz"
                    value={localData.oQueFaz ?? ""}
                    onChange={(e) => scheduleSave({ oQueFaz: e.target.value })}
                    placeholder="Ex: Clínica de estética especializada em rejuvenescimento facial"
                    className={isDark ? "border-white/20 bg-white/5 text-white placeholder:text-white/50" : "bg-background text-foreground placeholder:text-muted-foreground"}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tempoMercado" className={isDark ? "text-white/80" : ""}>Tempo de mercado</Label>
                    <Input
                      id="tempoMercado"
                      value={localData.tempoMercado ?? ""}
                      onChange={(e) => scheduleSave({ tempoMercado: e.target.value })}
                      placeholder="Ex: 5 anos"
                      className={isDark ? "border-white/20 bg-white/5 text-white placeholder:text-white/50" : "bg-background text-foreground placeholder:text-muted-foreground"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cidadeEstado" className={isDark ? "text-white/80" : ""}>Cidade e estado</Label>
                    <Input
                      id="cidadeEstado"
                      value={localData.cidadeEstado ?? ""}
                      onChange={(e) => scheduleSave({ cidadeEstado: e.target.value })}
                      className={isDark ? "border-white/20 bg-white/5 text-white placeholder:text-white/50" : "bg-background text-foreground placeholder:text-muted-foreground"}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enderecoCompleto" className={isDark ? "text-white/80" : ""}>Endereço físico completo</Label>
                  <Textarea
                    id="enderecoCompleto"
                    value={localData.enderecoCompleto ?? ""}
                    onChange={(e) => scheduleSave({ enderecoCompleto: e.target.value })}
                    rows={3}
                    className={isDark ? "border-white/20 bg-white/5 text-white placeholder:text-white/50" : "bg-background text-foreground placeholder:text-muted-foreground"}
                  />
                </div>
              </section>

              {/* SEÇÃO 3 — Principais canais */}
              <section className="space-y-4">
                <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "")}>Principais canais</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className={isDark ? "text-white/80" : ""}>Instagram</Label>
                    <Input
                      id="instagram"
                      value={localData.instagram ?? ""}
                      onChange={(e) => scheduleSave({ instagram: e.target.value })}
                      placeholder="@usuario"
                      className={isDark ? "border-white/20 bg-white/5 text-white placeholder:text-white/50" : "bg-background text-foreground placeholder:text-muted-foreground"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site" className={isDark ? "text-white/80" : ""}>Site</Label>
                    <Input
                      id="site"
                      value={localData.site ?? ""}
                      onChange={(e) => scheduleSave({ site: e.target.value })}
                      placeholder="https://"
                      className={isDark ? "border-white/20 bg-white/5 text-white placeholder:text-white/50" : "bg-background text-foreground placeholder:text-muted-foreground"}
                    />
                  </div>
                </div>
              </section>

              {/* SEÇÃO 4 — Seu contato na VocêPode+ (somente leitura) */}
              <section className="space-y-4">
                <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "")}>Seu contato na VocêPode+</h2>
                <Card className={cn(isDark ? "border-[#262626] bg-[#1a1a1a]" : "bg-muted/30")}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold">
                        A
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className={cn("font-semibold", isDark ? "text-white" : "")}>Aurora</p>
                        <a
                          href="mailto:suporte@vocepodevendermais.com.br"
                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:underline"
                        >
                          <Mail className="h-4 w-4" />
                          suporte@vocepodevendermais.com.br
                        </a>
                        <a
                          href="https://wa.me/5531973438446"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:underline"
                        >
                          <MessageCircle className="h-4 w-4" />
                          (31) 97343-8446
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {status !== "completed" && (
                <div className="flex justify-end pt-4">
                  <Button onClick={handleComplete} disabled={complete.isPending} className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Concluir etapa
                  </Button>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-border mt-6">
                <Link href="/">
                  <Button variant="outline" size="sm">← Voltar ao Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </DashboardLayout>
  );
}
