import { useEffect, useRef } from "react";

type Options = {
  enabled?: boolean;
  hasUnsavedChanges: boolean;
  onFlush?: () => void | Promise<void>;
  promptMessage?: string;
};

/**
 * Protege contra perda acidental de dados:
 * - tenta flush quando a aba fica oculta / pagehide
 * - exibe confirmação ao sair quando há mudanças pendentes
 */
export function useUnsavedChangesProtection(options: Options) {
  const {
    enabled = true,
    hasUnsavedChanges,
    onFlush,
    promptMessage = "Você tem alterações não salvas. Deseja sair mesmo assim?",
  } = options;

  const unsavedRef = useRef(hasUnsavedChanges);
  const flushRef = useRef(onFlush);
  const messageRef = useRef(promptMessage);

  useEffect(() => {
    unsavedRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  useEffect(() => {
    flushRef.current = onFlush;
  }, [onFlush]);

  useEffect(() => {
    messageRef.current = promptMessage;
  }, [promptMessage]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const flushIfNeeded = () => {
      if (!unsavedRef.current) return;
      void flushRef.current?.();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushIfNeeded();
      }
    };

    const onPageHide = () => {
      flushIfNeeded();
    };

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!unsavedRef.current) return;
      flushIfNeeded();
      event.preventDefault();
      event.returnValue = messageRef.current;
      return messageRef.current;
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [enabled]);
}
