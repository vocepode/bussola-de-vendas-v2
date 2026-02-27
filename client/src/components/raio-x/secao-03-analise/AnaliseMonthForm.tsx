"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AnaliseMensal } from "@/lib/raio-x/schema";
import { createInitialAnaliseMensal } from "@/lib/raio-x/schema";

interface AnaliseMonthFormProps {
  meses: AnaliseMensal[];
  onSave: (mes: AnaliseMensal, options?: { immediate?: boolean }) => void;
  onRemove?: (mes: string) => void;
  disabled?: boolean;
}

const AUTO_SAVE_DELAY_MS = 600;

/** Todas as métricas em uma única lista (dados do perfil + negócio). */
const CAMPOS_METRICAS: { key: keyof AnaliseMensal; label: string; hint?: string }[] = [
  { key: "views", label: "Views", hint: "Principal métrica. Conta cada vez que o conteúdo aparece na tela." },
  { key: "reach", label: "Reach (alcance único)", hint: "Número de contas únicas que viram qualquer conteúdo seu." },
  { key: "likes", label: "Curtidas", hint: "Engajamento total = curtidas + comentários + compartilhamentos + salvamentos." },
  { key: "comentarios", label: "Comentários", hint: "Parte do engajamento total." },
  { key: "compartilhamentos", label: "Compartilhamentos", hint: "Parte do engajamento total." },
  { key: "repost", label: "Repost", hint: "Quantidade de reposts no mês. Parte do engajamento." },
  { key: "salvamentos", label: "Salvamentos", hint: "Parte do engajamento total." },
  { key: "engagedAccounts", label: "Engaged Accounts", hint: "Contas que interagiram. No dashboard vira Engagement Rate (%)." },
  { key: "profileVisits", label: "Visitas ao perfil", hint: "Profile Activity: visitas ao perfil + cliques na bio." },
  { key: "newFollowers", label: "Novos seguidores", hint: "Quantidade de novos seguidores no mês." },
  { key: "reelsCompartilhados", label: "Reels compartilhados", hint: "Quantos reels foram compartilhados no mês (métrica principal)." },
  { key: "posts", label: "Posts", hint: "Quantidade de posts no mês (métrica principal)." },
  { key: "bioLinkClicks", label: "Cliques no link da bio", hint: "Movimento para fora do app. Parte do Profile Activity." },
  { key: "dmsStarted", label: "Mensagens diretas iniciadas", hint: "Sinal de intenção forte." },
  { key: "conversions", label: "Conversões atribuídas", hint: "Leads, vendas, registros, downloads." },
];

