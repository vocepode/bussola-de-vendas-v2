"use client";
import { Suspense } from "react";
import MarcoZeroPreview from "@/pages/MarcoZeroPreview";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function MarcoZeroPreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Carregando preview...</div>}>
      <MarcoZeroPreview />
    </Suspense>
  );
}
