"use client";

import { useEffect, useRef, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Lock, Save, ShieldCheck, Upload, User } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const utils = trpc.useUtils();
  const { data: me } = trpc.auth.me.useQuery();

  const [name, setName] = useState(me?.name ?? "");
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

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <div>
          <h1 className="text-3xl font-semibold">Configurações</h1>
          <p className="text-sm text-white/60">Gerencie suas informações pessoais e preferências</p>
        </div>

        <Tabs defaultValue="perfil" className="space-y-4">
          <TabsList className="grid h-11 w-full grid-cols-2 bg-white/5 p-1">
            <TabsTrigger value="perfil" className="data-[state=active]:bg-violet-500/25 data-[state=active]:text-violet-300 data-[state=active]:[&>svg]:text-violet-300">
              <User className="h-4 w-4" /> Perfil
            </TabsTrigger>
            <TabsTrigger value="seguranca" className="data-[state=active]:bg-red-500/25 data-[state=active]:text-red-400 data-[state=active]:[&>svg]:text-red-400">
              <Lock className="h-4 w-4" /> Segurança
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfil">
            <Card className="border-[#262626] bg-[#161616] p-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-violet-500/20 p-2 text-violet-400">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Meu Perfil</h2>
                  <p className="text-xs text-white/55">Informações pessoais e foto de perfil</p>
                </div>
              </div>

              <form onSubmit={onSaveProfile} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                  <div className="space-y-2">
                    <Label className="text-white/80">Foto de Perfil</Label>
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
                      className="flex h-28 w-28 cursor-pointer items-center justify-center rounded-full border border-dashed border-white/30 text-xs text-white/45 transition hover:border-white/50 hover:bg-white/5 disabled:pointer-events-none disabled:opacity-60"
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
                          <Upload className="h-6 w-6 text-white/60" />
                          {uploading ? "Enviando…" : "Upload"}
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-white/80">Nome Completo</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="border-white/15 bg-white/5 text-white" />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-white/80">Email</Label>
                      <Input id="email" value={me?.email ?? ""} disabled className="border-white/10 bg-white/5 text-white/55" />
                      <p className="text-[11px] text-white/40">O email não pode ser alterado</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-white/80">Função</Label>
                      <div>
                        <Badge className="bg-white/10 text-white">{me?.role === "admin" ? "Admin" : "Aluno"}</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" className="bg-violet-700 hover:bg-violet-600 text-white" disabled={updateProfile.isPending}>
                    <Save className="mr-2 h-4 w-4" /> Salvar Perfil
                  </Button>
                </div>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="seguranca">
            <Card className="border-[#262626] bg-[#161616] p-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-red-500/20 p-2 text-red-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Segurança</h2>
                  <p className="text-xs text-white/55">Altere sua senha de acesso</p>
                </div>
              </div>

              <form onSubmit={onChangePassword} className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="currentPassword" className="text-white/80">Senha Atual</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="border-white/15 bg-white/5 text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword" className="text-white/80">Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="border-white/15 bg-white/5 text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-white/80">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="border-white/15 bg-white/5 text-white"
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
