"use client";

import * as React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface ProgressStatsItem {
  name: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative";
  href?: string;
  icon?: LucideIcon;
}

interface ProgressStatsCardsProps {
  items: ProgressStatsItem[];
  className?: string;
}

export function ProgressStatsCards({ items, className }: ProgressStatsCardsProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const cardClass = cn(
    "rounded-xl border p-4 shadow-none gap-0",
    isDark ? "border-[#2e1a4a] bg-[#3b2163] text-white" : "border-primary/30 bg-primary/10 text-foreground"
  );
  const titleClass = cn("text-sm", isDark ? "text-white/90" : "text-foreground/90");
  const iconClass = cn("h-4 w-4 shrink-0", isDark ? "text-white/80" : "text-primary");

  return (
    <dl className={cn("grid grid-cols-1 gap-6 md:grid-cols-3 w-full", className)}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.name} className={cardClass}>
            <CardContent className="p-0">
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className={cn("truncate", titleClass)}>{item.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {item.change != null && (
                    <span
                      className={cn(
                        "text-sm font-medium",
                        item.changeType === "positive"
                          ? "text-emerald-700 dark:text-emerald-500"
                          : "text-red-700 dark:text-red-500"
                      )}
                    >
                      {item.change}
                    </span>
                  )}
                  {Icon ? <Icon className={iconClass} aria-hidden /> : null}
                </div>
              </div>
              <dd className="mt-1 text-3xl font-semibold">{item.value}</dd>
            </CardContent>
            {item.href ? (
              <CardFooter className="flex justify-end border-t border-border pt-4">
                <a href={item.href} className="text-sm font-medium text-primary hover:text-primary/90">
                  Ver mais →
                </a>
              </CardFooter>
            ) : null}
          </Card>
        );
      })}
    </dl>
  );
}
