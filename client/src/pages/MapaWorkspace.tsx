"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ChevronDown, ChevronRight, Eye, FileDown } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { MAPA_ESTRUTURA_STEPS, type MapaEstruturaStepKey } from "@/constants/mapa";
import { EditoriaisSection } from "@/components/mapa/EditoriaisSection";
import { TemasSection } from "@/components/mapa/TemasSection";
import { TemasPorEditoriaSection } from "@/components/mapa/TemasPorEditoriaSection";
import { IdeiasConteudoSection } from "@/components/mapa/IdeiasConteudoSection";

const ESTRUTURA_LABELS: Record<MapaEstruturaStepKey, string> = {
  editoriais: "Editoriais",
  temas: "Temas",
  temas_por_editoria: "Temas por editoria",
  ideias: "Ideias de Conteúdo",
};

export default function MapWorkspace() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [estruturaOpen, setEstruturaOpen] = useState(true);
  const [matrizOpen, setMatrizOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<MapaEstruturaStepKey>("editoriais");
  const [matrizActive, setMatrizActive] = useState(false);

  const handleEstruturaStep = (step: MapaEstruturaStepKey) => {
    setActiveStep(step);
    setMatrizActive(false);
  };

  const handleMatrizPlaceholder = () => {
    setMatrizActive(true);
  };

  return (
    <DashboardLayout>
      <div className="pillar-inner mapa-inner min-h-screen bg-background">
        <header
          className={cn(
            "border-b sticky top-0 z-10 shadow-sm",
            isDark ? "border-[#262626] bg-[#111111]" : "bg-white"
          )}
        >
          <div className="container py-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className={cn(isDark ? "text-white/90 hover:bg-white/10" : "")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex-1 min-w-0">
                <div className={cn("text-sm", isDark ? "text-white/60" : "text-muted-foreground")}>Estratégia</div>
                <h1 className={cn("text-xl font-bold truncate", isDark ? "text-white" : "")}>MAPA</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("gap-2", isDark ? "border-white/20 text-white/90 hover:bg-white/10" : "")}
                  asChild
                >
                  <Link href="/mapa/preview" target="_blank">
                    <Eye className="w-4 h-4" />
                    Pré-visualizar
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("gap-2", isDark ? "border-white/20 text-white/90 hover:bg-white/10" : "")}
                  onClick={() => window.open("/mapa/preview", "_blank")}
                >
                  <FileDown className="w-4 h-4" />
                  Imprimir / Salvar PDF
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar */}
            <aside className="lg:sticky lg:top-[84px] lg:h-[calc(100vh-120px)]">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">MAPA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-0.5">
                  {/* Estrutura de Conteúdo */}
                  <div>
                    <button
                      type="button"
                      className="w-full text-left py-2 rounded-md transition-colors flex items-center gap-2 px-2 font-medium text-sm hover:bg-muted"
                      onClick={() => setEstruturaOpen(!estruturaOpen)}
                    >
                      {estruturaOpen ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                      Estrutura de Conteúdo
                    </button>
                    {estruturaOpen && (
                      <div className="pl-4 border-l border-muted ml-2 space-y-0.5">
                        {MAPA_ESTRUTURA_STEPS.map((key) => (
                          <button
                            key={key}
                            type="button"
                            className={cn(
                              "w-full text-left py-2 rounded-md transition-colors flex items-center gap-2 px-2 text-sm",
                              !matrizActive && activeStep === key ? "bg-primary/10 text-primary" : "hover:bg-muted"
                            )}
                            onClick={() => handleEstruturaStep(key)}
                          >
                            {ESTRUTURA_LABELS[key]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Matriz de Conteúdo */}
                  <div>
                    <button
                      type="button"
                      className="w-full text-left py-2 rounded-md transition-colors flex items-center gap-2 px-2 font-medium text-sm hover:bg-muted"
                      onClick={() => setMatrizOpen(!matrizOpen)}
                    >
                      {matrizOpen ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                      Matriz de Conteúdo
                    </button>
                    {matrizOpen && (
                      <div className="pl-4 border-l border-muted ml-2 space-y-0.5">
                        <button
                          type="button"
                          className={cn(
                            "w-full text-left py-2 rounded-md transition-colors flex items-center gap-2 px-2 text-sm text-muted-foreground",
                            matrizActive ? "bg-muted" : "hover:bg-muted"
                          )}
                          onClick={handleMatrizPlaceholder}
                        >
                          Em breve
                        </button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Conteúdo */}
            <section className="space-y-4">
              {matrizActive ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <p className="font-medium">Matriz de Conteúdo</p>
                    <p className="text-sm mt-1">Planejamento, C1, C2, C3 e Calendário em breve.</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>{ESTRUTURA_LABELS[activeStep]}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activeStep === "editoriais" && <EditoriaisSection />}
                    {activeStep === "temas" && <TemasSection />}
                    {activeStep === "temas_por_editoria" && <TemasPorEditoriaSection />}
                    {activeStep === "ideias" && <IdeiasConteudoSection />}
                  </CardContent>
                </Card>
              )}
            </section>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
