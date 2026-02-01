import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Compass, Award, BookOpen, TrendingUp, Loader2, Medal, Info } from "lucide-react";
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
              <img src="/logos/vcp-horizontal.png" alt="VocêPode" className="h-8 w-auto" />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
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
          <div className="grid md:grid-cols-2 gap-6">
            {/* Comece Aqui */}
            <Card className="transition-all hover:shadow-lg hover:border-cyan-400 cursor-pointer overflow-hidden">
              <img src="/card_comece_aqui.png" alt="Comece Aqui" className="w-full h-48 object-cover" />
            </Card>

            {/* O Método COMPASS */}
            <Card className="transition-all hover:shadow-lg hover:border-purple-400 cursor-pointer overflow-hidden">
              <img src="/card_metodo_compass.png" alt="O Método COMPASS" className="w-full h-48 object-cover" />
            </Card>


          </div>

          {/* Callout */}
          <div className="mt-6 p-4 border-l-4 border-cyan-400 bg-card rounded-r-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                Comece sua jornada pelo <strong className="text-cyan-400">NORTE</strong>, onde você definirá seu posicionamento estratégico e completará o <strong>Marco Zero</strong>
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
                <img src="/modulo_norte.png" alt="NORTE" className="absolute inset-0 w-full h-full object-cover" />
              </Card>
            </Link>

            {/* RAIO-X */}
            <Link href="/modulo/raio-x">
              <Card className="h-[280px] relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] group">
                <img src="/modulo_raiox.png" alt="RAIO-X" className="absolute inset-0 w-full h-full object-cover" />
              </Card>
            </Link>

            {/* MAPA */}
            <Link href="/modulo/mapa">
              <Card className="h-[280px] relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] group">
                <img src="/modulo_mapa.png" alt="MAPA" className="absolute inset-0 w-full h-full object-cover" />
              </Card>
            </Link>

            {/* ROTA */}
            <Link href="/modulo/rota">
              <Card className="h-[280px] relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] group">
                <img src="/modulo_rota.png" alt="ROTA" className="absolute inset-0 w-full h-full object-cover" />
              </Card>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
