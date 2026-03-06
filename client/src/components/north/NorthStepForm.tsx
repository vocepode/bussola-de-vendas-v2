"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Loader2, RotateCcw, CheckCircle2, HelpCircle, ChevronDown, ChevronRight, Pencil } from "lucide-react";
import type { NorthBlock, NorthStepDef, NorthShowWhen } from "@/north/schema";
import { clearDraft, loadDraft, saveDraft } from "@/lib/draftStorage";
import { formatCurrencyBR, parseCurrencyBR } from "@/lib/utils";
import { useUnsavedChangesProtection } from "@/hooks/useUnsavedChangesProtection";

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
  /** Botão(es) à esquerda da barra (ex.: ← Tarefa anterior). */
  navigationPrev?: React.ReactNode;
  /** Botão(es) à direita da barra (ex.: Avançar / Avançar módulo). */
  navigationNext?: React.ReactNode;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/** Se o valor for string que é JSON de objeto inteiro (ex.: campo gravado errado), retorna só o texto deste campo para exibir. */
function normalizeFieldDisplayValue(value: unknown, fieldId: string): string {
  if (value == null) return "";
  if (typeof value !== "string") return String(value);
  const trimmed = value.trim();
  if (trimmed === "") return "";
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const keys = Object.keys(parsed);
        if (keys.length > 1 || keys.includes(fieldId)) {
          const fieldVal = parsed[fieldId];
          const str = fieldVal != null ? String(fieldVal) : "";
          return str.replace(/\\n/g, "\n");
        }
      }
    } catch {
      // não é JSON válido, segue com o valor original
    }
  }
  return value.replace(/\\n/g, "\n");
}

/** Evita gravar no servidor um valor que é o JSON inteiro do passo (bug de um campo com objeto todo). */
function sanitizeFieldValueForSave(value: unknown, fieldId: string): unknown {
  if (value == null) return value;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed.startsWith("{")) return value;
  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && Object.keys(parsed).length > 1) {
      const fieldVal = parsed[fieldId];
      return fieldVal != null ? fieldVal : "";
    }
  } catch {
    // ignora
  }
  return value;
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

const DEBOUNCE_MS = 800;
const DEBOUNCE_LARGE_MS = 1800;
const LARGE_PAYLOAD_BYTES = 50000;
const SAVE_TIMEOUT_MS = 25000;

function debounceMsForPatch(patch: Record<string, unknown>): number {
  const size = typeof patch === "object" && patch !== null
    ? JSON.stringify(patch).length
    : 0;
  return size >= LARGE_PAYLOAD_BYTES ? DEBOUNCE_LARGE_MS : DEBOUNCE_MS;
}

const FIELD_INPUT_CLASS =
  "border-input bg-background text-foreground placeholder:text-muted-foreground dark:border-white/20 dark:bg-[#121212] dark:text-white dark:placeholder:text-white/45";
const FIELD_OPTION_CLASS = "rounded-md border p-3 hover:bg-muted/30 dark:border-white/20";

