"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ExternalLink, FolderOpen } from "lucide-react";

export default function MaterialsPage() {
  const { data: resources, isLoading } = trpc.resources.listByModule.useQuery({ moduleId: null });

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <div>
          <h1 className="text-3xl font-semibold">Meus Materiais</h1>
          <p className="text-sm text-white/60">Acesse seus recursos de apoio, templates e links úteis</p>
        </div>

        {isLoading ? (
          <Card className="border-white/10 bg-[#0a0d16] p-6 text-sm text-white/65">Carregando materiais...</Card>
        ) : null}

        {!isLoading && (!resources || resources.length === 0) ? (
          <Card className="border-white/10 bg-[#0a0d16] p-10 text-center">
            <FolderOpen className="mx-auto mb-3 h-6 w-6 text-white/45" />
            <p className="text-sm text-white/60">Nenhum material disponível no momento.</p>
          </Card>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(resources ?? []).map((resource) => (
            <Card key={resource.id} className="flex min-h-[170px] flex-col justify-between border-white/10 bg-[#0a0d16] p-4">
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
      </div>
    </DashboardLayout>
  );
}
