"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, RotateCcw, CheckCircle2 } from "lucide-react";
import type { NorthBlock, NorthStepDef } from "@/north/schema";

type Props = {
  lessonId: number;
  step: NorthStepDef;
  workspaceSlug?: "marco-zero" | "norte";
  tablePrefill?: {
    fieldId: string;
    rowKey: string;
    values: string[];
  };
  footerExtra?: React.ReactNode;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function debounceMs() {
  return 800;
}

function StringListField(props: {
  label: string;
  helperText?: string;
  placeholder?: string;
  value: unknown;
  onChange: (next: string[]) => void;
}) {
  const list = Array.isArray(props.value) ? (props.value as string[]) : [];
  const [current, setCurrent] = useState("");

  const add = (item: string) => {
    const v = item.trim();
    if (!v) return;
    props.onChange([...list, v]);
    setCurrent("");
  };

  const remove = (idxToRemove: number) => {
    props.onChange(list.filter((_x, i) => i !== idxToRemove));
  };

  return (
    <div className="space-y-2">
      <div>
        <div className="font-medium">{props.label}</div>
        {props.helperText ? <div className="text-xs text-muted-foreground">{props.helperText}</div> : null}
      </div>
      <div className="flex gap-2">
        <Input
          value={current}
          placeholder={props.placeholder}
          onChange={(e) => setCurrent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(current);
            }
          }}
        />
        <Button variant="outline" onClick={() => add(current)}>
          Adicionar
        </Button>
      </div>
      {list.length ? (
        <div className="flex flex-wrap gap-2">
          {list.map((it, i) => (
            <Badge key={`${it}-${i}`} variant="secondary" className="gap-2">
              <span className="max-w-[260px] truncate">{it}</span>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => remove(i)}
                aria-label="Remover item"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function NorthStepForm({ lessonId, step, workspaceSlug, tablePrefill, footerExtra }: Props) {
  const utils = trpc.useUtils();

  const { data: state, isLoading } = trpc.lessonState.get.useQuery(
    { lessonId },
    { enabled: lessonId > 0 }
  );

  const upsertDraft = trpc.lessonState.upsertDraft.useMutation({
    onSuccess: () => {
      utils.lessonState.get.invalidate({ lessonId }).catch(() => {});
    },
  });

  const complete = trpc.lessonState.complete.useMutation({
    onSuccess: async () => {
      toast.success("Etapa concluída!");
      await utils.lessonState.get.invalidate({ lessonId });
      if (workspaceSlug) {
        await utils.workspaces.getProgressBySlug.invalidate({ slug: workspaceSlug });
      }
    },
    onError: (err) => toast.error(err.message || "Não foi possível concluir a etapa."),
  });

  const reset = trpc.lessonState.reset.useMutation({
    onSuccess: async () => {
      toast.success("Respostas resetadas.");
      await utils.lessonState.get.invalidate({ lessonId });
    },
    onError: (err) => toast.error(err.message || "Não foi possível resetar."),
  });

  const [localData, setLocalData] = useState<Record<string, unknown>>({});
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const timerRef = useRef<number | null>(null);
  const lastPrefillSigRef = useRef<string | null>(null);

  useEffect(() => {
    const next = isRecord((state as any)?.data) ? ((state as any).data as Record<string, unknown>) : {};
    setLocalData(next);
    const updatedAt = (state as any)?.updatedAt ? new Date((state as any).updatedAt) : null;
    setLastSavedAt(updatedAt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.lessonId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const status = ((state as any)?.status as "draft" | "completed" | undefined) ?? "draft";

  const saving = upsertDraft.isPending;
  const savedLabel = useMemo(() => {
    if (saving) return "Salvando…";
    if (!lastSavedAt) return "Não salvo ainda";
    return `Salvo ${lastSavedAt.toLocaleString()}`;
  }, [saving, lastSavedAt]);

  const scheduleSave = (patch: Record<string, unknown>) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(async () => {
      try {
        const res = await upsertDraft.mutateAsync({ lessonId, patch });
        setLastSavedAt(new Date(res.updatedAt));
      } catch {
        // erro já tratado pelo react-query
      }
    }, debounceMs());
  };

  const flushSave = async (patch: Record<string, unknown>) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    const res = await upsertDraft.mutateAsync({ lessonId, patch });
    setLastSavedAt(new Date(res.updatedAt));
  };

  // Prefill opcional de tabela a partir de uma lista (ex.: concorrentes do Diagnóstico do negócio)
  useEffect(() => {
    if (!tablePrefill) return;
    if (!state) return;
    if (!tablePrefill.values.length) return;

    const fieldId = tablePrefill.fieldId;
    const rowKey = tablePrefill.rowKey;
    const values = tablePrefill.values;

    const signature = JSON.stringify({ lessonId, fieldId, rowKey, values });
    if (signature === lastPrefillSigRef.current) return;

    const current = localData[fieldId];
    const rows = Array.isArray(current) ? (current as unknown[]).filter((r) => isRecord(r)) : [];

    const byKey = new Map<string, Record<string, unknown>>();
    for (const r of rows) {
      const k = String((r as any)[rowKey] ?? "");
      if (k) byKey.set(k, r);
    }

    const nextRows = values.map((name) => {
      const existing = byKey.get(name);
      return existing ? { ...existing, [rowKey]: name } : { [rowKey]: name };
    });

    // Mantém linhas extras (caso o usuário tenha adicionado manualmente)
    const extras = rows.filter((r) => {
      const k = String((r as any)[rowKey] ?? "");
      return k && !values.includes(k);
    });

    const merged = [...nextRows, ...extras];
    const changed = JSON.stringify(rows) !== JSON.stringify(merged);
    if (!changed) {
      lastPrefillSigRef.current = signature;
      return;
    }

    setLocalData((prev) => ({ ...prev, [fieldId]: merged }));
    flushSave({ [fieldId]: merged }).catch((err: any) => toast.error(err?.message || "Falha ao salvar."));
    lastPrefillSigRef.current = signature;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, state?.lessonId, tablePrefill?.fieldId, tablePrefill?.rowKey, JSON.stringify(tablePrefill?.values)]);

  const setField = (fieldId: string, value: unknown, { flush }: { flush: boolean }) => {
    setLocalData((prev) => ({ ...prev, [fieldId]: value }));
    const patch = { [fieldId]: value };
    if (flush) {
      flushSave(patch).catch((err: any) => toast.error(err?.message || "Falha ao salvar."));
    } else {
      scheduleSave(patch);
    }
  };

  const renderBlock = (b: NorthBlock, idx: number) => {
    if (b.type === "divider") {
      return <hr key={idx} className="my-6 border-border" />;
    }

    if (b.type === "intro") {
      return (
        <div key={idx} className="space-y-1">
          {b.title ? <h2 className="text-lg font-semibold">{b.title}</h2> : null}
          {b.description ? <p className="text-sm text-muted-foreground">{b.description}</p> : null}
        </div>
      );
    }

    if (b.type === "table") {
      const value = localData[b.fieldId];
      const rows = Array.isArray(value) ? (value as any[]) : [];
      const safeRows = rows.filter((r) => isRecord(r));

      const addRow = () => {
        const next = [...safeRows, Object.fromEntries(b.columns.map((c) => [c.key, ""]))];
        setField(b.fieldId, next, { flush: true });
      };

      const updateCell = (rowIdx: number, colKey: string, v: string, flush: boolean) => {
        const next = safeRows.map((r, i) => (i === rowIdx ? { ...r, [colKey]: v } : r));
        setField(b.fieldId, next, { flush });
      };

      const removeRow = (rowIdx: number) => {
        const next = safeRows.filter((_r, i) => i !== rowIdx);
        setField(b.fieldId, next, { flush: true });
      };

      return (
        <div key={idx} className="space-y-2">
          <div>
            <div className="font-medium">{b.label}</div>
            {b.helperText ? <div className="text-xs text-muted-foreground">{b.helperText}</div> : null}
          </div>

          <div className="rounded-lg border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  {b.columns.map((c) => (
                    <TableHead key={c.key}>{c.label}</TableHead>
                  ))}
                  <TableHead className="w-[1%]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeRows.length ? (
                  safeRows.map((r, rIdx) => (
                    <TableRow key={rIdx}>
                      {b.columns.map((c) => (
                        <TableCell key={c.key}>
                          <Input
                            value={String((r as any)[c.key] ?? "")}
                            placeholder={c.placeholder}
                            onChange={(e) => updateCell(rIdx, c.key, e.target.value, false)}
                            onBlur={(e) => updateCell(rIdx, c.key, e.target.value, true)}
                          />
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => removeRow(rIdx)}>
                          Remover
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={b.columns.length + 1} className="text-sm text-muted-foreground">
                      Sem linhas ainda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <Button variant="outline" onClick={addRow}>
            Adicionar linha
          </Button>
        </div>
      );
    }

    if (b.type === "field") {
      const value = localData[b.fieldId];

      if (b.fieldType === "longText") {
        return (
          <div key={idx} className="space-y-2">
            <div>
              <div className="font-medium">{b.label}</div>
              {b.helperText ? <div className="text-xs text-muted-foreground">{b.helperText}</div> : null}
            </div>
            <Textarea
              value={String(value ?? "")}
              placeholder={b.placeholder}
              onChange={(e) => setField(b.fieldId, e.target.value, { flush: false })}
              onBlur={(e) => setField(b.fieldId, e.target.value, { flush: true })}
              rows={6}
            />
          </div>
        );
      }

      if (b.fieldType === "shortText" || b.fieldType === "currency") {
        return (
          <div key={idx} className="space-y-2">
            <div>
              <div className="font-medium">{b.label}</div>
              {b.helperText ? <div className="text-xs text-muted-foreground">{b.helperText}</div> : null}
            </div>
            <Input
              value={String(value ?? "")}
              placeholder={b.placeholder}
              onChange={(e) => setField(b.fieldId, e.target.value, { flush: false })}
              onBlur={(e) => setField(b.fieldId, e.target.value, { flush: true })}
            />
          </div>
        );
      }

      if (b.fieldType === "singleChoice") {
        const selected = typeof value === "string" ? value : "";
        const options = b.options ?? [];
        return (
          <div key={idx} className="space-y-2">
            <div>
              <div className="font-medium">{b.label}</div>
              {b.helperText ? <div className="text-xs text-muted-foreground">{b.helperText}</div> : null}
            </div>
            <div className="space-y-2">
              {options.map((o) => {
                const checked = selected === o.id;
                return (
                  <label key={o.id} className="flex items-start gap-3 rounded-md border p-3 hover:bg-muted/30">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => {
                        const next = v ? o.id : "";
                        setField(b.fieldId, next, { flush: true });
                      }}
                    />
                    <span className="text-sm">{o.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      }

      if (b.fieldType === "multiChoice") {
        const selected = Array.isArray(value) ? (value as string[]) : [];
        const setSelected = (next: string[], flush: boolean) => setField(b.fieldId, next, { flush });
        const options = b.options ?? [];
        return (
          <div key={idx} className="space-y-2">
            <div>
              <div className="font-medium">{b.label}</div>
              {b.helperText ? <div className="text-xs text-muted-foreground">{b.helperText}</div> : null}
            </div>
            <div className="space-y-2">
              {options.map((o) => {
                const checked = selected.includes(o.id);
                return (
                  <label key={o.id} className="flex items-start gap-3 rounded-md border p-3 hover:bg-muted/30">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => {
                        const next = v ? [...selected, o.id] : selected.filter((x) => x !== o.id);
                        setSelected(next, true);
                      }}
                    />
                    <span className="text-sm">{o.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      }

      if (b.fieldType === "stringList") {
        return (
          <StringListField
            key={idx}
            label={b.label}
            helperText={b.helperText}
            placeholder={b.placeholder}
            value={value}
            onChange={(next) => setField(b.fieldId, next, { flush: true })}
          />
        );
      }
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">{savedLabel}</div>
        <div className="flex items-center gap-2">
          {status === "completed" ? (
            <Badge className="gap-2 bg-[#7c3aed] text-white">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Concluído
            </Badge>
          ) : (
            <Badge variant="secondary">Rascunho</Badge>
          )}
          {saving ? (
            <Badge variant="secondary" className="gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Salvando
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="space-y-6">
        {step.blocks.map((b, idx) => (
          <div key={idx}>{renderBlock(b, idx)}</div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="gap-2" disabled={reset.isPending}>
              <RotateCcw className="w-4 h-4" />
              Resetar respostas desta etapa
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Resetar respostas?</AlertDialogTitle>
              <AlertDialogDescription>
                Isso vai apagar todas as respostas desta etapa para você e começar do zero.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => reset.mutate({ lessonId })}
              >
                {reset.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Resetando…
                  </span>
                ) : (
                  "Resetar"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {footerExtra}

        <Button
          className="gap-2"
          onClick={() => complete.mutate({ lessonId })}
          disabled={complete.isPending}
        >
          {complete.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Concluindo…
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Concluir etapa
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
