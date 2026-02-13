"use client";

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { trpc } from "@/lib/trpc";
import { 
  Compass, CheckCircle2, Circle, PlayCircle, FileText, 
  CheckSquare, Download, Loader2, ArrowLeft, Lock 
} from "lucide-react";
import Link from "next/link";
import { getLoginUrl } from "@/const";

export default function Module({ slug }: { slug: string }) {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { data: module, isLoading: moduleLoading } = trpc.modules.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const { data: tree, isLoading: treeLoading } = trpc.sections.listTreeByModule.useQuery(
    { moduleId: module?.id || 0 },
    { enabled: !!module?.id }
  );

  const { data: moduleProgress } = trpc.modules.getProgress.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (authLoading || moduleLoading || treeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Módulo não encontrado</h2>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>Faça login para acessar este módulo</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = moduleProgress?.find(p => p.moduleId === module.id);
  const isLocked = progress?.status === "locked";

  if (isLocked) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-white">
          <div className="container py-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </header>

        <main className="container py-16">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Lock className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold">Módulo Bloqueado</h1>
            <p className="text-lg text-muted-foreground">
              Complete o módulo anterior para desbloquear <strong>{module.title}</strong>
            </p>
            <Link href="/">
              <Button>Voltar ao Dashboard</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video": return <PlayCircle className="w-5 h-5" />;
      case "text": return <FileText className="w-5 h-5" />;
      case "exercise": return <CheckSquare className="w-5 h-5" />;
      case "checklist": return <CheckCircle2 className="w-5 h-5" />;
      case "template": return <Download className="w-5 h-5" />;
      default: return <Circle className="w-5 h-5" />;
    }
  };

  const getContentTypeName = (type: string) => {
    const names: Record<string, string> = {
      video: "Vídeo",
      text: "Leitura",
      exercise: "Exercício",
      checklist: "Checklist",
      template: "Template",
    };
    return names[type] || type;
  };

  type SectionNode = {
    section: {
      id: number;
      title: string;
      orderIndex: number;
      parentSectionId: number | null;
    };
    lessons: Array<{
      id: number;
      title: string;
      description: string | null;
      contentType: string;
      durationMinutes: number | null;
    }>;
    children: SectionNode[];
  };

  const renderLessons = (lessons: SectionNode["lessons"], prefix?: string) => {
    if (!lessons.length) return null;
    return (
      <div className="space-y-2">
        {lessons.map((lesson, idx) => (
          <Link key={lesson.id} href={`/licao/${lesson.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="py-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {getContentIcon(lesson.contentType)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-base mb-1">
                          {prefix ? `${prefix}.${idx + 1}` : idx + 1}. {lesson.title}
                        </CardTitle>
                        {lesson.description ? (
                          <CardDescription>{lesson.description}</CardDescription>
                        ) : null}
                      </div>

                      <div className="flex-shrink-0 flex flex-col items-end gap-2">
                        <Badge variant="secondary">{getContentTypeName(lesson.contentType)}</Badge>
                        {lesson.durationMinutes ? (
                          <span className="text-xs text-muted-foreground">
                            {lesson.durationMinutes} min
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    );
  };

  const SectionTree = ({ nodes, level, prefix }: { nodes: SectionNode[]; level: number; prefix: string }) => {
    if (!nodes.length) return null;
    return (
      <Accordion type="multiple" className={level === 0 ? "border rounded-lg" : ""}>
        {nodes.map((node, idx) => {
          const sectionPrefix = prefix ? `${prefix}.${idx + 1}` : String(idx + 1);
          const lessonsCount = node.lessons?.length ?? 0;
          const childCount = node.children?.length ?? 0;

          return (
            <AccordionItem key={node.section.id} value={`${level}-${node.section.id}`}>
              <AccordionTrigger className="px-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">
                        {sectionPrefix}. {node.section.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {lessonsCount} lição(ões){childCount ? ` • ${childCount} subseção(ões)` : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <div className="space-y-4">
                  {renderLessons(node.lessons ?? [], sectionPrefix)}
                  {node.children?.length ? (
                    <div className="pl-4 border-l">
                      <SectionTree nodes={node.children} level={level + 1} prefix={sectionPrefix} />
                    </div>
                  ) : null}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-10 h-10 rounded-lg gradient-${slug} flex items-center justify-center text-white`}>
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{module.title}</h1>
                <p className="text-sm text-muted-foreground">{module.description}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-4xl">
        {/* Progress Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Progresso do Módulo</span>
              <span className="text-xl font-bold text-primary">{progress?.progressPercentage || 0}%</span>
            </div>
            <Progress value={progress?.progressPercentage || 0} className="h-3" />
          </CardContent>
        </Card>

        {/* Lessons/Sections Tree */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Lições</h2>
          
          {tree?.rootLessons?.length ? (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-muted-foreground">Sem seção</div>
              {renderLessons(tree.rootLessons as any)}
            </div>
          ) : null}

          {tree?.roots?.length ? (
            <SectionTree nodes={tree.roots as any} level={0} prefix="" />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>Nenhuma lição disponível neste módulo ainda.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
