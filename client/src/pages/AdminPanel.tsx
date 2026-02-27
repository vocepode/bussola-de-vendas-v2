"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

export default function AdminPanel() {
  const { user, loading } = useAuth();
  const isAdmin = user?.role === "admin";

  const usersQuery = trpc.admin.listUsers.useQuery(undefined, { enabled: isAdmin });
  const utils = trpc.useUtils();
  const [initialPasswordModalOpen, setInitialPasswordModalOpen] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; initialPassword: string } | null>(null);

  const createUser = trpc.admin.createUser.useMutation({
    onSuccess: ({ initialPassword }, variables) => {
      toast.success("Usuário criado");
      setCreatedCredentials({ email: variables.email.trim().toLowerCase(), initialPassword });
      setInitialPasswordModalOpen(true);
      void utils.admin.listUsers.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const setAccess = trpc.admin.setUserAccess.useMutation({
    onSuccess: () => {
      void utils.admin.listUsers.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const generateResetLink = trpc.admin.generatePasswordResetLink.useMutation({
    onSuccess: async ({ resetUrl }) => {
      const fullUrl = `${window.location.origin}${resetUrl}`;
      try {
        await navigator.clipboard.writeText(fullUrl);
        toast.success("Link copiado para a área de transferência");
      } catch {
        toast.info(`Link gerado: ${fullUrl}`);
      }
    },
    onError: (error) => toast.error(error.message),
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [active, setActive] = useState(true);

  const submitting = createUser.isPending;

  const sortedUsers = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createUser.mutateAsync({
      name: name.trim() || undefined,
      email,
      role: "user",
      isActive: active,
    });
    setName("");
    setEmail("");
    setActive(true);
  };

  const copyInitialPassword = async () => {
    if (!createdCredentials) return;
    try {
      await navigator.clipboard.writeText(createdCredentials.initialPassword);
      toast.success("Senha inicial copiada");
    } catch {
      toast.error("Não foi possível copiar a senha");
    }
  };

  if (loading) return null;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Área restrita</CardTitle>
            <CardDescription>Faça login para acessar o painel administrativo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Ir para login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Sem permissão</CardTitle>
            <CardDescription>Este painel é exclusivo para administradores.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full" variant="outline">
                Voltar ao início
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie liberação de acesso e recuperação de senha dos usuários.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Criar usuário</CardTitle>
            <CardDescription>
              A senha inicial é definida por variável de ambiente e exibida apenas uma vez após criar o usuário.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onCreate} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Acesso liberado</Label>
                <div className="h-10 flex items-center">
                  <Switch checked={active} onCheckedChange={setActive} />
                </div>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Criando..." : "Criar usuário"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
            <CardDescription>Ative/desative acesso e gere link de redefinição de senha.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {usersQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando usuários...</p>
            ) : sortedUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
            ) : (
              sortedUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium">{u.name || "Sem nome"}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                    <p className="text-xs text-muted-foreground">Perfil: {u.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={u.isActive ? "outline" : "default"}
                      onClick={() => setAccess.mutate({ userId: u.id, isActive: !u.isActive })}
                      disabled={setAccess.isPending}
                    >
                      {u.isActive ? "Bloquear acesso" : "Liberar acesso"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => generateResetLink.mutate({ userId: u.id })}
                      disabled={generateResetLink.isPending}
                    >
                      Copiar link de senha
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={initialPasswordModalOpen}
        onOpenChange={(open) => {
          setInitialPasswordModalOpen(open);
          if (!open) setCreatedCredentials(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Senha inicial do usuário</DialogTitle>
            <DialogDescription>Esta senha é exibida apenas nesta tela. Copie e envie ao usuário.</DialogDescription>
          </DialogHeader>
          {createdCredentials ? (
            <div className="space-y-3">
              <div className="rounded-md border p-3 text-sm">
                <p>
                  <span className="font-medium">Email:</span> {createdCredentials.email}
                </p>
                <p>
                  <span className="font-medium">Senha inicial:</span> {createdCredentials.initialPassword}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={copyInitialPassword}>
                  Copiar senha
                </Button>
                <Button onClick={() => setInitialPasswordModalOpen(false)}>Fechar</Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
