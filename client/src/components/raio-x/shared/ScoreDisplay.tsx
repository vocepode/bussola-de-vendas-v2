"use client";

import { cn } from "@/lib/utils";

interface ScoreDisplayProps {
  value: number;
  max?: number;
  label?: string;
  className?: string;
}

export function ScoreDisplay({ value, max = 10, label, className }: ScoreDisplayProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const color =
    pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-blue-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className={cn("space-y-1", className)}>
      {label ? <p className="text-sm font-medium text-foreground">{label}</p> : null}
      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 max-w-[120px] rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", color)}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-sm font-medium tabular-nums text-foreground">
          {value}/{max}
        </span>
      </div>
    </div>
  );
}
