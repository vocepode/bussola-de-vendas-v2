"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type CourseCardProps = {
  title: string;
  href: string;
  acronym: string;
  cover?: string;
  dark?: boolean;
};

export function CourseCard({ title, href, acronym, cover, dark }: CourseCardProps) {
  const [imgError, setImgError] = useState(false);
  const showImg = cover && !imgError;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="min-w-0 block h-full"
    >
      <Card
        className={cn(
          "group flex h-full min-h-[280px] flex-col gap-0 overflow-hidden rounded-2xl border p-0 shadow-none transition hover:-translate-y-0.5",
          dark
            ? "border-[#262626] bg-[#161616] text-white hover:border-violet-500/40"
            : "border-border bg-card hover:border-primary/50"
        )}
      >
        <div className="relative flex h-[160px] w-full shrink-0 overflow-hidden rounded-t-2xl bg-primary/10">
          {showImg ? (
            <>
              <img
                src={cover}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                onError={() => setImgError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
            </>
          ) : (
            <span className="m-auto text-2xl font-bold text-primary">{acronym}</span>
          )}
        </div>
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col justify-between space-y-2 p-3",
            dark ? "bg-[#1a1a1a]" : "bg-muted/20"
          )}
        >
          <p
            className={cn(
              "line-clamp-2 text-sm font-medium leading-snug",
              dark ? "text-white" : "text-foreground"
            )}
          >
            {title}
          </p>
          <span
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium transition",
              dark
                ? "border-white/30 bg-white/5 text-white group-hover:bg-white/10"
                : "border-border bg-muted/50 text-foreground group-hover:bg-muted"
            )}
          >
            Acessar <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </div>
      </Card>
    </a>
  );
}
