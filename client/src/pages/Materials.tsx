"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { GuideCard } from "@/components/GuideCard";
import { GUIDES } from "@/constants/guides";
import { useTheme } from "@/contexts/ThemeContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ExternalLink, FolderOpen } from "lucide-react";

export default function MaterialsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { data: resources, isLoading } = trpc.resources.listByModule.useQuery({ moduleId: null });

  return (
    <DashboardLayout>
      <div className="content-inner materials-inner mx-auto w-full max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Meus Materiais</h1>
          <p className="text-sm text-muted-foreground">Acesse seus recursos de apoio, templates e links úteis</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Guias de uso</h2>
          <p className="text-sm text-muted-foreground">Guias do aluno para cada pilar da bússola</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {GUIDES.map((guide) => (
              <GuideCard
                key={guide.id}
                title={guide.title}
                href={guide.href}
                cover={guide.cover}
                dark={isDark}
              />
            ))}
          </div>
        </section>

        {isLoading ? (
          <Card className="border-[#262626] bg-[#161616] p-6 text-sm text-white/65">Carregando materiais...</Card>
        ) : null}

        {!isLoading && (!resources || resources.length === 0) ? (
          <Card className="border-[#262626] bg-[#161616] p-10 text-center">
            <FolderOpen className="mx-auto mb-3 h-6 w-6 text-white/45" />
            <p className="text-sm text-white/60">Nenhum material disponível no momento.</p>
          </Card>
        ) : null}

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Recursos por módulo</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(resources ?? []).map((resource) => (
            <Card key={resource.id} className="flex min-h-[170px] flex-col justify-between border-[#262626] bg-[#161616] p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 text-base font-semibold text-white">{resource.title}</h3>
                  <Badge className="bg-white/10 text-[11px] text-white">{resource.resourceType}</Badge>
                </div>
                <p className="line-clamp-3 text-sm text-white/60">{resource.description || "Material de apoio para acelerar sua implementação."}</p>
              </div>

              <div className="mt-4">
                {resource.url ? (
                  <a href={resource.url} target="_blank" rel="noreferrer">
                    <Button className="h-8 bg-violet-700 text-xs hover:bg-violet-600">
                      Abrir material <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </a>
                ) : (
                  <Button disabled className="h-8 text-xs">Sem link disponível</Button>
                )}
              </div>
            </Card>
          ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
