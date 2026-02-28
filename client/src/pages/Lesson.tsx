"use client";

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { NotionBlocksRenderer } from "@/components/notion/NotionBlocksRenderer";
import { 
  ArrowLeft, CheckCircle2, Loader2, Send, FileUp, Pencil
} from "lucide-react";
import Link from "next/link";
import { getLoginUrl } from "@/const";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { clearDraft, loadDraft, saveDraft } from "@/lib/draftStorage";
import { useUnsavedChangesProtection } from "@/hooks/useUnsavedChangesProtection";

export default function Lesson({ id }: { id: string }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const lessonId = parseInt(id || "0");
  const draftKey = lessonId > 0 ? `draft:lesson-page:${lessonId}` : null;

  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [fileUrl, setFileUrl] = useState("");

  const { data: lesson, isLoading: lessonLoading } = trpc.lessons.getById.useQuery(
    { lessonId },
    { enabled: lessonId > 0 }
  );

  const { data: exercises } = trpc.exercises.listByLesson.useQuery(
    { lessonId },
    { enabled: lessonId > 0 && isAuthenticated }
  );

  const { data: lessonProgress } = trpc.lessons.getProgress.useQuery(
    { lessonId },
    { enabled: lessonId > 0 && isAuthenticated }
  );

  const markProgress = trpc.lessons.markProgress.useMutation({
    onSuccess: () => {
      toast.success("Progresso atualizado!");
    },
  });

  const submitExercise = trpc.exercises.submit.useMutation({
    onSuccess: () => {
      toast.success("Exercício enviado com sucesso!");
      setAnswer("");
      setSelectedOption("");
      setFileUrl("");
      if (draftKey) clearDraft(draftKey);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar exercício");
    },
  });

  const handleMarkComplete = async () => {
    await markProgress.mutateAsync({
      lessonId,
      status: "completed",
    });
  };

  const handleReopenLesson = async () => {
    await markProgress.mutateAsync({
      lessonId,
      status: "in_progress",
    });
    toast.success("Edição liberada. Ajuste suas respostas e conclua novamente.");
  };

  const handleSubmitExercise = async (exerciseId: number, type: string) => {
    if (type === "text" && !answer.trim()) {
      toast.error("Por favor, escreva sua resposta");
      return;
    }

    if (type === "multiple_choice" && !selectedOption) {
      toast.error("Por favor, selecione uma opção");
      return;
    }

    if (type === "file_upload" && !fileUrl) {
      toast.error("Por favor, faça upload de um arquivo");
      return;
    }

    await submitExercise.mutateAsync({
      exerciseId,
      answer: type === "multiple_choice" ? selectedOption : answer,
      fileUrl: type === "file_upload" ? fileUrl : undefined,
    });
  };

  useEffect(() => {
    if (!draftKey) return;
    const draft = loadDraft<{ answer: string; selectedOption: string; fileUrl: string }>(draftKey);
    if (!draft?.data) return;
    setAnswer(draft.data.answer ?? "");
    setSelectedOption(draft.data.selectedOption ?? "");
    setFileUrl(draft.data.fileUrl ?? "");
  }, [draftKey]);

  useEffect(() => {
    if (!draftKey) return;
    if (!answer && !selectedOption && !fileUrl) {
      clearDraft(draftKey);
      return;
    }
    saveDraft(draftKey, { answer, selectedOption, fileUrl });
  }, [answer, draftKey, fileUrl, selectedOption]);

  useUnsavedChangesProtection({
    enabled: !!draftKey,
    hasUnsavedChanges:
      !!answer.trim() ||
      !!selectedOption ||
      !!fileUrl ||
      submitExercise.isPending,
    onFlush: () => {
      if (!draftKey) return;
      if (!answer && !selectedOption && !fileUrl) return;
      saveDraft(draftKey, { answer, selectedOption, fileUrl });
    },
  });

  if (authLoading || lessonLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Lição não encontrada</h2>
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
            <CardDescription>Faça login para acessar esta lição</CardDescription>
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

  const isCompleted = lessonProgress?.status === "completed";
  const contentBlocks = (lesson as any)?.contentBlocks;
  const hasBlocks = Array.isArray(contentBlocks) && contentBlocks.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            {isCompleted && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Concluído</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReopenLesson}
                  disabled={markProgress.isPending}
                  className="gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Editar respostas
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-4xl space-y-8">
        {/* Lesson Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-lg text-muted-foreground">{lesson.description}</p>
          )}
        </div>

        {/* Video Content */}
        {lesson.contentType === "video" && lesson.videoUrl && (
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video w-full">
                <iframe
                  src={lesson.videoUrl}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Text Content */}
        {lesson.contentType === "text" && (hasBlocks || lesson.content) && (
          <Card>
            <CardContent className="pt-6">
              {hasBlocks ? (
                <NotionBlocksRenderer blocks={contentBlocks} />
              ) : lesson.content ? (
                <div className="prose prose-slate max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Checklist Content */}
        {lesson.contentType === "checklist" && lesson.content && (
          <Card>
            <CardHeader>
              <CardTitle>Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  try {
                    const parsed = JSON.parse(lesson.content ?? "{}") as { items?: string[] };
                    return (parsed.items ?? []).map((item: string, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                        <span>{item}</span>
                      </div>
                    ));
                  } catch {
                    return (
                      <div className="text-sm text-muted-foreground">
                        Checklist em formato inválido.
                      </div>
                    );
                  }
                })()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exercises */}
        {exercises && exercises.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Exercícios</h2>
            
            {exercises.map((exercise) => (
              <Card key={exercise.id}>
                <CardHeader>
                  <CardTitle>{exercise.title}</CardTitle>
                  {exercise.description && (
                    <CardDescription>{exercise.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {exercise.instructions && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-900">{exercise.instructions}</p>
                    </div>
                  )}

                  {/* Text Exercise */}
                  {exercise.exerciseType === "text" && (
                    <div className="space-y-3">
                      <Label htmlFor={`answer-${exercise.id}`}>Sua Resposta</Label>
                      <Textarea
                        id={`answer-${exercise.id}`}
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Digite sua resposta aqui..."
                        rows={6}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        {answer.split(/\s+/).filter(Boolean).length} palavras
                      </p>
                    </div>
                  )}

                  {/* Multiple Choice Exercise */}
                  {exercise.exerciseType === "multiple_choice" && exercise.config && (
                    <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                      <div className="space-y-3">
                        {(exercise.config as { options?: string[] }).options?.map((option, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                            <RadioGroupItem value={index.toString()} id={`option-${exercise.id}-${index}`} />
                            <Label htmlFor={`option-${exercise.id}-${index}`} className="flex-1 cursor-pointer">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}

                  {/* File Upload Exercise */}
                  {exercise.exerciseType === "file_upload" && (
                    <div className="space-y-3">
                      <Label htmlFor={`file-${exercise.id}`}>Upload de Arquivo</Label>
                      <div className="flex gap-2">
                        <Input
                          id={`file-${exercise.id}`}
                          type="text"
                          value={fileUrl}
                          onChange={(e) => setFileUrl(e.target.value)}
                          placeholder="Cole a URL do arquivo aqui..."
                          className="flex-1"
                        />
                        <Button variant="outline" size="icon">
                          <FileUp className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Faça upload do arquivo e cole a URL acima
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => handleSubmitExercise(exercise.id, exercise.exerciseType)}
                    disabled={submitExercise.isPending}
                    className="w-full"
                  >
                    {submitExercise.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Resposta
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Mark Complete Button */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">{isCompleted ? "Edição de Respostas" : "Concluir Lição"}</h3>
                <p className="text-sm text-muted-foreground">
                  {isCompleted
                    ? "Reabra para ajustar respostas sem refazer tudo."
                    : "Marque como concluída para avançar no módulo"}
                </p>
              </div>
              {isCompleted ? (
                <Button
                  variant="outline"
                  onClick={handleReopenLesson}
                  disabled={markProgress.isPending}
                  size="lg"
                  className="gap-2"
                >
                  {markProgress.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Pencil className="w-4 h-4" />
                  )}
                  Editar respostas
                </Button>
              ) : (
                <Button
                  onClick={handleMarkComplete}
                  disabled={markProgress.isPending}
                  size="lg"
                >
                  {markProgress.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Concluir
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
