"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, Loader2, Plus, Trash2 } from "lucide-react";
import { clearDraft, loadDraft, saveDraft } from "@/lib/draftStorage";
import { useUnsavedChangesProtection } from "@/hooks/useUnsavedChangesProtection";

const DRAFT_KEY = "draft:mapa:editoriais:new";

export function EditoriaisSection() {
  const utils = trpc.useUtils();
  const { data: editoriais, isLoading } = trpc.mapa.editoriais.list.useQuery();
  const newFormRef = useRef<HTMLDivElement>(null);
  const createMutation = trpc.mapa.editoriais.create.useMutation({
    onSuccess: async () => {
      await utils.mapa.editoriais.list.invalidate();
      await utils.workspaces.getProgressBySlug.invalidate({ slug: "mapa" });
      await utils.dashboard.getOverview.invalidate();
      setShowNewForm(false);
      setNewName("");
      setNewWhy("");
      setNewContext("");
      clearDraft(DRAFT_KEY);
      toast.success("Editoria salva.");
    },
    onError: (err) => {
      toast.error(err.message || "Não foi possível salvar a editoria. Verifique se as migrações do banco foram aplicadas (yarn db:push).");
    },
  });
  const updateMutation = trpc.mapa.editoriais.update.useMutation({
    onSuccess: async () => {
      await utils.mapa.editoriais.list.invalidate();
      await utils.workspaces.getProgressBySlug.invalidate({ slug: "mapa" });
      await utils.dashboard.getOverview.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Não foi possível atualizar a editoria.");
    },
  });
  const deleteMutation = trpc.mapa.editoriais.delete.useMutation({
    onSuccess: async () => {
      await utils.mapa.editoriais.list.invalidate();
      await utils.workspaces.getProgressBySlug.invalidate({ slug: "mapa" });
      await utils.dashboard.getOverview.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Não foi possível remover a editoria.");
    },
  });

  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newWhy, setNewWhy] = useState("");
  const [newContext, setNewContext] = useState("");
  const [instrucoesOpen, setInstrucoesOpen] = useState(false);
  const [exemploOpen, setExemploOpen] = useState(false);

  useEffect(() => {
    if (showNewForm && newFormRef.current) {
      newFormRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [showNewForm]);

  useEffect(() => {
    const draft = loadDraft<{ name: string; why: string; context: string; show: boolean }>(DRAFT_KEY);
    if (!draft?.data) return;
    setNewName(draft.data.name ?? "");
    setNewWhy(draft.data.why ?? "");
    setNewContext(draft.data.context ?? "");
    setShowNewForm(!!draft.data.show);
  }, []);

  useEffect(() => {
    const hasData = !!newName.trim() || !!newWhy.trim() || !!newContext.trim();
    if (!hasData && !showNewForm) {
      clearDraft(DRAFT_KEY);
      return;
    }
    saveDraft(DRAFT_KEY, {
      name: newName,
      why: newWhy,
      context: newContext,
      show: showNewForm,
    });
  }, [newContext, newName, newWhy, showNewForm]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createMutation.mutate({
      name: newName.trim(),
      whyExplore: newWhy.trim() || null,
      context: newContext.trim() || null,
    });
  };

  const handleNovaClick = () => {
    setShowNewForm(true);
    setEditingId(null);
  };

  useUnsavedChangesProtection({
    hasUnsavedChanges:
      (showNewForm && (!!newName.trim() || !!newWhy.trim() || !!newContext.trim())) ||
      createMutation.isPending,
    onFlush: () => {
      if (!showNewForm) return;
      saveDraft(DRAFT_KEY, {
        name: newName,
        why: newWhy,
        context: newContext,
        show: true,
      });
    },
  });

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
        <h2 className="text-xl font-semibold">Editoriais</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Defina as editorias do seu conteúdo: nome, por que explorar e contexto de uso.
        </p>
      </div>

      <Collapsible open={instrucoesOpen} onOpenChange={setInstrucoesOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          {instrucoesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          Instruções do preenchimento da tabela
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 text-sm text-muted-foreground">
          Preencha o nome da editoria, o motivo pelo qual ela deve ser explorada e o contexto de como usá-la na sua estratégia de conteúdo.
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={exemploOpen} onOpenChange={setExemploOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          {exemploOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          Exemplo
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <p className="font-medium">NORTE</p>
            <p className="text-muted-foreground">Por que: Porque direção vem antes da execução. Sem clareza estratégica, todo o resto é esforço desperdiçado.</p>
            <p className="text-muted-foreground mt-1">Contexto: O conteúdo do NORTE existe para ajudar a audiência a pensar melhor antes de agir.</p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          className="gap-2"
          onClick={handleNovaClick}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Nova
        </Button>
      </div>

      {showNewForm && (
        <div ref={newFormRef}>
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="grid gap-2">
                <Label>Editoria</Label>
                <Input
                  placeholder="Ex.: NORTE"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Por que explorar essa editoria?</Label>
                <Textarea
                placeholder="Justificativa estratégica..."
                  value={newWhy}
                  onChange={(e) => setNewWhy(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label>Contexto</Label>
                <Textarea
                  placeholder="Como usar essa editoria..."
                  value={newContext}
                  onChange={(e) => setNewContext(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreate} disabled={!newName.trim() || createMutation.isPending} className="gap-2">
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {createMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setShowNewForm(false);
                    setNewName("");
                    setNewWhy("");
                    setNewContext("");
                    clearDraft(DRAFT_KEY);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {(editoriais ?? []).length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Nome</TableHead>
                <TableHead>Por que explorar</TableHead>
                <TableHead>Contexto</TableHead>
                <TableHead className="w-[120px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(editoriais ?? []).map((ed) => (
                <TableRow key={ed.id}>
                  {editingId === ed.id ? (
                    <TableCell colSpan={4} className="p-4 bg-muted/30">
                      <EditorialEditForm
                        editorial={ed}
                        onSave={(data) => {
                          updateMutation.mutate({ id: ed.id, ...data }, { onSuccess: () => setEditingId(null) });
                        }}
                        onCancel={() => setEditingId(null)}
                        isSaving={updateMutation.isPending}
                      />
                    </TableCell>
                  ) : (
                    <>
                      <TableCell className="font-medium">{ed.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground" title={ed.whyExplore ?? undefined}>
                        {ed.whyExplore ?? "—"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground" title={ed.context ?? undefined}>
                        {ed.context ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(ed.id)}>
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteMutation.mutate({ id: ed.id })}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {(!editoriais || editoriais.length === 0) && !showNewForm && (
        <p className="text-sm text-muted-foreground">Nenhuma editoria ainda. Clique em Nova para criar.</p>
      )}
    </div>
  );
}

function EditorialEditForm({
  editorial,
  onSave,
  onCancel,
  isSaving,
}: {
  editorial: { id: number; name: string; whyExplore: string | null; context: string | null };
  onSave: (data: { name: string; whyExplore?: string | null; context?: string | null }) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [name, setName] = useState(editorial.name);
  const [whyExplore, setWhyExplore] = useState(editorial.whyExplore ?? "");
  const [context, setContext] = useState(editorial.context ?? "");

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        <Label>Editoria</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label>Por que explorar essa editoria?</Label>
        <Textarea value={whyExplore} onChange={(e) => setWhyExplore(e.target.value)} rows={2} />
      </div>
      <div className="grid gap-2">
        <Label>Contexto</Label>
        <Textarea value={context} onChange={(e) => setContext(e.target.value)} rows={3} />
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onSave({ name, whyExplore: whyExplore || null, context: context || null })}
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
