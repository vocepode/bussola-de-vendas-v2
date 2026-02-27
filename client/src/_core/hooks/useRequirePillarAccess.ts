"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { PILLARS_ORDER } from "@/constants/pillars";

const PREVIOUS_TITLE_BY_SLUG: Record<string, string> = Object.fromEntries(
  PILLARS_ORDER.map((p) => [p.slug, p.title])
);

/**
 * Exige que o pilar anterior esteja 100% concluído para acessar o pilar atual.
 * Se não estiver, redireciona para /minha-bussola e exibe toast.
 */
export function useRequirePillarAccess(slug: string) {
  const router = useRouter();
  const { data, isLoading } = trpc.workspaces.canAccessPillar.useQuery(
    { slug },
    { enabled: !!slug }
  );

  useEffect(() => {
    if (isLoading || data?.allowed !== false) return;
    const previousTitle = data.previousSlug ? PREVIOUS_TITLE_BY_SLUG[data.previousSlug] ?? data.previousSlug : "o pilar anterior";
    toast.error(`Conclua "${previousTitle}" para acessar este módulo.`);
    router.replace("/minha-bussola");
  }, [data?.allowed, data?.previousSlug, isLoading, router]);

  return { allowed: data?.allowed ?? true, isLoading };
}
