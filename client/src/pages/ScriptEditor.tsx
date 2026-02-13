"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const STRATEGIES = [
  { value: "vendas", label: "Vendas" },
  { value: "atracao", label: "Atração" },
  { value: "autoridade", label: "Autoridade" },
  { value: "branding", label: "Branding" },
];

const FUNNEL_GOALS = [
  { value: "seguidores", label: "Ganhar Seguidores" },
  { value: "branding", label: "Fortalecer Marca" },
  { value: "leads", label: "Gerar Leads" },
  { value: "venda", label: "Realizar Venda" },
  { value: "autoridade", label: "Construir Autoridade" },
  { value: "quebrar_objecao", label: "Quebrar Objeção" },
  { value: "inspirar", label: "Inspirar" },
  { value: "gerar_leads", label: "Capturar Contatos" },
  { value: "prova_social", label: "Prova Social" },
];

const PROGRESS_STATUS = [
  { value: "ideia", label: "💡 Ideia" },
  { value: "a_fazer", label: "📋 A Fazer" },
  { value: "planejando_roteiro", label: "✍️ Planejando Roteiro" },
  { value: "gravacao", label: "🎬 Gravação" },
  { value: "design", label: "🎨 Design" },
  { value: "aprovacao", label: "✅ Aprovação" },
  { value: "programado", label: "📅 Programado" },
  { value: "publicado", label: "🚀 Publicado" },
];

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "linkedin", label: "LinkedIn" },
];

