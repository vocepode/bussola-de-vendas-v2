"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SecaoWeb as SecaoWebType } from "@/lib/raio-x/schema";
import { Ecommerce } from "./Ecommerce";
import { LandingPage } from "./LandingPage";
import { Site } from "./Site";

const TABS = [
  { id: "ecommerce", label: "E-commerce" },
  { id: "landing", label: "Landing Page" },
  { id: "site", label: "Site" },
] as const;

export function SecaoWeb({
  data,
  onSave,
}: {
  data: SecaoWebType;
  onSave: (data: SecaoWebType) => void;
}) {
  const [tab, setTab] = useState<typeof TABS[number]["id"]>("ecommerce");

  const update = (patch: Partial<SecaoWebType>) => {
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

      {tab === "ecommerce" && (
        <Ecommerce data={data.ecommerce} onChange={(ecommerce) => update({ ecommerce })} />
      )}
      {tab === "landing" && (
        <LandingPage data={data.landingPage} onChange={(landingPage) => update({ landingPage })} />
      )}
      {tab === "site" && (
        <Site data={data.site} onChange={(site) => update({ site })} />
      )}
    </div>
  );
}
