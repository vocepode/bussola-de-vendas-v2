"use client";

import { cn } from "@/lib/utils";

interface PlataformaHeaderProps {
  plataforma: string;
  subtitulo?: string;
  contexto: string;
  status?: "concluido" | "em_andamento" | "nao_iniciado";
  className?: string;
}

export function PlataformaHeader({
  plataforma,
  subtitulo,
  contexto,
  status,
  className,
}: PlataformaHeaderProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-muted/30 p-4 space-y-2",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-foreground">{plataforma}</h2>
          {subtitulo ? (
            <p className="text-sm text-muted-foreground">{subtitulo}</p>
          ) : null}
        </div>
        {status ? (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              status === "concluido" && "bg-green-500/20 text-green-700 dark:text-green-300",
              status === "em_andamento" && "bg-amber-500/20 text-amber-700 dark:text-amber-300",
              status === "nao_iniciado" && "bg-muted text-muted-foreground"
            )}
          >
            {status === "concluido" ? "Concluído" : status === "em_andamento" ? "Em andamento" : "Não iniciado"}
          </span>
        ) : null}
      </div>
      <p className="text-sm text-muted-foreground">{contexto}</p>
    </div>
  );
}
