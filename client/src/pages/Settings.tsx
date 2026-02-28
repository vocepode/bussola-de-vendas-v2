"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { hasClientAdminPrivileges } from "@/lib/adminAccess";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { Lock, Save, ShieldCheck, Upload, User } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const utils = trpc.useUtils();
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const isDark = theme === "dark";
  const { data: me } = trpc.auth.me.useQuery();
  const isAdmin = hasClientAdminPrivileges(me);
  const mustChangePassword = Boolean(me?.mustChangePassword) || searchParams.get("forcarTrocaSenha") === "1";

  const [name, setName] = useState(me?.name ?? "");
  const [activeTab, setActiveTab] = useState<"perfil" | "seguranca">("perfil");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: async () => {
      toast.success("Perfil atualizado com sucesso");
      await utils.auth.me.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Falha ao atualizar perfil");
    },
  });

  const changePassword = trpc.auth.changePassword.useMutation({
    onSuccess: async () => {
      toast.success("Senha alterada com sucesso. Faça login novamente.");
      await utils.auth.me.invalidate();
      window.location.href = "/login";
    },
    onError: (error) => {
      toast.error(error.message || "Falha ao alterar senha");
    },
  });

  useEffect(() => {
    setName(me?.name ?? "");
  }, [me?.name]);

  useEffect(() => {
    if (mustChangePassword) {
      setActiveTab("seguranca");
    }
  }, [mustChangePassword]);

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mustChangePassword) {
      toast.error("Altere a senha inicial antes de editar o perfil");
      return;
    }
    if (!name.trim()) {
      toast.error("Informe seu nome completo");
      return;
    }
    await updateProfile.mutateAsync({ name: name.trim() });
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos de senha");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("A confirmação da senha não confere");
      return;
    }

    await changePassword.mutateAsync({ currentPassword, newPassword });
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Falha no upload da foto");
        return;
      }
      if (typeof data.url !== "string") {
        toast.error("Resposta inválida do servidor");
        return;
      }
      await updateProfile.mutateAsync({
        name: name.trim() || (me?.name ?? "") || "Aluno",
        avatarUrl: data.url,
      });
      toast.success("Foto de perfil atualizada");
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="content-inner settings-inner mx-auto w-full max-w-5xl space-y-5">
        <div>
          <h1 className={cn("text-3xl font-semibold", isDark ? "text-white" : "text-foreground")}>Configurações</h1>
          <p className={cn("text-sm", isDark ? "text-white/70" : "text-muted-foreground")}>Gerencie suas informações pessoais e preferências</p>
        </div>

        {mustChangePassword ? (
          <div
            className={cn(
              "rounded-xl border px-4 py-3 text-sm",
              isDark
                ? "border-amber-300/30 bg-amber-500/10 text-amber-100"
                : "border-amber-300 bg-amber-50 text-amber-900"
            )}
          >
            Seu acesso está com senha inicial temporária. Troque sua senha agora para continuar usando a plataforma.
          </div>
        ) : null}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "perfil" | "seguranca")} className="space-y-4">
          <TabsList
            className={cn(
              "grid h-11 w-full grid-cols-2 p-1",
              isDark ? "bg-white/10" : "bg-muted border border-border"
            )}
          >
            <TabsTrigger
              value="perfil"
              disabled={mustChangePassword}
              className={cn(
                isDark
                  ? "data-[state=inactive]:text-white/70 data-[state=active]:bg-violet-500/30 data-[state=active]:text-white data-[state=active]:[&>svg]:text-white"
                  : "data-[state=inactive]:text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:[&>svg]:text-primary-foreground"
              )}
            >
              <User className="h-4 w-4" /> Perfil
            </TabsTrigger>
            <TabsTrigger
              value="seguranca"
              className={cn(
                isDark
                  ? "data-[state=inactive]:text-white/70 data-[state=active]:bg-red-500/30 data-[state=active]:text-white data-[state=active]:[&>svg]:text-white"
                  : "data-[state=inactive]:text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:[&>svg]:text-primary-foreground"
              )}
            >
              <Lock className="h-4 w-4" /> Segurança
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfil">
            <Card className={cn("p-5", isDark ? "border-[#262626] bg-[#161616]" : "border-border bg-card")}>
              <div className="mb-5 flex items-center gap-3">
                <div className={cn("rounded-lg p-2", isDark ? "bg-violet-500/20 text-violet-400" : "bg-primary/10 text-primary")}>
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-foreground")}>Meu Perfil</h2>
                  <p className={cn("text-xs", isDark ? "text-white/70" : "text-muted-foreground")}>Informações pessoais e foto de perfil</p>
                </div>
              </div>

              <form onSubmit={onSaveProfile} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                  <div className="space-y-2">
                    <Label className={isDark ? "text-white/90" : "text-foreground"}>Foto de Perfil</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="sr-only"
                      aria-label="Selecionar foto de perfil"
                      onChange={onAvatarChange}
                      disabled={uploading}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className={cn(
                        "flex h-28 w-28 cursor-pointer items-center justify-center rounded-full border border-dashed text-xs transition disabled:pointer-events-none disabled:opacity-60",
                        isDark
                          ? "border-white/30 text-white/70 hover:border-white/50 hover:bg-white/5"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      {me?.avatarUrl ? (
                        <Avatar className="h-28 w-28 rounded-full border-0">
                          <AvatarImage src={me.avatarUrl} alt="" className="object-cover" />
                          <AvatarFallback className="bg-violet-600 text-lg text-white">
                            {(me?.name ?? me?.email ?? "?").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <span className="flex flex-col items-center gap-1">
                          <Upload className="h-6 w-6" />
                          {uploading ? "Enviando…" : "Upload"}
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className={isDark ? "text-white/90" : "text-foreground"}>Nome Completo</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={isDark ? "border-white/20 bg-white/5 text-white placeholder:text-white/50" : "bg-background text-foreground placeholder:text-muted-foreground"}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className={isDark ? "text-white/90" : "text-foreground"}>Email</Label>
                      <Input
                        id="email"
                        value={me?.email ?? ""}
                        disabled
                        className={isDark ? "border-white/15 bg-white/5 text-white/80" : "bg-muted text-foreground"}
                      />
                      <p className={cn("text-[11px]", isDark ? "text-white/60" : "text-muted-foreground")}>O email não pode ser alterado</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label className={isDark ? "text-white/90" : "text-foreground"}>Função</Label>
                      <div>
                        <Badge className={isDark ? "bg-white/10 text-white" : "bg-muted text-foreground"}>{isAdmin ? "Admin" : "Aluno"}</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-violet-700 hover:bg-violet-600 text-white"
                    disabled={updateProfile.isPending || mustChangePassword}
                  >
                    <Save className="mr-2 h-4 w-4" /> Salvar Perfil
                  </Button>
                </div>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="seguranca">
            <Card className={cn("p-5", isDark ? "border-[#262626] bg-[#161616]" : "border-border bg-card")}>
              <div className="mb-5 flex items-center gap-3">
                <div className={cn("rounded-lg p-2", isDark ? "bg-red-500/20 text-red-400" : "bg-destructive/10 text-destructive")}>
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-foreground")}>Segurança</h2>
                  <p className={cn("text-xs", isDark ? "text-white/70" : "text-muted-foreground")}>Altere sua senha de acesso</p>
                </div>
              </div>

              <form onSubmit={onChangePassword} className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="currentPassword" className={isDark ? "text-white/90" : "text-foreground"}>Senha Atual</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder={mustChangePassword ? "Digite a senha inicial recebida" : undefined}
                      className={isDark ? "border-white/20 bg-white/5 text-white placeholder:text-white/50" : "bg-background text-foreground placeholder:text-muted-foreground"}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword" className={isDark ? "text-white/90" : "text-foreground"}>Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={isDark ? "border-white/20 bg-white/5 text-white placeholder:text-white/50" : "bg-background text-foreground placeholder:text-muted-foreground"}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className={isDark ? "text-white/90" : "text-foreground"}>Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={isDark ? "border-white/20 bg-white/5 text-white placeholder:text-white/50" : "bg-background text-foreground placeholder:text-muted-foreground"}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" className="bg-red-600 text-white hover:bg-red-500" disabled={changePassword.isPending}>
                    <Lock className="mr-2 h-4 w-4" /> Alterar Senha
                  </Button>
                </div>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
