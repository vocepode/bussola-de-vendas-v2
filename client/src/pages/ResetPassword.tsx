"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPassword() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Token de recuperação ausente");
      return;
    }
    if (password.length < 8) {
      toast.error("A senha precisa ter ao menos 8 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não conferem");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(payload?.error ?? "Falha ao redefinir senha");
        return;
      }

      setDone(true);
      toast.success("Senha redefinida com sucesso");
    } catch {
      toast.error("Erro de rede ao redefinir senha");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Redefinir senha</CardTitle>
          <CardDescription>Defina sua nova senha de acesso.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {done ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Sua senha foi atualizada. Faça login novamente.</p>
              <Link href="/login">
                <Button className="w-full">Ir para login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Salvando..." : "Salvar nova senha"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
