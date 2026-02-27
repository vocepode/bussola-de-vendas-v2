"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SecaoRedesSociais as SecaoRedesSociaisType } from "@/lib/raio-x/schema";
import { MeuInstagram } from "./instagram/MeuInstagram";
import { Concorrentes } from "./instagram/Concorrentes";
import { MeuTikTok } from "./tiktok/MeuTikTok";
import { MeuYoutube } from "./youtube/MeuYoutube";

const TABS = [
  { id: "instagram", label: "Meu Instagram" },
  { id: "concorrentes", label: "Concorrentes" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
] as const;

export function SecaoRedesSociais({
  data,
  norteData,
  onSave,
}: {
  data: SecaoRedesSociaisType;
  norteData: { persona?: string; proposta?: string } | null | undefined;
  onSave: (data: SecaoRedesSociaisType) => void;
}) {
  const [tab, setTab] = useState<typeof TABS[number]["id"]>("instagram");

  const update = (patch: Partial<SecaoRedesSociaisType>) => {
    onSave({ ...data, ...patch });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition",
              tab === t.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-foreground hover:border-primary/50"
            )}
          >
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === "instagram" && (
        <MeuInstagram
          data={data.instagram.meuNegocio}
          norteData={norteData}
          onChange={(meuNegocio) => update({ instagram: { ...data.instagram, meuNegocio } })}
        />
      )}
      {tab === "concorrentes" && (
        <Concorrentes
          data={data.instagram.concorrentes}
          onChange={(concorrentes) => update({ instagram: { ...data.instagram, concorrentes } })}
        />
      )}
      {tab === "tiktok" && (
        <MeuTikTok
          data={data.tiktok}
          onChange={(tiktok) => update({ tiktok })}
        />
      )}
      {tab === "youtube" && (
        <MeuYoutube
          data={data.youtube}
          onChange={(youtube) => update({ youtube })}
        />
      )}
    </div>
  );
}
