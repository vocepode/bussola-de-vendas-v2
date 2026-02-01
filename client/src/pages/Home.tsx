import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Compass, Award, BookOpen, TrendingUp, Loader2, ArrowRight, Lightbulb, FileText, KanbanSquare } from "lucide-react";
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        {/* Hero Section */}
        <div className="container py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Logo/Branding */}
            <div className="inline-flex items-center justify-center mb-4">
              <img src="/logo-compass.png" alt="Método COMPASS" className="w-24 h-24" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Bússola de Vendas
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Transforme conhecimento em prática, planejamento em ação e inteligência em vendas com o <strong>Método COMPASS</strong>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <a href={getLoginUrl()}>
                  Começar Agora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 max-w-6xl mx-auto">
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg gradient-norte flex items-center justify-center text-white mb-4">
                  <Compass className="w-6 h-6" />
                </div>
                <CardTitle>NORTE</CardTitle>
                <CardDescription>Defina sua estratégia de vendas</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-cyan-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg gradient-raio-x flex items-center justify-center text-white mb-4">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <CardTitle>RAIO-X</CardTitle>
                <CardDescription>Análise profunda do negócio</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg gradient-mapa flex items-center justify-center text-white mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <CardTitle>MAPA</CardTitle>
                <CardDescription>Planejamento de conteúdo</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-orange-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg gradient-rota flex items-center justify-center text-white mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <CardTitle>ROTA</CardTitle>
                <CardDescription>Performance e métricas</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard do aluno autenticado
  const progressMap = new Map(moduleProgress?.map(p => [p.moduleId, p]) || []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo-compass.png" alt="Método COMPASS" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold">Bússola de Vendas</h1>
                <p className="text-sm text-muted-foreground">Método COMPASS</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 space-y-8">
        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Seu Progresso</CardTitle>
            <CardDescription>Acompanhe sua jornada no Método COMPASS</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progresso Geral</span>
                <span className="text-2xl font-bold text-primary">{dashboard?.overallProgress || 0}%</span>
              </div>
              <Progress value={dashboard?.overallProgress || 0} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{dashboard?.submissionsCount || 0}</p>
                <p className="text-sm text-muted-foreground">Exercícios</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{dashboard?.badgesCount || 0}</p>
                <p className="text-sm text-muted-foreground">Badges</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{moduleProgress?.filter(p => p.status === "completed").length || 0}</p>
                <p className="text-sm text-muted-foreground">Módulos</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{modules?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ferramentas de Conteúdo */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Ferramentas de Conteúdo</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Link href="/ideias">
              <Card className="h-full transition-all hover:shadow-lg cursor-pointer border-2 hover:border-cyan-400">
                <CardHeader>
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white mb-4">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl">💡 Ideias de Conteúdo</CardTitle>
                  <CardDescription className="mt-2">
                    Organize suas ideias e transforme-as em roteiros prontos para produção
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/matriz">
              <Card className="h-full transition-all hover:shadow-lg cursor-pointer border-2 hover:border-purple-400">
                <CardHeader>
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white mb-4">
                    <KanbanSquare className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl">📋 Matriz de Conteúdo</CardTitle>
                  <CardDescription className="mt-2">
                    Visualize e gerencie todo o pipeline de produção em Kanban
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Card className="h-full transition-all opacity-60">
              <CardHeader>
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl">📅 Calendário</CardTitle>
                <CardDescription className="mt-2">
                  Em breve: Visualização mensal e programação de publicações
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Modules Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Módulos do COMPASS</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules?.map((module) => {
              const progress = progressMap.get(module.id);
              const isLocked = progress?.status === "locked";
              const isCompleted = progress?.status === "completed";
              
              return (
                <Link key={module.id} href={`/modulo/${module.slug}`}>
                  <Card className={`h-full transition-all hover:shadow-lg ${isLocked ? "opacity-60" : "cursor-pointer"}`}>
                    <CardHeader>
                      <div className={`w-16 h-16 rounded-xl gradient-${module.slug.replace(/-/g, '-')} flex items-center justify-center text-white mb-4`}>
                        <Compass className="w-8 h-8" />
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl">{module.title}</CardTitle>
                          <CardDescription className="mt-2">{module.description}</CardDescription>
                        </div>
                        {isCompleted && (
                          <Badge variant="default" className="ml-2">
                            <Award className="w-3 h-3 mr-1" />
                            Completo
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-semibold">{progress?.progressPercentage || 0}%</span>
                        </div>
                        <Progress value={progress?.progressPercentage || 0} className="h-2" />
                      </div>
                      
                      {isLocked && (
                        <p className="text-xs text-muted-foreground mt-4">
                          🔒 Complete o módulo anterior para desbloquear
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
