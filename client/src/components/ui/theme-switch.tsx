"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/contexts/ThemeContext";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const ThemeSwitch = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { theme, toggleTheme, switchable } = useTheme();
  const [checked, setChecked] = useState(theme === "dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setChecked(theme === "dark"), [theme]);

  const handleCheckedChange = useCallback(
    (isChecked: boolean) => {
      setChecked(isChecked);
      const wantsDark = isChecked;
      if (wantsDark !== (theme === "dark")) toggleTheme?.();
    },
    [theme, toggleTheme],
  );

  if (!mounted || !switchable || !toggleTheme) return null;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        "h-6 w-11",
        className
      )}
      {...props}
    >
      <Switch
        checked={checked}
        onCheckedChange={handleCheckedChange}
        className={cn(
          "peer absolute inset-0 h-full w-full rounded-full bg-input/50 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "[&>span]:h-4 [&>span]:w-4 [&>span]:rounded-full [&>span]:bg-background [&>span]:shadow [&>span]:z-10",
          "data-[state=unchecked]:[&>span]:translate-x-0.5",
          "data-[state=checked]:[&>span]:translate-x-[22px]"
        )}
      />

      <span
        className={cn(
          "pointer-events-none absolute left-1 inset-y-0 z-0",
          "flex items-center justify-center"
        )}
      >
        <SunIcon
          size={12}
          className={cn(
            "transition-all duration-200 ease-out",
            checked ? "text-muted-foreground/70" : "text-foreground scale-110"
          )}
        />
      </span>

      <span
        className={cn(
          "pointer-events-none absolute right-1 inset-y-0 z-0",
          "flex items-center justify-center"
        )}
      >
        <MoonIcon
          size={12}
          className={cn(
            "transition-all duration-200 ease-out",
            checked ? "text-foreground scale-110" : "text-muted-foreground/70"
          )}
        />
      </span>
    </div>
  );
};

export default ThemeSwitch;
