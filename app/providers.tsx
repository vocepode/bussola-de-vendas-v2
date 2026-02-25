"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import superjson from "superjson";
import { useEffect, useMemo, useState } from "react";
import { UNAUTHED_ERR_MSG } from "@shared/const";
import { trpc } from "@/lib/trpc";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

function redirectToLoginIfUnauthorized(error: unknown) {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;
  if (error.message !== UNAUTHED_ERR_MSG) return;
  if (window.location.pathname === "/login") return;
  window.location.href = "/login";
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useMemo(() => {
    queryClient.getQueryCache().subscribe(event => {
      if (event.type === "updated" && event.action.type === "error") {
        const error = event.query.state.error;
        redirectToLoginIfUnauthorized(error);
        console.error("[API Query Error]", error);
      }
    });

    queryClient.getMutationCache().subscribe(event => {
      if (event.type === "updated" && event.action.type === "error") {
        const error = event.mutation.state.error;
        redirectToLoginIfUnauthorized(error);
        console.error("[API Mutation Error]", error);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // #region agent log (apenas em desenvolvimento)
    if (typeof window === "undefined" || process.env.NODE_ENV !== "development") return;
    try {
      const probe = document.createElement("div");
      probe.className = "text-4xl container";
      probe.style.position = "absolute";
      probe.style.visibility = "hidden";
      probe.textContent = "probe";
      document.body.appendChild(probe);
      const cs = getComputedStyle(probe);
      const fontSize = cs.fontSize;
      const maxWidth = cs.maxWidth;
      probe.remove();

      let hasText4xlRule: boolean | null = null;
      let hasContainerRule: boolean | null = null;
      try {
        let text4xl = 0;
        let container = 0;
        // Some stylesheets are cross-origin; accessing cssRules can throw.
        for (const sheet of Array.from(document.styleSheets ?? [])) {
          const href = (sheet as CSSStyleSheet).href ?? null;
          // Skip cross-origin sheets (likely to throw)
          if (href && !href.startsWith(window.location.origin)) continue;
          const rules = (sheet as CSSStyleSheet).cssRules;
          for (const rule of Array.from(rules ?? [])) {
            const txt = (rule as CSSRule).cssText ?? "";
            if (txt.includes(".text-4xl")) text4xl++;
            if (txt.includes(".container")) container++;
          }
        }
        hasText4xlRule = text4xl > 0;
        hasContainerRule = container > 0;
      } catch {
        hasText4xlRule = null;
        hasContainerRule = null;
      }

      fetch("http://127.0.0.1:7242/ingest/6525ceb4-a6e9-48a8-a6b4-9299a34af0f0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "debug-session",
          runId: "pre-fix-1",
          hypothesisId: "H1",
          location: "app/providers.tsx:probe",
          message: "CSS probe computed styles",
          data: {
            fontSize,
            maxWidth,
            styleSheetsCount: document.styleSheets?.length ?? null,
            hasText4xlRule,
            hasContainerRule,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    } catch (e) {
      fetch("http://127.0.0.1:7242/ingest/6525ceb4-a6e9-48a8-a6b4-9299a34af0f0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "debug-session",
          runId: "pre-fix-1",
          hypothesisId: "H2",
          location: "app/providers.tsx:probe",
          message: "CSS probe failed",
          data: { error: String(e) },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    }
    // #endregion agent log
  }, []);

  const trpcClient = useMemo(
    () =>
      trpc.createClient({
        links: [
          httpBatchLink({
            url: "/api/trpc",
            transformer: superjson,
            fetch(input, init) {
              return globalThis.fetch(input, {
                ...(init ?? {}),
                credentials: "include",
              });
            },
          }),
        ],
      }),
    []
  );

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="dark" switchable={true}>
            <TooltipProvider>
              <Toaster />
              {children}
            </TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}