function toNum(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return Math.max(0, Math.floor(v));
  if (typeof v === "string") {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? 0 : Math.max(0, n);
  }
  return 0;
}

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function addMonth(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const MESES_OPCOES = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

function getAnosDisponiveis(): number[] {
  const anoAtual = new Date().getFullYear();
  return [anoAtual + 1, anoAtual, anoAtual - 1, anoAtual - 2];
}

export function AnaliseMonthForm({ meses, onSave, onRemove, disabled }: AnaliseMonthFormProps) {
  const currentMonth = getCurrentMonth();
  const [mesInput, setMesInput] = useState(currentMonth);
  const [editing, setEditing] = useState<AnaliseMensal | null>(null);
  const [form, setForm] = useState<AnaliseMensal>(() => {
    const mes = currentMonth;
    const existing = meses.find((m) => m.mes === mes);
    return existing ?? createInitialAnaliseMensal(mes);
  });
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushAutoSave = useCallback(() => {
    const mes = form.mes || mesInput || getCurrentMonth();
    if (!mes) return;
    onSave({ ...form, mes });
  }, [form, mesInput, onSave]);

  useEffect(() => {
    if (disabled) return;
    const mes = form.mes || mesInput || getCurrentMonth();
    if (!mes) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveTimerRef.current = null;
      flushAutoSave();
    }, AUTO_SAVE_DELAY_MS);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [form, mesInput, disabled, flushAutoSave]);

  const handleStartNew = () => {
    const mes = mesInput || getCurrentMonth();
    if (meses.some((m) => m.mes === mes)) {
      setEditing(meses.find((m) => m.mes === mes)!);
      setForm(meses.find((m) => m.mes === mes)!);
    } else {
      setEditing(null);
      setForm(createInitialAnaliseMensal(mes));
    }
  };

  const handleNextMonth = () => {
    const base = editing?.mes ?? mesInput ?? getCurrentMonth();
    const next = addMonth(base, 1);
    setMesInput(next);
    if (meses.some((m) => m.mes === next)) {
      const existing = meses.find((m) => m.mes === next)!;
      setEditing(existing);
      setForm({ ...existing });
    } else {
      setEditing(null);
      setForm(createInitialAnaliseMensal(next));
    }
  };

  const handleSave = () => {
    const mes = form.mes || mesInput || getCurrentMonth();
    onSave({ ...form, mes }, { immediate: true });
    setMesInput(getCurrentMonth());
    setEditing(null);
    setForm(createInitialAnaliseMensal(getCurrentMonth()));
  };

  const handleSelectMonth = (m: AnaliseMensal) => {
    setEditing(m);
    setForm({ ...m });
    setMesInput(m.mes);
  };

  const renderField = (key: keyof AnaliseMensal, label: string, hint?: string) => (
    <div key={key} className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <input
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        value={String((form as unknown as Record<string, unknown>)[key] ?? 0)}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, [key]: toNum(e.target.value) }))
        }
        disabled={disabled}
        className="flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base tabular-nums shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 md:text-sm"
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar mês</CardTitle>
        <p className="text-sm text-muted-foreground">
          Preencha as métricas do Instagram para o mês selecionado. Clique em <strong>Salvar agora</strong> para gravar no servidor (recomendado antes de sair da página).
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-2">
            <Label>Mês</Label>
            <Select
              value={(mesInput || editing?.mes || getCurrentMonth()).slice(5, 7)}
              onValueChange={(mes) => {
                const y = (mesInput || editing?.mes || getCurrentMonth()).slice(0, 4);
                setMesInput(`${y}-${mes}`);
              }}
              disabled={disabled}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {MESES_OPCOES.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Ano</Label>
            <Select
              value={(mesInput || editing?.mes || getCurrentMonth()).slice(0, 4)}
              onValueChange={(ano) => {
                const m = (mesInput || editing?.mes || getCurrentMonth()).slice(5, 7);
                setMesInput(`${ano}-${m}`);
              }}
              disabled={disabled}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {getAnosDisponiveis().map((ano) => (
                  <SelectItem key={ano} value={String(ano)}>
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleStartNew} disabled={disabled}>
            {meses.some((m) => m.mes === (mesInput || editing?.mes)) ? "Abrir / Editar mês" : "Abrir mês"}
          </Button>
          <Button variant="outline" onClick={handleNextMonth} disabled={disabled}>
            Próximo mês
          </Button>
        </div>

        {meses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {meses.map((m) => (
              <div key={m.mes} className="inline-flex items-center rounded-md border border-input overflow-hidden">
                <Button
                  type="button"
                  variant={editing?.mes === m.mes ? "default" : "outline"}
                  size="sm"
                  className="rounded-r-none border-0"
                  onClick={() => handleSelectMonth(m)}
                  disabled={disabled}
                >
                  {m.mes}
                </Button>
                {onRemove && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 rounded-l-none p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    aria-label={`Remover mês ${m.mes}`}
                    disabled={disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(m.mes);
                      if (editing?.mes === m.mes) {
                        setEditing(null);
                        setMesInput("");
                      }
                    }}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {(editing || mesInput) && (
          <div className="space-y-8 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {editing ? `Editando ${editing.mes}` : `Novo mês: ${mesInput || "(selecione acima)"}`}
              </span>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={disabled}>
                  Salvar agora
                </Button>
                {editing && onRemove && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      onRemove(editing.mes);
                      setEditing(null);
                      setMesInput("");
                    }}
                    disabled={disabled}
                  >
                    Remover mês
                  </Button>
                )}
              </div>
            </div>

            <section className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {CAMPOS_METRICAS.map((item) => renderField(item.key, item.label, item.hint))}
              </div>
            </section>

            <section className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Métricas por formato de conteúdo (em breve)</p>
            </section>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Input
                value={form.observacoes ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Notas opcionais"
                disabled={disabled}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
