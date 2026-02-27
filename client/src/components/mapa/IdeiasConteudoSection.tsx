"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CONTEUDO_TOPICOS, CONTEUDO_FUNIL } from "@/constants/mapa";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { LayoutGrid, LayoutList, Loader2, Pencil, Plus } from "lucide-react";
import Link from "next/link";

type TopicValue = (typeof CONTEUDO_TOPICOS)[number]["value"];
type FunnelValue = (typeof CONTEUDO_FUNIL)[number]["value"];

export function IdeiasConteudoSection() {
  const utils = trpc.useUtils();
  const { data: temas } = trpc.mapa.temas.list.useQuery(undefined, { refetchOnMount: "always" });
  const { data: ideias, isLoading } = trpc.contentIdeas.list.useQuery(undefined, { refetchOnMount: "always" });
  const createMutation = trpc.contentIdeas.create.useMutation({
    onSuccess: () => {
      utils.contentIdeas.list.invalidate();
      toast.success("Ideia de conteúdo salva.");
    },
    onError: (err) => {
      toast.error(err.message || "Não foi possível salvar a ideia. Tente novamente.");
    },
  });
  const updateMutation = trpc.contentIdeas.update.useMutation({
    onSuccess: () => {
      utils.contentIdeas.list.invalidate();
      toast.success("Ideia atualizada.");
    },
    onError: (err) => {
      toast.error(err.message || "Não foi possível atualizar. Tente novamente.");
    },
  });

  const [viewMode, setViewMode] = useState<"lista" | "cards">("cards");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newThemeId, setNewThemeId] = useState<string>("");
  const [newTopic, setNewTopic] = useState<string>("");
  const [newFunnel, setNewFunnel] = useState<string>("");

  const handleCreate = () => {
    if (!newTitle.trim() || !newTopic || !newFunnel) return;
    const themeId = newThemeId ? parseInt(newThemeId, 10) : undefined;
    createMutation.mutate(
      {
        title: newTitle.trim(),
        themeId: themeId ?? undefined,
        topic: newTopic as TopicValue,
        funnel: newFunnel as FunnelValue,
      },
      {
        onSuccess: () => {
          setNewTitle("");
          setNewThemeId("");
          setNewTopic("");
          setNewFunnel("");
          setShowNewForm(false);
        },
      }
    );
  };

  const listaTemas = temas ?? [];
  const listaIdeias = ideias ?? [];
  const gruposPorTema = (() => {
    const semTema: { themeId: number | null; themeName: string; ideias: typeof listaIdeias } = { themeId: null, themeName: "Sem tema", ideias: [] };
    const porTema = new Map<number, { themeId: number; themeName: string; ideias: typeof listaIdeias }>();
    for (const t of listaTemas) {
      porTema.set(t.id, { themeId: t.id, themeName: t.name, ideias: [] });
    }
    for (const idea of listaIdeias) {
      if (idea.themeId != null) {
        const g = porTema.get(idea.themeId);
        if (g) g.ideias.push(idea);
        else porTema.set(idea.themeId, { themeId: idea.themeId, themeName: listaTemas.find((x) => x.id === idea.themeId)?.name ?? "Tema", ideias: [idea] });
      } else {
        semTema.ideias.push(idea);
      }
    }
    const ordenados = listaTemas
      .filter((t) => (porTema.get(t.id)?.ideias.length ?? 0) > 0)
      .map((t) => porTema.get(t.id)!);
    if (semTema.ideias.length > 0) return [...ordenados, semTema];
    return ordenados;
  })();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Ideias de Conteúdo</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Associe cada ideia a um tema, tópico e estágio do funil (C1/C2/C3). Visualize em lista ou em cards por tema.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex rounded-md border border-input bg-background p-0.5">
          <Button
            variant={viewMode === "lista" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 gap-1.5 px-3"
            onClick={() => setViewMode("lista")}
          >
            <LayoutList className="h-4 w-4" />
            Lista
          </Button>
          <Button
            variant={viewMode === "cards" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 gap-1.5 px-3"
            onClick={() => setViewMode("cards")}
          >
            <LayoutGrid className="h-4 w-4" />
            Cards
          </Button>
        </div>
        <Button
          size="sm"
          className="gap-2"
          onClick={() => setShowNewForm(true)}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Nova ideia
        </Button>
      </div>

      {showNewForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="grid gap-2">
              <Label>Tema</Label>
              <Select value={newThemeId} onValueChange={setNewThemeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tema" />
                </SelectTrigger>
                <SelectContent>
                  {(temas ?? []).map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Tópico</Label>
              <Select value={newTopic} onValueChange={setNewTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tópico" />
                </SelectTrigger>
                <SelectContent>
                  {CONTEUDO_TOPICOS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Ideia / Título</Label>
              <Input
                placeholder="Título da ideia de conteúdo"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Funil</Label>
              <Select value={newFunnel} onValueChange={setNewFunnel}>
                <SelectTrigger>
                  <SelectValue placeholder="C1 / C2 / C3" />
                </SelectTrigger>
                <SelectContent>
                  {CONTEUDO_FUNIL.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={!newTitle.trim() || !newTopic || !newFunnel || createMutation.isPending}
                className="gap-2"
              >
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {createMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowNewForm(false);
                  setNewTitle("");
                  setNewThemeId("");
                  setNewTopic("");
                  setNewFunnel("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === "lista" && (
        <>
          {editingId != null && (() => {
            const idea = listaIdeias.find((i) => i.id === editingId);
            return idea ? (
              <Card>
                <CardContent className="pt-4">
                  <IdeiaEditForm
                    idea={idea}
                    temas={listaTemas}
                    onSave={(data) => {
                      updateMutation.mutate({ id: idea.id, ...data }, { onSuccess: () => setEditingId(null) });
                    }}
                    onCancel={() => setEditingId(null)}
                    isSaving={updateMutation.isPending}
                  />
                </CardContent>
              </Card>
            ) : null;
          })()}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tema</TableHead>
                  <TableHead>Ideia</TableHead>
                  <TableHead>Tópico</TableHead>
                  <TableHead>Funil</TableHead>
                  <TableHead className="w-[140px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listaIdeias.map((idea) => (
                  <TableRow key={idea.id}>
                    <TableCell className="text-muted-foreground text-sm">
                      {listaTemas.find((t) => t.id === idea.themeId)?.name ?? idea.theme ?? "—"}
                    </TableCell>
                    <TableCell className="font-medium">{idea.title}</TableCell>
                    <TableCell className="text-sm">
                      {CONTEUDO_TOPICOS.find((t) => t.value === idea.topic)?.label ?? idea.topic}
                    </TableCell>
                    <TableCell className="text-sm">
                      {CONTEUDO_FUNIL.find((f) => f.value === idea.funnel)?.label ?? idea.funnel}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="h-8 gap-1" onClick={() => setEditingId(idea.id)}>
                        <Pencil className="h-3 w-3" />
                        Editar
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 gap-1" asChild>
                        <Link href={`/roteiro/${idea.id}`}>Roteiro →</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {viewMode === "cards" && gruposPorTema.map((grupo) => (
        <div key={grupo.themeId ?? "sem-tema"} className="space-y-3">
          <h3 className="text-base font-semibold text-foreground border-b pb-1.5">
            {grupo.themeName}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {grupo.ideias.map((idea) => (
              <Card key={idea.id} className="overflow-hidden">
                <CardContent className="p-4">
                  {editingId === idea.id ? (
                    <IdeiaEditForm
                      idea={idea}
                      temas={listaTemas}
                      onSave={(data) => {
                        updateMutation.mutate({ id: idea.id, ...data }, { onSuccess: () => setEditingId(null) });
                      }}
                      onCancel={() => setEditingId(null)}
                      isSaving={updateMutation.isPending}
                    />
                  ) : (
                    <>
                      <p className="font-medium text-sm leading-snug line-clamp-3">{idea.title}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <Badge variant="secondary" className="text-xs font-normal">
                          {CONTEUDO_TOPICOS.find((t) => t.value === idea.topic)?.label ?? idea.topic}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-normal",
                            idea.funnel === "c1" && "border-amber-500/50 text-amber-700 dark:text-amber-400",
                            idea.funnel === "c2" && "border-blue-500/50 text-blue-700 dark:text-blue-400",
                            idea.funnel === "c3" && "border-emerald-500/50 text-emerald-700 dark:text-emerald-400"
                          )}
                        >
                          {CONTEUDO_FUNIL.find((f) => f.value === idea.funnel)?.label ?? idea.funnel}
                        </Badge>
                      </div>
                      <div className="flex justify-end mt-3 pt-2 border-t border-border/50">
                        <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs" onClick={() => setEditingId(idea.id)}>
                          <Pencil className="h-3 w-3" />
                          Editar
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs" asChild>
                          <Link href={`/roteiro/${idea.id}`}>Criar Roteiro →</Link>
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {listaIdeias.length === 0 && !showNewForm && (
        <p className="text-sm text-muted-foreground">Nenhuma ideia ainda. Crie temas primeiro e depois adicione ideias.</p>
      )}
    </div>
  );
}

function IdeiaEditForm({
  idea,
  temas,
  onSave,
  onCancel,
  isSaving,
}: {
  idea: { id: number; title: string; themeId: number | null; topic: string; funnel: string };
  temas: { id: number; name: string }[];
  onSave: (data: { title?: string; themeId?: number | null; topic?: TopicValue; funnel?: FunnelValue }) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [title, setTitle] = useState(idea.title);
  const [themeId, setThemeId] = useState(idea.themeId != null ? String(idea.themeId) : "");
  const [topic, setTopic] = useState(idea.topic);
  const [funnel, setFunnel] = useState(idea.funnel);

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        <Label>Tema</Label>
        <Select value={themeId} onValueChange={setThemeId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tema" />
          </SelectTrigger>
          <SelectContent>
            {temas.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Tópico</Label>
        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONTEUDO_TOPICOS.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Ideia / Título</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label>Funil</Label>
        <Select value={funnel} onValueChange={setFunnel}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONTEUDO_FUNIL.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() =>
            onSave({
              title,
              themeId: themeId ? parseInt(themeId, 10) : null,
              topic: topic as TopicValue,
              funnel: funnel as FunnelValue,
            })
          }
          disabled={!title.trim() || isSaving}
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