export default function ScriptEditor({ ideaId }: { ideaId: string }) {
  const router = useRouter();
  const parsedIdeaId = ideaId ? parseInt(ideaId) : null;

  const [strategy, setStrategy] = useState<string>("");
  const [funnelGoal, setFunnelGoal] = useState<string>("");
  const [progressStatus, setProgressStatus] = useState<string>("ideia");
  const [deadlinePlanning, setDeadlinePlanning] = useState<string>("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  
  // Script fields dinâmicos
  const [scriptFields, setScriptFields] = useState<Record<string, any>>({});

  const { data: idea, isLoading: loadingIdea } = trpc.contentIdeas.getById.useQuery(
    { id: parsedIdeaId! },
    { enabled: !!parsedIdeaId }
  );

  const { data: existingScript, isLoading: loadingScript } = trpc.contentScripts.getByIdeaId.useQuery(
    { contentIdeaId: parsedIdeaId! },
    { enabled: !!parsedIdeaId }
  );

  const utils = trpc.useUtils();

  const createScript = trpc.contentScripts.create.useMutation({
    onSuccess: () => {
      toast.success("Roteiro criado!", {
        description: "Seu roteiro foi salvo com sucesso.",
      });
      utils.contentScripts.getByIdeaId.invalidate({ contentIdeaId: parsedIdeaId! });
    },
    onError: (error) => {
      toast.error("Erro ao criar roteiro", {
        description: error.message,
      });
    },
  });

  const updateScript = trpc.contentScripts.update.useMutation({
    onSuccess: () => {
      toast.success("Roteiro atualizado!", {
        description: "Suas alterações foram salvas.",
      });
      utils.contentScripts.getByIdeaId.invalidate({ contentIdeaId: parsedIdeaId! });
    },
    onError: (error) => {
      toast.error("Erro ao atualizar roteiro", {
        description: error.message,
      });
    },
  });

  // Carregar dados do script existente
  useEffect(() => {
    if (existingScript) {
      setStrategy(existingScript.strategy || "");
      setFunnelGoal(existingScript.funnelGoal || "");
      setProgressStatus(existingScript.progressStatus || "ideia");
      setDeadlinePlanning(existingScript.deadlinePlanning ? new Date(existingScript.deadlinePlanning).toISOString().split('T')[0] : "");
      setPlatforms(existingScript.platforms || []);
      setScriptFields(existingScript.scriptFields || {});
    }
  }, [existingScript]);

  const handleSave = () => {
    if (!parsedIdeaId) return;

    const data = {
      contentIdeaId: parsedIdeaId,
      strategy: strategy as any,
      funnelGoal: funnelGoal as any,
      progressStatus: progressStatus as any,
      deadlinePlanning: deadlinePlanning || undefined,
      platforms: platforms.length > 0 ? platforms : undefined,
      scriptFields,
    };

    if (existingScript) {
      updateScript.mutate({ id: existingScript.id, ...data });
    } else {
      createScript.mutate(data);
    }
  };

  const updateScriptField = (field: string, value: any) => {
    setScriptFields(prev => ({ ...prev, [field]: value }));
  };

  const togglePlatform = (platform: string) => {
    setPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  if (!parsedIdeaId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <p className="text-white">ID da ideia não fornecido</p>
      </div>
    );
  }

  if (loadingIdea || loadingScript) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent"></div>
          <p className="mt-4 text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <p className="text-white">Ideia não encontrada</p>
      </div>
    );
  }

  // Determinar campos do roteiro baseado no formato
  const renderScriptFields = () => {
    const format = idea.format;

    if (format === "video" || format === "video_curto") {
      return (
        <div className="space-y-4">
          <div>
            <Label className="text-white">Gancho</Label>
            <Textarea
              value={scriptFields.gancho || ""}
              onChange={(e) => updateScriptField("gancho", e.target.value)}
              placeholder="Como você vai prender a atenção nos primeiros 3 segundos?"
              className="bg-slate-800 border-slate-700 text-white min-h-[80px]"
            />
          </div>
          <div>
            <Label className="text-white">Conteúdo Principal</Label>
            <Textarea
              value={scriptFields.conteudo || ""}
              onChange={(e) => updateScriptField("conteudo", e.target.value)}
              placeholder="Desenvolva o conteúdo principal do vídeo"
              className="bg-slate-800 border-slate-700 text-white min-h-[120px]"
            />
          </div>
          <div>
            <Label className="text-white">Fechamento / CTA</Label>
            <Textarea
              value={scriptFields.fechamento || ""}
              onChange={(e) => updateScriptField("fechamento", e.target.value)}
              placeholder="Como você vai fechar e qual ação quer que tomem?"
              className="bg-slate-800 border-slate-700 text-white min-h-[80px]"
            />
          </div>
          <div>
            <Label className="text-white">Legenda</Label>
            <Textarea
              value={scriptFields.legenda || ""}
              onChange={(e) => updateScriptField("legenda", e.target.value)}
              placeholder="Legenda para o post"
              className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
            />
          </div>
        </div>
      );
    }

    if (format === "carrossel") {
      return (
        <div className="space-y-4">
          <div>
            <Label className="text-white">Card 1 - Capa</Label>
            <Input
              value={scriptFields.card1_capa || ""}
              onChange={(e) => updateScriptField("card1_capa", e.target.value)}
              placeholder="Título impactante"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div>
            <Label className="text-white">Card 2 - Contracapa</Label>
            <Input
              value={scriptFields.card2_contracapa || ""}
              onChange={(e) => updateScriptField("card2_contracapa", e.target.value)}
              placeholder="Subtítulo ou promessa"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div>
            <Label className="text-white">Card 3 - Gancho</Label>
            <Textarea
              value={scriptFields.card3_gancho || ""}
              onChange={(e) => updateScriptField("card3_gancho", e.target.value)}
              placeholder="Contexto ou problema"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          {[4, 5, 6, 7, 8].map(num => (
            <div key={num}>
              <Label className="text-white">Card {num}</Label>
              <Textarea
                value={scriptFields[`card${num}`] || ""}
                onChange={(e) => updateScriptField(`card${num}`, e.target.value)}
                placeholder={`Conteúdo do card ${num}`}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          ))}
          <div>
            <Label className="text-white">Card 9 - Transição</Label>
            <Textarea
              value={scriptFields.card9_transicao || ""}
              onChange={(e) => updateScriptField("card9_transicao", e.target.value)}
              placeholder="Transição para o fechamento"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div>
            <Label className="text-white">Card 10 - Fechamento</Label>
            <Textarea
              value={scriptFields.card10_fechamento || ""}
              onChange={(e) => updateScriptField("card10_fechamento", e.target.value)}
              placeholder="CTA e fechamento"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </div>
      );
    }

    if (format === "imagem" || format === "estatico") {
      return (
        <div className="space-y-4">
          <div>
            <Label className="text-white">Texto Principal</Label>
            <Textarea
              value={scriptFields.imagemDesign || ""}
              onChange={(e) => updateScriptField("imagemDesign", e.target.value)}
              placeholder="Texto que vai aparecer na imagem"
              className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
            />
          </div>
          <div>
            <Label className="text-white">Legenda</Label>
            <Textarea
              value={scriptFields.legenda || ""}
              onChange={(e) => updateScriptField("legenda", e.target.value)}
              placeholder="Legenda para o post"
              className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push("/ideias")}
            className="mb-4 border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Ideias
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                ✍️ Editor de Roteiro
              </h1>
              <p className="text-slate-400 mb-2">{idea.title}</p>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  idea.funnel === "c1" ? "bg-cyan-500/20 text-cyan-400" :
                  idea.funnel === "c2" ? "bg-blue-500/20 text-blue-400" :
                  "bg-purple-500/20 text-purple-400"
                }`}>
                  {idea.funnel.toUpperCase()}
                </span>
                <span className="text-slate-500 text-sm">
                  {idea.format.replace("_", " ")}
                </span>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={createScript.isPending || updateScript.isPending}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              <Save className="mr-2 h-5 w-5" />
              {createScript.isPending || updateScript.isPending ? "Salvando..." : "Salvar Roteiro"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal - Roteiro */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                  Roteiro do Conteúdo
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Preencha os campos do roteiro baseado no formato {idea.format}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderScriptFields()}
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral - Metadados */}
          <div className="space-y-6">
            {/* Estratégia e Meta */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Estratégia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Estratégia</Label>
                  <Select value={strategy} onValueChange={setStrategy}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {STRATEGIES.map((s) => (
                        <SelectItem key={s.value} value={s.value} className="text-white">
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Meta do Funil</Label>
                  <Select value={funnelGoal} onValueChange={setFunnelGoal}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {FUNNEL_GOALS.map((g) => (
                        <SelectItem key={g.value} value={g.value} className="text-white">
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Status e Deadline */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Progresso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Status</Label>
                  <Select value={progressStatus} onValueChange={setProgressStatus}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {PROGRESS_STATUS.map((s) => (
                        <SelectItem key={s.value} value={s.value} className="text-white">
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Deadline</Label>
                  <Input
                    type="date"
                    value={deadlinePlanning}
                    onChange={(e) => setDeadlinePlanning(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Plataformas */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Plataformas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {PLATFORMS.map((platform) => (
                    <label
                      key={platform.value}
                      className="flex items-center gap-2 cursor-pointer text-white hover:text-cyan-400"
                    >
                      <input
                        type="checkbox"
                        checked={platforms.includes(platform.value)}
                        onChange={() => togglePlatform(platform.value)}
                        className="rounded border-slate-700"
                      />
                      {platform.label}
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
