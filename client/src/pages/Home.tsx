import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Compass, Award, BookOpen, TrendingUp, Loader2, Play, CheckCircle, Medal, Info } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  
  const { data: modules, isLoading: modulesLoading } = trpc.modules.list.useQuery();
  const { data: moduleProgress } = trpc.modules.getProgress.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: dashboard } = trpc.dashboard.getOverview.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading || modulesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  const progressMap = new Map(moduleProgress?.map(p => [p.moduleId, p]) || []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logos/vcp-black.png" alt="VocêPode" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold">VocêPodeVenderMais</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <img src="/logos/vcp-black.png" alt="VocêPode" className="h-8 w-auto" />
                <p className="text-xs text-muted-foreground">suporte@vocepodevendermais.com.br</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative h-[300px] overflow-hidden">
        <img 
          src="/banner-hero.png" 
          alt="COMPASS - A bússola para vender mais" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* User Identification */}
      <div className="bg-card border-b">
        <div className="container py-6">
          <p className="text-muted-foreground max-w-3xl">
            A Bússola é sua principal ferramenta durante a jornada para aprender a vender através da metodologia COMPASS. Navegue pelas etapas abaixo para progredir.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container py-12 space-y-12">
        {/* Iniciando sua jornada */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Iniciando sua jornada</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Comece Aqui */}
            <Card className="transition-all hover:shadow-lg hover:border-cyan-400 cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-20 h-20 rounded-full bg-card border-2 border-border flex items-center justify-center mx-auto mb-4">
                  <Play className="w-10 h-10 text-cyan-400" />
                </div>
                <CardTitle className="text-xl">▶️ Comece Aqui</CardTitle>
                <CardDescription className="mt-2">
                  Introdução ao sistema e primeiros passos
                </CardDescription>
              </CardHeader>
            </Card>

            {/* O Método COMPASS */}
            <Card className="transition-all hover:shadow-lg hover:border-purple-400 cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-20 h-20 rounded-full bg-card border-2 border-border flex items-center justify-center mx-auto mb-4 relative">
                  <Compass className="w-10 h-10 text-purple-400" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl">🧭 Conheça o Método COMPASS</CardTitle>
                <CardDescription className="mt-2">
                  Entenda a metodologia completa
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Marco Zero */}
            <Card className="transition-all hover:shadow-lg hover:border-blue-400 cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-20 h-20 rounded-full bg-card border-2 border-border flex items-center justify-center mx-auto mb-4">
                  <Medal className="w-10 h-10 text-blue-400" />
                </div>
                <CardTitle className="text-xl">🎯 Marco Zero</CardTitle>
                <CardDescription className="mt-2">
                  Checklist obrigatório para começar
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Callout */}
          <div className="mt-6 p-4 border-l-4 border-cyan-400 bg-card rounded-r-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                Após <strong>completar o checklist do Marco Zero</strong>, comece a sua jornada pela 
                Bússola de Vendas pelo <strong className="text-cyan-400">NORTE</strong>
              </p>
            </div>
          </div>
        </section>

        {/* A sua bússola para vender mais */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-cyan-400">Seu sistema de implementação dos pilares do método COMPASS</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* NORTE */}
            <Link href="/modulo/norte">
              <Card className="h-[280px] relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-500 to-cyan-500" />
                <CardContent className="relative h-full flex flex-col items-center justify-center text-white p-8">
                  <img src="/logos/compass-white.png" alt="NORTE" className="w-24 h-24 mb-6 opacity-90 group-hover:scale-110 transition-transform" />
                  <h3 className="text-4xl font-bold mb-2">NORTE</h3>
                  <p className="text-lg opacity-90">Estratégia | NORTE</p>
                </CardContent>
              </Card>
            </Link>

            {/* RAIO-X */}
            <Link href="/modulo/raio-x">
              <Card className="h-[280px] relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400" />
                <CardContent className="relative h-full flex flex-col items-center justify-center text-white p-8">
                  <img src="/logos/compass-white.png" alt="RAIO-X" className="w-24 h-24 mb-6 opacity-90 group-hover:scale-110 transition-transform" />
                  <h3 className="text-4xl font-bold mb-2">RAIO-X</h3>
                  <p className="text-lg opacity-90">Estratégia | RAIO-X</p>
                </CardContent>
              </Card>
            </Link>

            {/* MAPA */}
            <Link href="/modulo/mapa">
              <Card className="h-[280px] relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-teal-500 to-cyan-500" />
                <CardContent className="relative h-full flex flex-col items-center justify-center text-white p-8">
                  <img src="/logos/compass-white.png" alt="MAPA" className="w-24 h-24 mb-6 opacity-90 group-hover:scale-110 transition-transform" />
                  <h3 className="text-4xl font-bold mb-2">MAPA</h3>
                  <p className="text-lg opacity-90">Conteúdo | MAPA</p>
                </CardContent>
              </Card>
            </Link>

            {/* ROTA */}
            <Link href="/modulo/rota">
              <Card className="h-[280px] relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600" />
                <CardContent className="relative h-full flex flex-col items-center justify-center text-white p-8">
                  <img src="/logos/compass-white.png" alt="ROTA" className="w-24 h-24 mb-6 opacity-90 group-hover:scale-110 transition-transform" />
                  <h3 className="text-4xl font-bold mb-2">ROTA</h3>
                  <p className="text-lg opacity-90">Performance | ROTA</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
