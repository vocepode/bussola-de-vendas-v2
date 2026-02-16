"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) return;
    router.replace("/");
  }, [isAuthenticated, loading, router]);

  if (loading || isAuthenticated) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Preencha email e senha");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(payload?.error ?? "Falha no login");
        return;
      }

      window.location.href = "/";
    } catch {
      toast.error("Erro de rede ao fazer login");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full border-none bg-transparent text-white shadow-none">
      <CardContent className="space-y-2.5 px-0">
        <form onSubmit={handleLogin} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-normal text-slate-300 md:text-sm">
              E-mail
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-slate-400" />
              <Input
                id="email"
                type="email"
                className="h-9 rounded-lg border border-slate-700 bg-[#e7edf5] pl-9 text-sm text-slate-900 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-[#9fc0e4] md:h-10"
                placeholder="vocepode@vocepode.pro"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-normal text-slate-300 md:text-sm">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="h-9 rounded-lg border border-slate-700 bg-[#e7edf5] pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-[#9fc0e4] md:h-10"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                onClick={() => setShowPassword((v) => !v)}
                disabled={submitting}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-[12px] text-slate-400 md:text-sm">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={rememberMe}
                onCheckedChange={(value) => setRememberMe(Boolean(value))}
                className="h-4 w-4 rounded-[4px] border-slate-600 data-[state=checked]:bg-[#9fc0e4] data-[state=checked]:text-slate-900"
              />
              <span>Lembrar de mim</span>
            </label>
            <Link href="/recuperar-senha" className="hover:text-slate-200">
              Esqueceu sua senha?
            </Link>
          </div>

          <Button
            type="submit"
            className="mx-auto mt-1 flex h-10 w-32 rounded-full bg-[#5f3f97] text-base font-semibold text-white hover:bg-[#6a47a8] md:mt-2 md:w-40"
            disabled={submitting}
          >
            {submitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
