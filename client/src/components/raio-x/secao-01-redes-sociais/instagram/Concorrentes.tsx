"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { InstagramConcorrentes, ConcorrenteInstagram, Avaliacao1a5 } from "@/lib/raio-x/schema";
import { Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";

const TIPOS = [
  { value: "direto", label: "Concorrente direto" },
  { value: "indireto", label: "Concorrente indireto" },
  { value: "referencia", label: "Referência de mercado" },
] as const;

const DIMENSOES = ["clareza", "fotoPerfil", "bio", "destaques", "feed", "links"] as const;
const AVALIACOES: { value: Avaliacao1a5; label: string }[] = [
  { value: 0, label: "0" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
];

function createConcorrente(): ConcorrenteInstagram {
  return {
    id: nanoid(),
    username: "",
    tipo: "direto",
    analise: {
      clareza: null,
      fotoPerfil: null,
      bio: { nota: "", avaliacao: null },
      destaques: { nota: "", avaliacao: null },
      feed: { nota: "", avaliacao: null },
      links: { nota: "", avaliacao: null },
    },
    oFazeMelhor: "",
    oportunidades: "",
    nota: "",
  };
}

export function Concorrentes({
  data,
  onChange,
}: {
  data: InstagramConcorrentes;
  onChange: (data: InstagramConcorrentes) => void;
}) {
  const add = () => {
    onChange({
      ...data,
      concorrentes: [...data.concorrentes, createConcorrente()],
    });
  };

  const update = (id: string, patch: Partial<ConcorrenteInstagram>) => {
    onChange({
      ...data,
      concorrentes: data.concorrentes.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  };

  const remove = (id: string) => {
    onChange({
      ...data,
      concorrentes: data.concorrentes.filter((c) => c.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Mínimo obrigatório: 3 concorrentes. Atual: {data.concorrentes.length}/3
      </p>

      {data.concorrentes.map((c) => (
        <Card key={c.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <Input
              placeholder="@ do concorrente"
              value={c.username}
              onChange={(e) => update(c.id, { username: e.target.value })}
              className="max-w-xs"
            />
            <div className="flex items-center gap-2">
              <select
                value={c.tipo}
                onChange={(e) =>
                  update(c.id, { tipo: e.target.value as ConcorrenteInstagram["tipo"] })
                }
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(c.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {DIMENSOES.map((dim) => {
              const isObjDim = dim === "bio" || dim === "destaques" || dim === "feed" || dim === "links";
              const valorAtual = isObjDim
                ? (c.analise[dim] as { avaliacao?: Avaliacao1a5 }).avaliacao
                : (c.analise[dim] as Avaliacao1a5);
              return (
                <div key={dim} className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground capitalize">
                    {dim === "fotoPerfil" ? "Foto de perfil" : dim} (0 a 5)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVALIACOES.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          if (isObjDim) {
                            update(c.id, {
                              analise: {
                                ...c.analise,
                                [dim]: {
                                  ...(c.analise[dim] as { nota: string; avaliacao: Avaliacao1a5 }),
                                  avaliacao: value,
                                },
                              },
                            });
                          } else {
                            update(c.id, {
                              analise: { ...c.analise, [dim]: value },
                            });
                          }
                        }}
                        className={`rounded border px-2 py-1 text-xs font-medium ${
                          valorAtual === value ? "border-violet-500 bg-violet-500/20 text-violet-700 dark:text-violet-300" : "border-border"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {isObjDim && (
                    <Textarea
                      placeholder="Nota"
                      value={(c.analise[dim] as { nota?: string })?.nota ?? ""}
                      onChange={(e) =>
                        update(c.id, {
                          analise: {
                            ...c.analise,
                            [dim]: {
                              ...(c.analise[dim] as { nota: string; avaliacao: Avaliacao1a5 }),
                              nota: e.target.value,
                            },
                          },
                        })
                      }
                      className="min-h-[60px] text-sm"
                    />
                  )}
                </div>
              );
            })}
            <Textarea
              placeholder="O que fazem melhor que você?"
              value={c.oFazeMelhor}
              onChange={(e) => update(c.id, { oFazeMelhor: e.target.value })}
              className="min-h-[80px]"
            />
            <Textarea
              placeholder="Oportunidades para se diferenciar"
              value={c.oportunidades}
              onChange={(e) => update(c.id, { oportunidades: e.target.value })}
              className="min-h-[80px]"
            />
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" onClick={add} className="gap-2">
        <Plus className="h-4 w-4" />
        Adicionar concorrente
      </Button>

      {data.concorrentes.length >= 3 && (
        <div className="space-y-2">
          <label className="font-medium text-foreground">Síntese da análise comparativa</label>
          <p className="text-xs text-muted-foreground">
            O que você aprendeu olhando para a concorrência? Qual é o seu diferencial claro de posicionamento?
          </p>
          <Textarea
            placeholder="Síntese..."
            value={data.conclusao}
            onChange={(e) => onChange({ ...data, conclusao: e.target.value })}
            className="min-h-[100px]"
          />
        </div>
      )}
    </div>
  );
}
