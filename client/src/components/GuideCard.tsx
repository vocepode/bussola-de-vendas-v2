"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

/** Iniciais para fallback quando a imagem não carrega (ex: "Guia Marco Zero" -> "GM") */
function getInitials(title: string): string {
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return title.slice(0, 2).toUpperCase();
}

type GuideCardProps = {
  title: string;
  href: string;
  cover: string;
  dark?: boolean;
};

export function GuideCard({ title, href, cover, dark }: GuideCardProps) {
  const [imgError, setImgError] = useState(false);
  const showImg = !imgError;
  const isPlaceholder = href === "#";
  const Wrapper = isPlaceholder ? "div" : "a";
  const wrapperProps = isPlaceholder
    ? { className: "min-w-0 block h-full cursor-default" }
    : {
        className: "min-w-0 block h-full",
        href,
        target: "_blank",
        rel: "noopener noreferrer",
      };

  return (
    <Wrapper {...wrapperProps}>
      <Card
        className={cn(
          "group flex h-full min-h-[280px] flex-col gap-0 overflow-hidden rounded-2xl border p-0 shadow-none transition",
          !isPlaceholder && "hover:-translate-y-0.5",
          dark
            ? "border-[#262626] bg-[#161616] text-white"
            : "border-border bg-card",
          !isPlaceholder && (dark ? "hover:border-violet-500/40" : "hover:border-primary/50"),
          isPlaceholder && "opacity-80"
        )}
      >
        <div className="relative flex h-[160px] w-full shrink-0 overflow-hidden rounded-t-2xl bg-primary/10">
          {showImg ? (
            <>
              <img
                src={cover}
                alt=""
                className={cn(
                  "absolute inset-0 h-full w-full object-cover",
                  isPlaceholder && "grayscale"
                )}
                onError={() => setImgError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
            </>
          ) : (
            <span className="m-auto text-2xl font-bold text-primary">{getInitials(title)}</span>
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
          {isPlaceholder ? (
            <span
              className={cn(
                "inline-flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium",
                dark
                  ? "border-white/20 bg-white/5 text-white/70"
                  : "border-border bg-muted/30 text-muted-foreground"
              )}
            >
              Em breve
            </span>
          ) : (
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
          )}
        </div>
      </Card>
    </Wrapper>
  );
}
