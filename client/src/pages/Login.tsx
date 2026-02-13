"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getLoginUrl } from "@/const";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // #region agent log
    try {
      const probe = document.createElement("div");
      probe.className = "text-4xl";
      probe.style.position = "absolute";
      probe.style.visibility = "hidden";
      probe.textContent = "probe";
      document.body.appendChild(probe);
      const fontSize = getComputedStyle(probe).fontSize;
      probe.remove();

      fetch("http://127.0.0.1:7242/ingest/6525ceb4-a6e9-48a8-a6b4-9299a34af0f0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "debug-session",
          runId: "pre-fix-1",
          hypothesisId: "H1",
          location: "client/src/pages/Login.tsx:probe",
          message: "Login CSS probe",
          data: { fontSize },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    } catch (e) {
      fetch("http://127.0.0.1:7242/ingest/6525ceb4-a6e9-48a8-a6b4-9299a34af0f0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "debug-session",
          runId: "pre-fix-1",
          hypothesisId: "H2",
          location: "client/src/pages/Login.tsx:probe",
          message: "Login CSS probe failed",
          data: { error: String(e) },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    }
    // #endregion agent log
  }, []);

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (!isAuthenticated) return;
    router.replace("/");
  }, [isAuthenticated, router]);
  if (isAuthenticated) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/6525ceb4-a6e9-48a8-a6b4-9299a34af0f0", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "login-click-1",
        hypothesisId: "H6",
        location: "client/src/pages/Login.tsx:handleLogin",
        message: "Login submit clicked",
        data: {
          emailPresent: Boolean(email?.trim()),
          passwordPresent: Boolean(password),
          submitting,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log

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

      // #region agent log
      fetch("http://127.0.0.1:7242/ingest/6525ceb4-a6e9-48a8-a6b4-9299a34af0f0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "debug-session",
          runId: "login-click-1",
          hypothesisId: "H7",
          location: "client/src/pages/Login.tsx:handleLogin",
          message: "Login response received",
          data: {
            status: res.status,
            ok: res.ok,
            hasErrorField: Boolean((payload as any)?.error),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion agent log

      if (!res.ok) {
        toast.error(payload?.error ?? "Falha no login");
        return;
      }

      // Recarrega para garantir que o cache/auth seja atualizado.
      window.location.href = "/";
    } catch {
      // #region agent log
      fetch("http://127.0.0.1:7242/ingest/6525ceb4-a6e9-48a8-a6b4-9299a34af0f0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "debug-session",
          runId: "login-click-1",
          hypothesisId: "H8",
          location: "client/src/pages/Login.tsx:handleLogin",
          message: "Login fetch threw",
          data: {},
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion agent log
      toast.error("Erro de rede ao fazer login");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 gradient-hero opacity-80" />
      
      {/* Overlay escuro para melhorar contraste */}
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="flex-1 flex flex-col justify-between p-8 md:p-12 lg:p-16">
          {/* Logo COMPASS + Subtitle */}
          <div className="space-y-6">
            <div className="text-white">
              <p className="text-5xl font-black tracking-tight">COMPASS</p>
              <p className="text-xl opacity-90">Bússola de Vendas</p>
            </div>
            <p className="text-2xl font-medium text-[#10b981]">
              Sistema de Implementação
            </p>
          </div>

          {/* Logo VocêPode Signature */}
          <div>
            <p className="text-white/80 font-semibold">VocêPode</p>
          </div>
        </div>

        {/* Right Side - Login Card */}
        <div className="w-full md:w-[480px] lg:w-[520px] flex items-center justify-center p-8">
          <Card className="w-full max-w-md bg-card/50 backdrop-blur-xl border-border/50 shadow-2xl">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-3xl font-bold">Bem-vindo de volta</CardTitle>
              <CardDescription className="text-base">
                Faça login para continuar
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Google OAuth Button */}
              <Button
                variant="outline"
                size="lg"
                className="w-full bg-white hover:bg-gray-50 text-gray-900 border-gray-300"
                asChild
              >
                <a href={getLoginUrl()}>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continuar com Google
                </a>
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted-foreground">ou</span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="sr-only">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Endereço de e-mail"
                      className="pl-10 h-12 bg-background/50 border-border"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="sr-only">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      className="pl-10 pr-10 h-12 bg-background/50 border-border"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={submitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <a
                  href="#"
                  className="text-sm text-primary hover:underline"
                  onClick={(e) => e.preventDefault()}
                >
                  Esqueceu a senha?
                </a>
              </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 bg-gradient-to-r from-[#7c3aed] to-[#10b981] hover:opacity-90 transition-opacity"
                  disabled={submitting}
                >
                  {submitting ? "Entrando..." : "Entrar"}
                </Button>
              </form>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-muted-foreground">
                Não tem conta?{" "}
                <a href="#" className="text-primary hover:underline font-medium" onClick={(e) => e.preventDefault()}>
                  Criar conta
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>
    </div>
  );
}
