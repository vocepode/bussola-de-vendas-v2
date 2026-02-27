"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, X, ImageIcon } from "lucide-react";
import type { PrintSlot } from "@/lib/raio-x/print-instructions";

interface UploadPrintSlotsProps {
  slots: PrintSlot[];
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
}

function ensureLength(urls: string[], len: number): string[] {
  const out = [...urls];
  while (out.length < len) out.push("");
  return out.slice(0, len);
}

export function UploadPrintSlots({ slots, value, onChange, disabled }: UploadPrintSlotsProps) {
  const urls = ensureLength(value, slots.length);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleFile = async (index: number, file: File) => {
    setError(null);
    setLoadingIndex(index);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload-raio-x", { method: "POST", body: formData });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Falha no upload");
        return;
      }
      if (data.url) {
        const next = [...urls];
        next[index] = data.url;
        onChange(next);
      }
    } catch {
      setError("Falha ao enviar a imagem.");
    } finally {
      setLoadingIndex(null);
    }
  };

  const remove = (index: number) => {
    const next = urls.filter((_, i) => i !== index);
    while (next.length < slots.length) next.push("");
    onChange(next.slice(0, slots.length));
  };

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-destructive rounded-lg bg-destructive/10 p-2">{error}</p>
      )}
      {slots.map((slot, index) => (
        <div
          key={index}
          className="rounded-lg border border-border bg-card p-4 space-y-2"
        >
          <Label className="font-medium">{slot.label}</Label>
          <p className="text-sm text-muted-foreground">{slot.instrucao}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              ref={(el) => { inputRefs.current[index] = el; }}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(index, f);
                e.target.value = "";
              }}
              disabled={disabled}
            />
            {urls[index] ? (
              <>
                <a
                  href={urls[index]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ImageIcon className="w-4 h-4" />
                  Ver print
                </a>
                <img
                  src={urls[index]}
                  alt=""
                  className="h-16 w-16 object-cover rounded border border-border"
                />
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                    Remover
                  </Button>
                )}
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || loadingIndex !== null}
                onClick={() => inputRefs.current[index]?.click()}
              >
                {loadingIndex === index ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Enviar print"
                )}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
