"use client";

import { Suspense } from "react";
import MapPreview from "@/pages/MapaPreview";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function MapaPreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando preview...</div>}>
      <MapPreview />
    </Suspense>
  );
}
