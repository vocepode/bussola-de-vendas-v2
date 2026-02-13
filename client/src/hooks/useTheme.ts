import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function canUseLocalStorage(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined" &&
      typeof window.localStorage.getItem === "function" &&
      typeof window.localStorage.setItem === "function"
    );
  } catch {
    return false;
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/6525ceb4-a6e9-48a8-a6b4-9299a34af0f0", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "pre-fix-2",
        hypothesisId: "H5",
        location: "client/src/hooks/useTheme.ts:init",
        message: "Theme init environment",
        data: {
          hasWindow: typeof window !== "undefined",
          localStorageType:
            typeof window !== "undefined" ? typeof (window as any).localStorage : "no-window",
          getItemType:
            typeof window !== "undefined"
              ? typeof (window as any).localStorage?.getItem
              : "no-window",
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log

    if (!canUseLocalStorage()) return "light";

    const stored = window.localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark") return stored;

    // Verificar preferência do sistema (só no browser)
    if (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches) return "dark";
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remover classe anterior
    root.classList.remove("light", "dark");
    
    // Adicionar nova classe
    root.classList.add(theme);
    
    // Salvar no localStorage
    if (canUseLocalStorage()) {
      window.localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return { theme, setTheme, toggleTheme };
}