function StringListField(props: {
  label: string;
  helperText?: string;
  placeholder?: string;
  value: unknown;
  onChange: (next: string[]) => void;
  inputClassName?: string;
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
          className={props.inputClassName}
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

export function NorthStepForm({ lessonId, step, workspaceSlug, tablePrefill, fixedRowLabelsByFieldId, footerExtra, navigationPrev, navigationNext }: Props) {
  const utils = trpc.useUtils();
  const draftKey = useMemo(() => `draft:lesson:${lessonId}`, [lessonId]);

  const { data: state, isLoading } = trpc.lessonState.get.useQuery(
    { lessonId },
    { enabled: lessonId > 0 }
  );

  const upsertDraft = trpc.lessonState.upsertDraft.useMutation({
    onSuccess: async () => {
      await utils.lessonState.get.invalidate({ lessonId }).catch(() => {});
      if (workspaceSlug) {
        await utils.workspaces.getWorkspaceStateBySlug.invalidate({ slug: workspaceSlug }).catch(() => {});
      }
    },
    onError: (err) => {
      toast.error(err.message || "Falha ao salvar. Tente novamente ou divida o texto em partes menores.");
    },
  });

  const complete = trpc.lessonState.complete.useMutation({
    onSuccess: async () => {
      clearDraft(draftKey);
      setHasUnsavedChanges(false);
      toast.success("Etapa concluída!");
      await utils.lessonState.get.invalidate({ lessonId });
      if (workspaceSlug) {
        await utils.workspaces.getProgressBySlug.invalidate({ slug: workspaceSlug });
        await utils.workspaces.getWorkspaceStateBySlug.invalidate({ slug: workspaceSlug });
      }
      await utils.dashboard.getOverview.invalidate();
    },
    onError: (err) => toast.error(err.message || "Não foi possível concluir a etapa."),
  });

  const reset = trpc.lessonState.reset.useMutation({
    onSuccess: async () => {
      clearDraft(draftKey);
      setHasUnsavedChanges(false);
      toast.success("Respostas resetadas.");
      await utils.lessonState.get.invalidate({ lessonId });
      if (workspaceSlug) {
        await utils.workspaces.getWorkspaceStateBySlug.invalidate({ slug: workspaceSlug });
      }
    },
    onError: (err) => toast.error(err.message || "Não foi possível resetar."),
  });
  const reopen = trpc.lessonState.reopen.useMutation({
    onSuccess: async () => {
      toast.success("Edição liberada. Você pode ajustar apenas o que quiser.");
      await utils.lessonState.get.invalidate({ lessonId });
      if (workspaceSlug) {
        await utils.workspaces.getProgressBySlug.invalidate({ slug: workspaceSlug });
        await utils.workspaces.getWorkspaceStateBySlug.invalidate({ slug: workspaceSlug });
      }
      await utils.dashboard.getOverview.invalidate();
    },
    onError: (err) => toast.error(err.message || "Não foi possível liberar edição."),
  });

  const [localData, setLocalData] = useState<Record<string, unknown>>({});
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [columnHelpOpen, setColumnHelpOpen] = useState<string | null>(null);
  const [examplesOpen, setExamplesOpen] = useState(false);
  const timerRef = useRef<number | null>(null);
  const lastPrefillSigRef = useRef<string | null>(null);
  const pendingPatchRef = useRef<Record<string, unknown>>({});
  const isCommittingRef = useRef(false);
  const restoredFromLocalRef = useRef(false);

  const commitPendingPatches = useCallback(async () => {
    if (isCommittingRef.current || lessonId <= 0) return;
    isCommittingRef.current = true;
    try {
      while (Object.keys(pendingPatchRef.current).length > 0) {
        const payload = pendingPatchRef.current;
        pendingPatchRef.current = {};
        // #region agent log
        const payloadSize = JSON.stringify(payload).length;
        fetch("http://127.0.0.1:7242/ingest/6525ceb4-a6e9-48a8-a6b4-9299a34af0f0", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "263fed" }, body: JSON.stringify({ sessionId: "263fed", location: "NorthStepForm.tsx:commitStart", message: "commit start", data: { lessonId, payloadKeys: Object.keys(payload), payloadSizeBytes: payloadSize }, timestamp: Date.now(), hypothesisId: "A" }) }).catch(() => {});
        // #endregion
        try {
          const savePromise = upsertDraft.mutateAsync({ lessonId, patch: payload });
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error("Salvamento demorou muito. Tente novamente ou divida o texto em partes menores.")), SAVE_TIMEOUT_MS);
          });
          const res = await Promise.race([savePromise, timeoutPromise]);
          // #region agent log
          fetch("http://127.0.0.1:7242/ingest/6525ceb4-a6e9-48a8-a6b4-9299a34af0f0", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "263fed" }, body: JSON.stringify({ sessionId: "263fed", location: "NorthStepForm.tsx:commitResolved", message: "save resolved", data: { hasUpdatedAt: !!res?.updatedAt }, timestamp: Date.now(), hypothesisId: "E" }) }).catch(() => {});
          // #endregion
          setLastSavedAt(new Date(res.updatedAt));
          clearDraft(draftKey);
          setHasUnsavedChanges(false);
        } catch (err) {
          // #region agent log
          const errMsg = err instanceof Error ? err.message : String(err);
          fetch("http://127.0.0.1:7242/ingest/6525ceb4-a6e9-48a8-a6b4-9299a34af0f0", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "263fed" }, body: JSON.stringify({ sessionId: "263fed", location: "NorthStepForm.tsx:commitRejected", message: "save rejected", data: { errorMessage: errMsg.slice(0, 200), isTimeout: errMsg.includes("Salvamento demorou muito") }, timestamp: Date.now(), hypothesisId: "B" }) }).catch(() => {});
          // #endregion
          pendingPatchRef.current = { ...payload, ...pendingPatchRef.current };
          setHasUnsavedChanges(true);
          const msg = err instanceof Error ? err.message : "";
          if (msg.includes("Salvamento demorou muito")) toast.error(msg);
          throw err;
        }
      }
    } finally {
      isCommittingRef.current = false;
    }
  }, [draftKey, lessonId, upsertDraft]);

  const queuePatch = useCallback((patch: Record<string, unknown>) => {
    if (!patch || Object.keys(patch).length === 0) return;
    pendingPatchRef.current = { ...pendingPatchRef.current, ...patch };
    setHasUnsavedChanges(true);
  }, []);

  const scheduleSave = useCallback((patch: Record<string, unknown>) => {
    queuePatch(patch);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const delay = debounceMsForPatch(patch);
    timerRef.current = window.setTimeout(() => {
      void commitPendingPatches();
    }, delay);
  }, [commitPendingPatches, queuePatch]);

  const flushSave = useCallback(async (patch?: Record<string, unknown>) => {
    if (patch) queuePatch(patch);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    await commitPendingPatches();
  }, [commitPendingPatches, queuePatch]);

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

    const updatedAt = (state as any)?.updatedAt ? new Date((state as any).updatedAt) : null;
    const serverUpdatedMs = updatedAt?.getTime() ?? 0;
    const localDraft = loadDraft<Record<string, unknown>>(draftKey);
    const useLocalDraft = !!localDraft && localDraft.savedAt > serverUpdatedMs;
    if (useLocalDraft && localDraft?.data && isRecord(localDraft.data)) {
      next = { ...next, ...localDraft.data };
      queuePatch(localDraft.data);
      if (!restoredFromLocalRef.current) {
        toast.info("Rascunho local restaurado.");
        restoredFromLocalRef.current = true;
      }
    }

    setLocalData(next);
    setLastSavedAt(updatedAt);
    if (Object.keys(patch).length > 0) {
      void flushSave(patch).catch(() => {});
    } else if (useLocalDraft) {
      void commitPendingPatches().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.lessonId, step.blocks, fixedRowLabelsByFieldId, draftKey]);

  useEffect(() => {
    if (!lessonId || !hasUnsavedChanges || !Object.keys(localData).length) return;
    saveDraft(draftKey, localData);
  }, [draftKey, hasUnsavedChanges, lessonId, localData]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      void flushSave();
    };
  }, [flushSave]);
  useUnsavedChangesProtection({
    enabled: lessonId > 0,
    hasUnsavedChanges: hasUnsavedChanges || upsertDraft.isPending,
    onFlush: async () => {
      await flushSave();
    },
  });

  const status = ((state as any)?.status as "draft" | "completed" | undefined) ?? "draft";

  const saving = upsertDraft.isPending;
  const savedLabel = useMemo(() => {
    if (saving) return "Salvando…";
    if (!lastSavedAt) return "Não salvo ainda";
    return `Salvo ${lastSavedAt.toLocaleString()}`;
  }, [saving, lastSavedAt]);

  // Prefill opcional de tabela a partir de uma lista (ex.: concorrentes do Diagnóstico do negócio).
  // Nunca sobrescrever dados existentes com prefill vazio (evita perda da Matrioska dos Concorrentes no Norte).
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
    const sanitized = sanitizeFieldValueForSave(value, fieldId);
    setLocalData((prev) => ({ ...prev, [fieldId]: sanitized }));
    const patch = { [fieldId]: sanitized };
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
                      {b.columns.map((c) => {
                        const isCurrency =
                          c.key === "valor" || (c as { placeholder?: string }).placeholder?.includes("R$");
                        const cellVal = (r as Record<string, unknown>)[c.key];
                        const displayVal = isCurrency
                          ? (formatCurrencyBR(cellVal) === "—" ? "" : formatCurrencyBR(cellVal))
                          : String(cellVal ?? "");
                        return (
                          <TableCell key={c.key} className="border-[#262626]">
                            {isFixed && c.key === firstColKey ? (
                              <span className="text-sm text-white/90">
                                {overrideLabels?.[rIdx] ?? String((r as any)[c.key] ?? "")}
                              </span>
                            ) : (
                              <Input
                                value={displayVal}
                                placeholder={c.placeholder}
                                onChange={(e) =>
                                  updateCell(
                                    rIdx,
                                    c.key,
                                    isCurrency ? parseCurrencyBR(e.target.value) : e.target.value,
                                    false
                                  )
                                }
                                onBlur={(e) =>
                                  updateCell(
                                    rIdx,
                                    c.key,
                                    isCurrency ? parseCurrencyBR(e.target.value) : e.target.value,
                                    true
                                  )
                                }
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                              />
                            )}
                          </TableCell>
                        );
                      })}
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
              value={normalizeFieldDisplayValue(value, b.fieldId)}
              placeholder={b.placeholder}
              onChange={(e) => setField(b.fieldId, e.target.value, { flush: false })}
              onBlur={(e) => setField(b.fieldId, e.target.value, { flush: true })}
              rows={rows}
              className={FIELD_INPUT_CLASS}
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
              className={FIELD_INPUT_CLASS}
            />
          </div>
        );
      }

      if (b.fieldType === "shortText") {
        return (
          <div key={idx} className="space-y-2">
            <div>
              <div className="font-medium">{b.label}</div>
              {b.helperText ? <div className="text-xs text-muted-foreground">{b.helperText}</div> : null}
            </div>
            <Input
              value={normalizeFieldDisplayValue(value, b.fieldId)}
              placeholder={b.placeholder}
              onChange={(e) => setField(b.fieldId, e.target.value, { flush: false })}
              onBlur={(e) => setField(b.fieldId, e.target.value, { flush: true })}
              className={FIELD_INPUT_CLASS}
            />
          </div>
        );
      }
      if (b.fieldType === "currency") {
        const raw = normalizeFieldDisplayValue(value, b.fieldId);
        const display = raw.trim() ? formatCurrencyBR(raw) : "";
        return (
          <div key={idx} className="space-y-2">
            <div>
              <div className="font-medium">{b.label}</div>
              {b.helperText ? <div className="text-xs text-muted-foreground">{b.helperText}</div> : null}
            </div>
            <Input
              value={display}
              placeholder={b.placeholder ?? "R$ 0,00"}
              onChange={(e) => {
                const parsed = parseCurrencyBR(e.target.value);
                setField(b.fieldId, parsed, { flush: false });
              }}
              onBlur={(e) => {
                const parsed = parseCurrencyBR(e.target.value);
                setField(b.fieldId, parsed, { flush: true });
              }}
              className={FIELD_INPUT_CLASS}
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
                  <label key={o.id} className={`flex items-start gap-3 ${FIELD_OPTION_CLASS}`}>
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
                  <label key={o.id} className={`flex items-start gap-3 ${FIELD_OPTION_CLASS}`}>
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
                  <label key={o.id} className={`flex items-start gap-3 ${FIELD_OPTION_CLASS}`}>
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
            inputClassName={FIELD_INPUT_CLASS}
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

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
        {navigationPrev}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="gap-2" disabled={reset.isPending}>
              <RotateCcw className="w-4 h-4" />
              Resetar respostas
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

        {status === "completed" ? (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => reopen.mutate({ lessonId })}
            disabled={reopen.isPending || reset.isPending || complete.isPending}
          >
            {reopen.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Liberando edição…
              </>
            ) : (
              <>
                <Pencil className="w-4 h-4" />
                Editar respostas
              </>
            )}
          </Button>
        ) : (
          <Button
            className="gap-2"
            onClick={async () => {
              await flushSave();
              complete.mutate({ lessonId });
            }}
            disabled={complete.isPending || !requiredFieldsFilled}
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
        )}

        {footerExtra}
        {navigationNext}
      </div>
    </div>
  );
}
