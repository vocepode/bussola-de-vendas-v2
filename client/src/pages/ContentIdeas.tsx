"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Lightbulb, Filter } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const TOPICS = [
  { value: "dicas", label: "Dicas" },
  { value: "principais_desejos", label: "Principais Desejos" },
  { value: "perguntas_comuns", label: "Perguntas Comuns" },
  { value: "mitos", label: "Mitos" },
  { value: "historias", label: "Histórias" },
  { value: "erros_comuns", label: "Erros Comuns" },
  { value: "feedbacks", label: "Feedbacks" },
  { value: "diferencial_marca", label: "Diferencial da Marca" },
  { value: "nossos_produtos", label: "Nossos Produtos" },
];

const FORMATS_BY_FUNNEL = {
  c1: [
    { value: "imagem", label: "Imagem Estática" },
    { value: "video_curto", label: "Vídeo Curto (Reels/Shorts)" },
  ],
  c2: [
    { value: "carrossel", label: "Carrossel" },
    { value: "video", label: "Vídeo" },
  ],
  c3: [
    { value: "carrossel", label: "Carrossel" },
    { value: "video", label: "Vídeo" },
  ],
};

const FUNNEL_LABELS = {
  c1: "C1 - Topo (Atração)",
  c2: "C2 - Meio (Consideração)",
  c3: "C3 - Fundo (Conversão)",
};

export default function ContentIdeas() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterFunnel, setFilterFunnel] = useState<"c1" | "c2" | "c3" | "all">("all");
  
  // Form state
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [topic, setTopic] = useState("");
  const [funnel, setFunnel] = useState<"c1" | "c2" | "c3">("c1");
  const [format, setFormat] = useState("");

  const utils = trpc.useUtils();
  
  const { data: ideas = [], isLoading } = trpc.contentIdeas.list.useQuery(
    filterFunnel !== "all" ? { funnel: filterFunnel } : undefined
  );

  const createIdea = trpc.contentIdeas.create.useMutation({
    onSuccess: () => {
      toast.success("Ideia criada!", {
        description: "Sua ideia de conteúdo foi salva com sucesso.",
      });
      utils.contentIdeas.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar ideia", {
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setTitle("");
    setTheme("");
    setTopic("");
    setFunnel("c1");
    setFormat("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !topic || !format) {
      toast.error("Campos obrigatórios", {
        description: "Preencha título, tópico e formato.",
      });
      return;
    }

    createIdea.mutate({
      title,
      theme: theme || undefined,
      topic: topic as any,
      funnel,
      format: format as any,
    });
  };

  const availableFormats = FORMATS_BY_FUNNEL[funnel];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                💡 Ideias de Conteúdo
              </h1>
              <p className="text-slate-400">
                Organize suas ideias e transforme-as em roteiros prontos para produção
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                  <Plus className="mr-2 h-5 w-5" />
                  Nova Ideia
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-slate-900 border-slate-800">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-white">Criar Nova Ideia</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Defina os parâmetros da sua ideia de conteúdo
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Título */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white">Título da Ideia *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Como escolher o produto ideal"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  {/* Tema */}
                  <div className="space-y-2">
                    <Label htmlFor="theme" className="text-white">Tema/Editorial (opcional)</Label>
                    <Input
                      id="theme"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      placeholder="Ex: Educação, Vendas, Dicas..."
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  {/* Tópico */}
                  <div className="space-y-2">
                    <Label htmlFor="topic" className="text-white">Tópico *</Label>
                    <Select value={topic} onValueChange={setTopic}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Selecione o tópico" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {TOPICS.map((t) => (
                          <SelectItem key={t.value} value={t.value} className="text-white">
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Funil */}
                  <div className="space-y-2">
                    <Label htmlFor="funnel" className="text-white">Etapa do Funil *</Label>
                    <Select value={funnel} onValueChange={(v) => {
                      setFunnel(v as any);
                      setFormat(""); // Reset format when funnel changes
                    }}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="c1" className="text-white">{FUNNEL_LABELS.c1}</SelectItem>
                        <SelectItem value="c2" className="text-white">{FUNNEL_LABELS.c2}</SelectItem>
                        <SelectItem value="c3" className="text-white">{FUNNEL_LABELS.c3}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Formato */}
                  <div className="space-y-2">
                    <Label htmlFor="format" className="text-white">Formato *</Label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Selecione o formato" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {availableFormats.map((f) => (
                          <SelectItem key={f.value} value={f.value} className="text-white">
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createIdea.isPending}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    >
                      {createIdea.isPending ? "Criando..." : "Criar Ideia"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-slate-400" />
            <div className="flex gap-2">
              <Button
                variant={filterFunnel === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterFunnel("all")}
                className={filterFunnel === "all" ? "bg-cyan-500 hover:bg-cyan-600" : "border-slate-700 text-slate-300"}
              >
                Todas
              </Button>
              <Button
                variant={filterFunnel === "c1" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterFunnel("c1")}
                className={filterFunnel === "c1" ? "bg-cyan-500 hover:bg-cyan-600" : "border-slate-700 text-slate-300"}
              >
                C1 - Topo
              </Button>
              <Button
                variant={filterFunnel === "c2" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterFunnel("c2")}
                className={filterFunnel === "c2" ? "bg-blue-500 hover:bg-blue-600" : "border-slate-700 text-slate-300"}
              >
                C2 - Meio
              </Button>
              <Button
                variant={filterFunnel === "c3" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterFunnel("c3")}
                className={filterFunnel === "c3" ? "bg-purple-500 hover:bg-purple-600" : "border-slate-700 text-slate-300"}
              >
                C3 - Fundo
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de Ideias */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent"></div>
            <p className="mt-4 text-slate-400">Carregando ideias...</p>
          </div>
        ) : ideas.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="py-12 text-center">
              <Lightbulb className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhuma ideia ainda
              </h3>
              <p className="text-slate-400 mb-6">
                Comece criando sua primeira ideia de conteúdo
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                <Plus className="mr-2 h-5 w-5" />
                Criar Primeira Ideia
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea) => (
              <Card
                key={idea.id}
                className="bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg mb-1">
                        {idea.title}
                      </CardTitle>
                      {idea.theme && (
                        <p className="text-sm text-slate-400">
                          📁 {idea.theme}
                        </p>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      idea.funnel === "c1" ? "bg-cyan-500/20 text-cyan-400" :
                      idea.funnel === "c2" ? "bg-blue-500/20 text-blue-400" :
                      "bg-purple-500/20 text-purple-400"
                    }`}>
                      {idea.funnel.toUpperCase()}
                    </div>
                  </div>
                  <CardDescription className="text-slate-400">
                    {TOPICS.find(t => t.value === idea.topic)?.label || idea.topic}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      {String(idea.format ?? "estatico").replace("_", " ")}
                    </span>
                    <Link href={`/roteiro/${idea.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-700 text-cyan-400 hover:bg-cyan-500/10"
                      >
                        Criar Roteiro →
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
