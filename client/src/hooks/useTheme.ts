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
    if (!canUseLocalStorage()) return "light";

    const stored = window.localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark") return stored;

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
