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
import { Loader2, RotateCcw, CheckCircle2, HelpCircle, ChevronDown, ChevronRight } from "lucide-react";
import type { NorthBlock, NorthStepDef, NorthShowWhen } from "@/north/schema";

type Props = {
  lessonId: number;
  step: NorthStepDef;
  workspaceSlug?: "marco-zero" | "norte";
  tablePrefill?: {
    fieldId: string;
    rowKey: string;
    values: string[];
  };
  /** Para tabelas com fixedRows: sobrescreve o label de cada linha (ex.: nome da empresa do Comece por Aqui). */
  fixedRowLabelsByFieldId?: Record<string, string[]>;
  footerExtra?: React.ReactNode;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function satisfiesShowWhen(data: Record<string, unknown>, showWhen?: NorthShowWhen | null): boolean {
  if (!showWhen) return true;
  const v = data[showWhen.fieldId];
  const want = showWhen.value;
  const wantArr = Array.isArray(want) ? want : [want];
  const op = showWhen.operator ?? "eq";

  if (op === "neq") {
    if (Array.isArray(v)) return !(v as string[]).some((x) => wantArr.some((w) => x === w || String(x).trim() === String(w).trim()));
    return !wantArr.some((w) => v === w || String(v).trim() === String(w).trim());
  }

  if (op === "contains") {
    if (!Array.isArray(v)) return wantArr.some((w) => v === w || String(v).trim() === String(w).trim());
    return (v as string[]).some((x) => wantArr.some((w) => x === w || String(x).trim() === String(w).trim()));
  }

  if (Array.isArray(v)) return (v as string[]).some((x) => wantArr.some((w) => x === w || String(x).trim() === String(w).trim()));
  if (Array.isArray(want)) return wantArr.some((w) => v === w || String(v).trim() === String(want).trim());
  return v === want || String(v ?? "").trim() === String(want).trim();
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
  /** Quando definido, exibe contador "Adicionadas: X/Y" e bloqueia Concluir etapa até atingir o mínimo. */
  minItems?: number;
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
        {typeof props.minItems === "number" && props.minItems > 0 ? (
          <div className="text-xs text-muted-foreground mt-1">
            Adicionadas: {list.length}/{props.minItems}
          </div>
        ) : null}
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

export function NorthStepForm({ lessonId, step, workspaceSlug, tablePrefill, fixedRowLabelsByFieldId, footerExtra }: Props) {
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
      await utils.dashboard.getOverview.invalidate();
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
  const [columnHelpOpen, setColumnHelpOpen] = useState<string | null>(null);
  const [examplesOpen, setExamplesOpen] = useState(false);
  const timerRef = useRef<number | null>(null);
  const lastPrefillSigRef = useRef<string | null>(null);

  useEffect(() => {
    let next = isRecord((state as any)?.data) ? ((state as any).data as Record<string, unknown>) : {};
    const patch: Record<string, unknown> = {};
    for (const b of step.blocks) {
      if (b.type !== "table" || !b.fixedRows?.length) continue;
      const cur = next[b.fieldId];
      if (Array.isArray(cur) && cur.length > 0) continue;
      const overrideLabels = fixedRowLabelsByFieldId?.[b.fieldId];
      const initial = b.fixedRows.map((fr, i) => {
        const row: Record<string, string> = {};
        const firstCol = b.columns[0];
        if (firstCol) row[firstCol.key] = (overrideLabels?.[i] != null && overrideLabels[i] !== "" ? overrideLabels[i] : fr.label) || "";
        b.columns.slice(1).forEach((c) => (row[c.key] = ""));
        return row;
      });
      next = { ...next, [b.fieldId]: initial };
      patch[b.fieldId] = initial;
    }
    setLocalData(next);
    const updatedAt = (state as any)?.updatedAt ? new Date((state as any).updatedAt) : null;
    setLastSavedAt(updatedAt);
    if (Object.keys(patch).length > 0) {
      flushSave(patch).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.lessonId, step.blocks, fixedRowLabelsByFieldId]);

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

  const visibleBlocks = useMemo(() => {
    return step.blocks.filter((b) => {
      if (b.type === "field" && b.showWhen) return satisfiesShowWhen(localData, b.showWhen);
      if (b.type === "table" && "showWhen" in b && (b as any).showWhen) return satisfiesShowWhen(localData, (b as any).showWhen);
      return true;
    });
  }, [step.blocks, localData]);

  const requiredFieldsFilled = useMemo(() => {
    for (const b of visibleBlocks) {
      if (b.type === "field" && b.required) {
        const v = localData[b.fieldId];
        if (v == null || (typeof v === "string" && v.trim() === "")) return false;
        if (Array.isArray(v) && v.length === 0) return false;
        if (isRecord(v) && Object.keys(v).length === 0) return false;
        const minItems = (b as { minItems?: number }).minItems;
        if (typeof minItems === "number" && minItems > 0) {
          const arr = Array.isArray(v) ? (v as string[]) : [];
          if (arr.length < minItems) return false;
        }
      }
      if (b.type === "table" && (b as any).required) {
        const v = localData[b.fieldId];
        const rows = Array.isArray(v) ? (v as unknown[]).filter((r) => isRecord(r)) : [];
        const filled = rows.some((r) => Object.values(r as Record<string, unknown>).some((c) => c != null && String(c).trim() !== ""));
        if (!filled) return false;
      }
    }
    return true;
  }, [visibleBlocks, localData]);

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

    if (b.type === "examples") {
      const labels = [
        { key: "mercado" as const, label: "Mercado" },
        { key: "nicho" as const, label: "Nicho" },
        { key: "subnicho" as const, label: "Subnicho" },
        { key: "segmento" as const, label: "Segmento" },
      ];
      return (
        <div key={idx} className="space-y-2">
          <button
            type="button"
            onClick={() => setExamplesOpen((prev) => !prev)}
            className="flex items-center gap-2 w-full text-left rounded-md hover:bg-white/5 py-1.5 px-1 -mx-1 transition-colors"
            aria-expanded={examplesOpen}
          >
            {examplesOpen ? (
              <ChevronDown className="w-5 h-5 text-white/70 shrink-0" />
            ) : (
              <ChevronRight className="w-5 h-5 text-white/70 shrink-0" />
            )}
            <span className="text-lg font-semibold">{b.title ?? "Exemplos"}</span>
          </button>
          {examplesOpen ? (
            <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-3 pt-1">
              {b.items.map((item, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-[#262626] bg-[#161616] p-4 space-y-2"
                >
                  <div className="text-xs font-medium text-white/60 pb-1 border-b border-[#262626]">
                    Exemplo {i + 1}
                  </div>
                  {labels.map(({ key, label }) => (
                    <div key={key} className="space-y-0.5">
                      <span className="text-xs text-white/60">{label}</span>
                      <p className="text-sm text-white">{item[key]}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      );
    }

    if (b.type === "table") {
      const fixedRows = b.fixedRows ?? [];
      const isFixed = fixedRows.length > 0;
      const overrideLabels = fixedRowLabelsByFieldId?.[b.fieldId];
      const getRowLabel = (i: number, fr: { key: string; label: string }) =>
        (overrideLabels && overrideLabels[i] != null && overrideLabels[i] !== "" ? overrideLabels[i] : fr.label) || "";
      let value = localData[b.fieldId];
      let rows = Array.isArray(value) ? (value as any[]) : [];
      if (isFixed && rows.length === 0) {
        rows = fixedRows.map((fr, i) => {
          const row: Record<string, string> = {};
          const firstCol = b.columns[0];
          if (firstCol) row[firstCol.key] = getRowLabel(i, fr);
          b.columns.slice(1).forEach((c) => (row[c.key] = ""));
          return row;
        });
      } else if (isFixed && rows.length !== fixedRows.length) {
        rows = fixedRows.map((fr, i) => {
          const existing = rows[i] && isRecord(rows[i]) ? (rows[i] as Record<string, unknown>) : {};
          const firstCol = b.columns[0];
          const row: Record<string, string> = {};
          if (firstCol) row[firstCol.key] = getRowLabel(i, fr);
          b.columns.slice(1).forEach((c) => (row[c.key] = String(existing[c.key] ?? "")));
          return row;
        });
      }
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

      const firstColKey = b.columns[0]?.key;
      const columnHelp = "columnHelp" in b && Array.isArray(b.columnHelp) ? b.columnHelp : [];
      const helpByKey = Object.fromEntries(columnHelp.map((h) => [h.key, h]));

      return (
        <div key={idx} className="space-y-2">
          <div>
            <div className="font-medium text-white">{b.label}</div>
            {b.helperText ? <div className="text-xs text-white/60">{b.helperText}</div> : null}
          </div>

          <div className="rounded-lg border border-[#262626] bg-[#161616] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-[#262626]">
                  {b.columns.map((c) => {
                    const help = helpByKey[c.key];
                    return (
                      <TableHead key={c.key} className="text-white">
                        <div className="flex items-center gap-1">
                          <span>{c.label}</span>
                          {help ? (
                            <button
                              type="button"
                              onClick={() => setColumnHelpOpen((prev) => (prev === `${b.fieldId}:${c.key}` ? null : `${b.fieldId}:${c.key}`))}
                              className="p-0.5 rounded text-white/60 hover:text-white hover:bg-white/10"
                              title={help.title}
                            >
                              <HelpCircle className="w-4 h-4" />
                            </button>
                          ) : null}
                        </div>
                      </TableHead>
                    );
                  })}
                  {!isFixed ? <TableHead className="w-[1%]" /> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {columnHelp.some((h) => columnHelpOpen === `${b.fieldId}:${h.key}`) ? (
                  <TableRow className="border-[#262626] bg-white/5">
                    <TableCell colSpan={b.columns.length + (isFixed ? 0 : 1)} className="border-[#262626] text-sm text-white/80 py-3">
                      {columnHelp.map((h) =>
                        columnHelpOpen === `${b.fieldId}:${h.key}` ? (
                          <div key={h.key} className="space-y-1">
                            <div className="font-medium text-white/90">{h.title}</div>
                            <div className="whitespace-pre-wrap">{h.content}</div>
                          </div>
                        ) : null
                      )}
                    </TableCell>
                  </TableRow>
                ) : null}
                {safeRows.length ? (
                  safeRows.map((r, rIdx) => (
                    <TableRow key={rIdx} className="border-[#262626] hover:bg-white/5">
                      {b.columns.map((c) => (
                        <TableCell key={c.key} className="border-[#262626]">
                          {isFixed && c.key === firstColKey ? (
                            <span className="text-sm text-white/90">
                              {overrideLabels?.[rIdx] ?? String((r as any)[c.key] ?? "")}
                            </span>
                          ) : (
                            <Input
                              value={String((r as any)[c.key] ?? "")}
                              placeholder={c.placeholder}
                              onChange={(e) => updateCell(rIdx, c.key, e.target.value, false)}
                              onBlur={(e) => updateCell(rIdx, c.key, e.target.value, true)}
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            />
                          )}
                        </TableCell>
                      ))}
                      {!isFixed ? (
                        <TableCell className="border-[#262626]">
                          <Button variant="ghost" size="sm" onClick={() => removeRow(rIdx)} className="text-white/90 hover:bg-white/10">
                            Remover
                          </Button>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-[#262626]">
                    <TableCell colSpan={b.columns.length + (isFixed ? 0 : 1)} className="text-sm text-white/60 py-4">
                      Sem linhas ainda. Clique em &quot;Adicionar linha&quot; para começar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {!isFixed ? (
            <Button variant="outline" onClick={addRow} className="border-white/20 text-white hover:bg-white/10">
              Adicionar linha
            </Button>
          ) : null}
        </div>
      );
    }

    if (b.type === "field") {
      const value = localData[b.fieldId];

      if (b.fieldType === "longText") {
        const rows = typeof b.minRows === "number" && b.minRows > 0 ? b.minRows : 6;
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
              rows={rows}
            />
          </div>
        );
      }

      if (b.fieldType === "number") {
        const numVal = value !== undefined && value !== null && value !== "" ? String(value) : "";
        return (
          <div key={idx} className="space-y-2">
            <div>
              <div className="font-medium">{b.label}</div>
              {b.helperText ? <div className="text-xs text-muted-foreground">{b.helperText}</div> : null}
            </div>
            <Input
              type="number"
              value={numVal}
              placeholder={b.placeholder}
              onChange={(e) => setField(b.fieldId, e.target.value === "" ? null : e.target.value, { flush: false })}
              onBlur={(e) => setField(b.fieldId, e.target.value === "" ? null : e.target.value, { flush: true })}
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

      if (b.fieldType === "multiChoiceLimit") {
        const selected = Array.isArray(value) ? (value as string[]) : [];
        const max = b.maxSelections ?? 1;
        const setSelected = (next: string[], flush: boolean) => setField(b.fieldId, next, { flush });
        const options = b.options ?? [];
        const toggle = (oId: string, checked: boolean) => {
          if (checked) {
            const next = selected.length >= max ? [...selected.slice(1), oId] : [...selected, oId];
            setSelected(next, true);
          } else {
            setSelected(selected.filter((x) => x !== oId), true);
          }
        };
        return (
          <div key={idx} className="space-y-2">
            <div>
              <div className="font-medium">{b.label}</div>
              {b.helperText ? <div className="text-xs text-muted-foreground">{b.helperText}</div> : null}
              {max > 1 ? <div className="text-xs text-muted-foreground">Marque até {max}</div> : null}
            </div>
            <div className="space-y-2">
              {options.map((o) => {
                const checked = selected.includes(o.id);
                return (
                  <label key={o.id} className="flex items-start gap-3 rounded-md border p-3 hover:bg-muted/30">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => toggle(o.id, !!v)}
                    />
                    <span className="text-sm">{o.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      }

      if (b.fieldType === "scaleChoice") {
        const scaleRows = b.scaleRows ?? [];
        const scaleOptions = b.scaleOptions ?? [];
        const obj = isRecord(value) ? (value as Record<string, string>) : {};
        const getRow = (rowId: string) => obj[rowId] ?? "";
        const setRow = (rowId: string, optionId: string, flush: boolean) => {
          const next = { ...obj, [rowId]: optionId };
          setField(b.fieldId, next, { flush });
        };
        return (
          <div key={idx} className="space-y-2">
            <div>
              <div className="font-medium">{b.label}</div>
              {b.helperText ? <div className="text-xs text-muted-foreground">{b.helperText}</div> : null}
            </div>
            <div className="space-y-3">
              {scaleRows.map((row) => (
                <div key={row.id} className="rounded-md border p-3 space-y-2">
                  <div className="text-sm font-medium">{row.label}</div>
                  <div className="flex flex-wrap gap-3">
                    {scaleOptions.map((opt) => {
                      const checked = getRow(row.id) === opt.id;
                      return (
                        <label key={opt.id} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`scale-${b.fieldId}-${row.id}`}
                            checked={checked}
                            onChange={() => setRow(row.id, opt.id, true)}
                            className="rounded border-input"
                          />
                          <span className="text-sm">{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (b.fieldType === "stringList") {
        const minItems = (b as { minItems?: number }).minItems;
        return (
          <StringListField
            key={idx}
            label={b.label}
            helperText={b.helperText}
            placeholder={b.placeholder}
            value={value}
            onChange={(next) => setField(b.fieldId, next, { flush: true })}
            minItems={minItems}
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
            <Badge className="gap-2 bg-primary text-primary-foreground">
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
        {visibleBlocks.map((b, idx) => (
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
          disabled={complete.isPending || (status !== "completed" && !requiredFieldsFilled)}
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
