"use client";
import { Suspense } from "react";
import NorthPreview from "@/pages/NorthPreview";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function NortePreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Carregando preview...</div>}>
      <NorthPreview />
    </Suspense>
  );
}
