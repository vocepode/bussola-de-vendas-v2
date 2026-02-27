"use client";

import { Suspense } from "react";
import RaioXPreview from "@/pages/RaioXPreview";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function RaioXPreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Carregando preview...</div>}>
      <RaioXPreview />
    </Suspense>
  );
}
