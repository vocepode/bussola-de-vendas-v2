"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KanbanSquare, Calendar, Target } from "lucide-react";
import Link from "next/link";

const PROGRESS_COLUMNS = [
  { value: "ideia", label: "💡 Ideia", color: "bg-slate-700" },
  { value: "a_fazer", label: "📋 A Fazer", color: "bg-slate-700" },
  { value: "planejando_roteiro", label: "✍️ Planejando", color: "bg-blue-700" },
  { value: "gravacao", label: "🎬 Gravação", color: "bg-purple-700" },
  { value: "design", label: "🎨 Design", color: "bg-pink-700" },
  { value: "aprovacao", label: "✅ Aprovação", color: "bg-orange-700" },
  { value: "programado", label: "📅 Programado", color: "bg-green-700" },
  { value: "publicado", label: "🚀 Publicado", color: "bg-emerald-700" },
];

const FUNNEL_VIEWS = [
  { value: "all", label: "Todas as Etapas", color: "text-white" },
  { value: "c1", label: "C1 - Topo (Atração)", color: "text-cyan-400" },
  { value: "c2", label: "C2 - Meio (Consideração)", color: "text-blue-400" },
  { value: "c3", label: "C3 - Fundo (Conversão)", color: "text-purple-400" },
];

export default function ContentMatrix() {
  const [selectedFunnel, setSelectedFunnel] = useState<string>("all");

  const { data: scriptsWithIdeas, isLoading } = trpc.contentScripts.listWithIdeas.useQuery({
    funnel: selectedFunnel === "all" ? undefined : (selectedFunnel as any),
  });

  const groupedByStatus = PROGRESS_COLUMNS.reduce((acc, column) => {
    acc[column.value] = scriptsWithIdeas?.filter(
      item => item.script.progressStatus === column.value
    ) || [];
    return acc;
  }, {} as Record<string, typeof scriptsWithIdeas>);

  const getFunnelColor = (funnel: string) => {
    if (funnel === "c1") return "bg-cyan-500/20 text-cyan-400 border-cyan-500/50";
    if (funnel === "c2") return "bg-blue-500/20 text-blue-400 border-blue-500/50";
    return "bg-purple-500/20 text-purple-400 border-purple-500/50";
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <KanbanSquare className="h-10 w-10 text-cyan-400" />
                Matriz de Conteúdo
              </h1>
              <p className="text-slate-400">
                Visualize e gerencie todo o pipeline de produção de conteúdo
              </p>
            </div>

            <Link href="/ideias">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                + Nova Ideia
              </Button>
            </Link>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">Visualizar:</span>
              <Select value={selectedFunnel} onValueChange={setSelectedFunnel}>
                <SelectTrigger className="w-[240px] bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {FUNNEL_VIEWS.map((view) => (
                    <SelectItem
                      key={view.value}
                      value={view.value}
                      className={`${view.color} hover:bg-slate-700`}
                    >
                      {view.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 flex items-center justify-end gap-2 text-sm text-slate-400">
              <span>Total: {scriptsWithIdeas?.length || 0} conteúdos</span>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent"></div>
              <p className="mt-4 text-slate-400">Carregando matriz...</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {PROGRESS_COLUMNS.map((column) => {
              const items = groupedByStatus[column.value] || [];
              return (
                <div
                  key={column.value}
                  className="flex-shrink-0 w-[320px] bg-slate-900/50 rounded-lg border border-slate-800"
                >
                  {/* Column Header */}
                  <div className={`${column.color} px-4 py-3 rounded-t-lg`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white">{column.label}</h3>
                      <Badge variant="secondary" className="bg-slate-800 text-white">
                        {items.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Column Content */}
                  <div className="p-3 space-y-3 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto">
                    {items.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-8">
                        Nenhum conteúdo
                      </p>
                    ) : (
                      items.map((item) => (
                        <Link
                          key={item.script.id}
                          href={`/roteiro/${item.idea.id}`}
                        >
                          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all cursor-pointer">
                            <CardHeader className="p-4 pb-2">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <Badge
                                  variant="outline"
                                  className={`${getFunnelColor(item.idea.funnel)} text-xs`}
                                >
                                  {item.idea.funnel.toUpperCase()}
                                </Badge>
                                {item.script.deadlinePlanning && (
                                  <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(item.script.deadlinePlanning)}
                                  </div>
                                )}
                              </div>
                              <CardTitle className="text-sm text-white line-clamp-2">
                                {item.idea.title}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <div className="space-y-2">
                                {item.idea.theme && (
                                  <p className="text-xs text-slate-400">
                                    {item.idea.theme}
                                  </p>
                                )}
                                
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-slate-500">
                                    {String(item.idea.format ?? "estatico").replace("_", " ")}
                                  </span>
                                </div>

                                {item.script.strategy && (
                                  <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <Target className="h-3 w-3" />
                                    {item.script.strategy}
                                  </div>
                                )}

                                {item.script.platforms && item.script.platforms.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {item.script.platforms.map((platform) => (
                                      <Badge
                                        key={platform}
                                        variant="secondary"
                                        className="text-xs bg-slate-700 text-slate-300"
                                      >
                                        {platform}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && scriptsWithIdeas?.length === 0 && (
          <div className="text-center py-20">
            <KanbanSquare className="h-16 w-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum conteúdo na matriz
            </h3>
            <p className="text-slate-400 mb-6">
              Comece criando ideias e transformando-as em roteiros
            </p>
            <Link href="/ideias">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                Criar Primeira Ideia
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
