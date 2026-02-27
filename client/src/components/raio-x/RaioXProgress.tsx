"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SecaoItem {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
}

export function RaioXProgress({
  secoes,
  secaoAtiva,
  onSecaoChange,
  progresso,
}: {
  secoes: SecaoItem[];
  secaoAtiva: string;
  onSecaoChange: (id: string) => void;
  progresso: number;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Progress value={progresso} className="h-2 flex-1 max-w-xs" />
        <span className="text-sm font-medium tabular-nums text-foreground">{progresso}%</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {secoes.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSecaoChange(s.id)}
            className={cn(
              "rounded-lg border px-3 py-2 text-left text-sm transition",
              secaoAtiva === s.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            <span className="mr-2" aria-hidden>
              {s.icon}
            </span>
            {s.label} — {s.sublabel}
          </button>
        ))}
      </div>
    </div>
  );
}
