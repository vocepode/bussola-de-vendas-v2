import { Suspense } from "react";
import SettingsPage from "@/pages/Settings";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>}>
      <SettingsPage />
    </Suspense>
  );
}
