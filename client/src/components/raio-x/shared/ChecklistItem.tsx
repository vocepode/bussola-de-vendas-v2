"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import type { ChecklistBase } from "@/lib/raio-x/schema";

interface ChecklistItemProps {
  label: string;
  instrucao?: string;
  item: ChecklistBase;
  onChange: (item: ChecklistBase) => void;
}

export function ChecklistItem({ label, instrucao, item, onChange }: ChecklistItemProps) {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={item.checked}
          onCheckedChange={(checked) => onChange({ ...item, checked: !!checked })}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground">{label}</p>
          {instrucao ? (
            <p className="mt-1 text-xs text-muted-foreground">{instrucao}</p>
          ) : null}
        </div>
      </div>
      <Textarea
        placeholder="Notas..."
        value={item.nota}
        onChange={(e) => onChange({ ...item, nota: e.target.value })}
        className="min-h-[60px] resize-y text-sm"
      />
    </div>
  );
}
