"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

export function TemasSection() {
  const utils = trpc.useUtils();
  const { data: editoriais } = trpc.mapa.editoriais.list.useQuery(undefined, {
    refetchOnMount: "always",
  });
  const { data: temas, isLoading } = trpc.mapa.temas.list.useQuery();
  const createMutation = trpc.mapa.temas.create.useMutation({
    onSuccess: () => {
      utils.mapa.temas.list.invalidate();
      toast.success("Tema salvo.");
    },
    onError: (err) => {
      toast.error(err.message || "Não foi possível salvar o tema. Verifique se as migrações do banco foram aplicadas (yarn db:push).");
    },
  });
  const updateMutation = trpc.mapa.temas.update.useMutation({
    onSuccess: () => utils.mapa.temas.list.invalidate(),
  });
  const deleteMutation = trpc.mapa.temas.delete.useMutation({
    onSuccess: () => utils.mapa.temas.list.invalidate(),
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newContext, setNewContext] = useState("");
  const [newEditorialId, setNewEditorialId] = useState<string>("");
  const [showNewForm, setShowNewForm] = useState(false);

  const handleCreate = () => {
    const editorialId = newEditorialId ? parseInt(newEditorialId, 10) : undefined;
    if (!newName.trim() || !editorialId) return;
    createMutation.mutate(
      { name: newName.trim(), context: newContext.trim() || null, editorialId },
      {
        onSuccess: () => {
          setNewName("");
          setNewContext("");
          setNewEditorialId("");
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

  const temasPorEditoria = (editoriais ?? []).map((ed) => ({
    editorial: ed,
    temas: (temas ?? []).filter((t) => t.editorialId === ed.id),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Temas</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Defina temas por editoria. Recomendado: pelo menos 4 temas por editoria.
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
          Novo tema
        </Button>
      </div>

      {showNewForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="grid gap-2">
              <Label>Editoria</Label>
              <Select value={newEditorialId} onValueChange={setNewEditorialId}>
                <SelectTrigger>
                  <SelectValue placeholder={(editoriais ?? []).length === 0 ? "Nenhuma editoria — crie na aba Editoriais" : "Selecione a editoria"} />
                </SelectTrigger>
                <SelectContent>
                  {(editoriais ?? []).map((ed) => (
                    <SelectItem key={ed.id} value={String(ed.id)}>{ed.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(editoriais ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground">Crie pelo menos uma editoria na aba Editoriais e volte aqui.</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Tema</Label>
              <Input
                placeholder="Nome do tema"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Contexto</Label>
              <Textarea
                placeholder="Contexto do tema..."
                value={newContext}
                onChange={(e) => setNewContext(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={!newName.trim() || !newEditorialId || createMutation.isPending}
              >
                Salvar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowNewForm(false);
                  setNewName("");
                  setNewContext("");
                  setNewEditorialId("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {temasPorEditoria.map(({ editorial, temas: temasEd }) => (
          <Card key={editorial.id}>
            <CardContent className="pt-4">
              <p className="font-medium text-sm text-muted-foreground mb-2">
                {editorial.name} {temasEd.length < 4 && (
                  <span className="text-amber-600">(recomendado: pelo menos 4 temas)</span>
                )}
              </p>
              <div className="space-y-2">
                {(temasEd).map((tema) => (
                  <div
                    key={tema.id}
                    className="flex items-start justify-between gap-4 rounded border p-3"
                  >
                    {editingId === tema.id ? (
                      <TemaEditForm
                        tema={tema}
                        editoriais={editoriais ?? []}
                        onSave={(data) => {
                          updateMutation.mutate({ id: tema.id, ...data }, { onSuccess: () => setEditingId(null) });
                        }}
                        onCancel={() => setEditingId(null)}
                        isSaving={updateMutation.isPending}
                      />
                    ) : (
                      <>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{tema.name}</p>
                          {tema.context && (
                            <p className="text-sm text-muted-foreground mt-1">{tema.context}</p>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(tema.id)}>
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteMutation.mutate({ id: tema.id })}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {temasEd.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum tema nesta editoria.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!editoriais || editoriais.length === 0) && (
        <p className="text-sm text-muted-foreground">Crie editoriais primeiro na aba Editoriais.</p>
      )}
    </div>
  );
}

function TemaEditForm({
  tema,
  editoriais,
  onSave,
  onCancel,
  isSaving,
}: {
  tema: { id: number; name: string; context: string | null; editorialId: number };
  editoriais: { id: number; name: string }[];
  onSave: (data: { name?: string; context?: string | null; editorialId?: number }) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [name, setName] = useState(tema.name);
  const [context, setContext] = useState(tema.context ?? "");
  const [editorialId, setEditorialId] = useState(String(tema.editorialId));

  return (
    <div className="w-full space-y-3">
      <div className="grid gap-2">
        <Label>Editoria</Label>
        <Select value={editorialId} onValueChange={setEditorialId}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {editoriais.map((ed) => (
              <SelectItem key={ed.id} value={String(ed.id)}>{ed.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Tema</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label>Contexto</Label>
        <Textarea value={context} onChange={(e) => setContext(e.target.value)} rows={2} />
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onSave({ name, context: context || null, editorialId: parseInt(editorialId, 10) })}
          disabled={!name.trim() || isSaving}
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
