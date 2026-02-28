export type DraftEnvelope<T> = {
  savedAt: number;
  data: T;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadDraft<T>(key: string): DraftEnvelope<T> | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DraftEnvelope<T>>;
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.savedAt !== "number") return null;
    if (!("data" in parsed)) return null;
    return {
      savedAt: parsed.savedAt,
      data: parsed.data as T,
    };
  } catch {
    return null;
  }
}

export function saveDraft<T>(key: string, data: T): void {
  if (!canUseStorage()) return;
  const payload: DraftEnvelope<T> = {
    savedAt: Date.now(),
    data,
  };
  try {
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Ignore quota and serialization errors.
  }
}

export function clearDraft(key: string): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore localStorage errors.
  }
}
