"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { CONTEUDO_TOPICOS, CONTEUDO_FUNIL } from "@/constants/mapa";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus } from "lucide-react";

type TopicValue = (typeof CONTEUDO_TOPICOS)[number]["value"];
type FunnelValue = (typeof CONTEUDO_FUNIL)[number]["value"];

export function IdeiasConteudoSection() {
  const utils = trpc.useUtils();
  const { data: temas } = trpc.mapa.temas.list.useQuery();
  const { data: ideias, isLoading } = trpc.contentIdeas.list.useQuery();
  const createMutation = trpc.contentIdeas.create.useMutation({
    onSuccess: () => utils.contentIdeas.list.invalidate(),
  });
  const updateMutation = trpc.contentIdeas.update.useMutation({
    onSuccess: () => utils.contentIdeas.list.invalidate(),
  });

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
          Associe cada ideia a um tema, tópico e estágio do funil (C1/C2/C3).
        </p>
      </div>

      <div className="flex justify-end">
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
              >
                Salvar
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

      <div className="space-y-2">
        {(ideias ?? []).map((idea) => (
          <Card key={idea.id}>
            <CardContent className="pt-4">
              {editingId === idea.id ? (
                <IdeiaEditForm
                  idea={idea}
                  temas={temas ?? []}
                  onSave={(data) => {
                    updateMutation.mutate({ id: idea.id, ...data }, { onSuccess: () => setEditingId(null) });
                  }}
                  onCancel={() => setEditingId(null)}
                  isSaving={updateMutation.isPending}
                />
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{idea.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tema: {temas?.find((t) => t.id === idea.themeId)?.name ?? idea.theme ?? "—"} · 
                      Tópico: {CONTEUDO_TOPICOS.find((t) => t.value === idea.topic)?.label ?? idea.topic} · 
                      Funil: {CONTEUDO_FUNIL.find((f) => f.value === idea.funnel)?.label ?? idea.funnel}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(idea.id)}>
                      Editar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {(!ideias || ideias.length === 0) && !showNewForm && (
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
