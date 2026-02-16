"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Informe seu email");
      return;
    }

    setSubmitting(true);
    setDevResetUrl(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(payload?.error ?? "Falha ao solicitar recuperação");
        return;
      }

      if (payload?.devResetUrl) setDevResetUrl(payload.devResetUrl);
      toast.success(payload?.message ?? "Solicitação recebida");
    } catch {
      toast.error("Erro de rede ao solicitar recuperação");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Recuperar senha</CardTitle>
          <CardDescription>
            Informe seu email para solicitar a redefinição de senha.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@empresa.com"
                disabled={submitting}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Enviando..." : "Solicitar recuperação"}
            </Button>
          </form>

          {devResetUrl ? (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
              <p className="font-medium text-amber-800">Ambiente de desenvolvimento:</p>
              <a className="text-amber-900 underline break-all" href={devResetUrl}>
                {devResetUrl}
              </a>
            </div>
          ) : null}

          <Link href="/login" className="block text-center text-sm text-primary hover:underline">
            Voltar para login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
