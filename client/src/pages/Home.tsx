"use client";

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Compass, ChevronDown, ListFilter, ArrowUpDown, Search, Maximize2, Loader2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

function ModuleCard(props: {
  href: string;
  title: string;
  titleNode?: ReactNode;
  subtitle: string;
  bgClassName: string;
  titleClassName?: string;
  icon?: ReactNode;
}) {
  return (
    <Link href={props.href}>
      <Card className="h-[280px] relative overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.01] bg-transparent border-0 shadow-none">
        <div className={["absolute inset-0 rounded-xl", props.bgClassName].join(" ")} />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-black/35 backdrop-blur-sm rounded-b-xl" />

        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center space-y-4">
              {props.icon ? (
                <div className="mx-auto w-14 h-14 rounded-full border border-white/20 bg-white/10 flex items-center justify-center">
                  {props.icon}
                </div>
              ) : null}
              {props.titleNode ? (
                props.titleNode
              ) : (
                <div className={["text-4xl font-black tracking-tight text-white", props.titleClassName].join(" ")}>
                  {props.title}
                </div>
              )}
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="text-xs text-white/90 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white/10 border border-white/10">
                <Compass className="w-3.5 h-3.5 text-white/90" />
              </span>
              <span className="truncate">{props.subtitle}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function MiniCard(props: { title: string; subtitle: string }) {
  return (
    <Card className="h-[180px] rounded-xl overflow-hidden border border-white/5 bg-[radial-gradient(circle_at_10%_20%,rgba(34,211,238,0.18),transparent_40%),radial-gradient(circle_at_90%_80%,rgba(168,85,247,0.18),transparent_45%),linear-gradient(135deg,#05070c_0%,#0b1220_45%,#05070c_100%)] hover:scale-[1.01] transition-transform">
      <div className="h-full relative">
        <div className="absolute inset-0 opacity-70" />
        <div className="relative z-10 h-full flex items-center justify-center px-6">
          <div className="text-center">
            <div className="text-white font-black tracking-tight text-2xl">{props.title}</div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-11 bg-black/35 backdrop-blur-sm">
          <div className="h-full px-4 flex items-center gap-2 text-xs text-white/90">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white/10 border border-white/10">
              <Compass className="w-3.5 h-3.5 text-white/90" />
            </span>
            <span className="truncate">{props.subtitle}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function HomeHeader() {
  return (
    <div className="sticky top-0 z-20 -mx-4 px-4 py-3 bg-black/40 backdrop-blur-xl border-b border-white/10">
      <div className="container flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-2 text-xs text-white/90">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10 border border-white/10">
            <Compass className="w-3.5 h-3.5" />
          </span>
          <span className="font-semibold">Bússola de vendas</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-white/80 hover:text-white hover:bg-white/10"
            aria-label="Filtrar"
          >
            <ListFilter className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-white/80 hover:text-white hover:bg-white/10"
            aria-label="Ordenar"
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-white/80 hover:text-white hover:bg-white/10"
            aria-label="Buscar"
          >
            <Search className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-white/80 hover:text-white hover:bg-white/10"
            aria-label="Expandir"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="default"
            className="h-8 px-3 text-xs font-semibold bg-blue-500 hover:bg-blue-500/90 text-white"
          >
            Nova <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) return;
    router.replace("/login");
  }, [isAuthenticated, loading, router]);

  if (!isAuthenticated && !loading) {
    return null;
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <HomeHeader />
      <main className="container py-10 space-y-10">
        {/* Cover / intro */}
        <section className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-r from-black via-slate-900 to-black">
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 10%, rgba(34, 211, 238, 0.22), transparent 35%), radial-gradient(circle at 80% 30%, rgba(168, 85, 247, 0.22), transparent 40%), radial-gradient(circle at 30% 80%, rgba(59, 130, 246, 0.18), transparent 45%)",
              }}
            />
            <div className="relative z-10 px-8 py-10">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                [{user?.name ?? "Nome do Aluno"}] Bússola de Vendas
              </div>
              <div className="mt-4 max-w-3xl text-sm text-white/70 leading-relaxed">
                A Bússola é sua principal ferramenta durante a jornada para aprender a vender através da metodologia COMPASS.
                Aqui você define estratégia, cria conteúdo e acompanha sua execução.
              </div>
            </div>
          </div>

          {/* Iniciando sua jornada */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-white/80">Iniciando sua jornada</div>
            <div className="grid md:grid-cols-2 gap-6">
              <MiniCard title="COMECE AQUI" subtitle="Comece Aqui" />
              <MiniCard title="O MÉTODO COMPASS" subtitle="Conheça o Método 🧭COMPASS" />
            </div>
          </div>
        </section>

        {/* A sua bússola para vender mais */}
        <section className="space-y-4">
          <div className="text-2xl font-extrabold tracking-tight text-cyan-300">A sua bússola para vender mais</div>

          <div className="grid md:grid-cols-2 gap-6">
            <ModuleCard
              href="/marco-zero"
              title="MARCO ZERO"
              subtitle="Marco Zero"
              icon={<Compass className="w-7 h-7 text-white/90" />}
              bgClassName="bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.35),transparent_40%),radial-gradient(circle_at_70%_20%,rgba(16,185,129,0.18),transparent_42%),radial-gradient(circle_at_50%_110%,rgba(34,211,238,0.10),transparent_55%),linear-gradient(135deg,#05070c_0%,#0b1220_55%,#05070c_100%)]"
              titleNode={
                <div className="leading-[0.9]">
                  <div className="text-5xl font-black tracking-tight text-cyan-300">MARCO</div>
                  <div className="text-5xl font-black tracking-tight text-white">ZERO</div>
                </div>
              }
            />

            <ModuleCard
              href="/norte"
              title="NORTE"
              subtitle="Estratégia | NORTE"
              icon={<Compass className="w-7 h-7 text-white/90" />}
              bgClassName="bg-[radial-gradient(circle_at_85%_10%,rgba(59,130,246,0.35),transparent_45%),radial-gradient(circle_at_30%_90%,rgba(34,211,238,0.32),transparent_50%),linear-gradient(135deg,#0b1220_0%,#0b1220_100%)]"
            />

            <ModuleCard
              href="/modulo/raio-x"
              title="RAIO-X"
              subtitle="Estratégia | RAIO-X"
              icon={<Compass className="w-7 h-7 text-white/90" />}
              bgClassName="bg-[radial-gradient(circle_at_70%_10%,rgba(168,85,247,0.35),transparent_45%),radial-gradient(circle_at_30%_90%,rgba(34,211,238,0.32),transparent_50%),linear-gradient(135deg,#0b1220_0%,#0b1220_100%)]"
            />

            <ModuleCard
              href="/modulo/mapa"
              title="MAPA"
              subtitle="Conteúdo | MAPA"
              icon={<Compass className="w-7 h-7 text-white/90" />}
              bgClassName="bg-[radial-gradient(circle_at_70%_20%,rgba(34,211,238,0.35),transparent_45%),radial-gradient(circle_at_20%_90%,rgba(59,130,246,0.32),transparent_50%),linear-gradient(135deg,#0b1220_0%,#0b1220_100%)]"
            />

            <ModuleCard
              href="/modulo/rota"
              title="ROTA"
              subtitle="Performance | ROTA"
              icon={<Compass className="w-7 h-7 text-white/90" />}
              bgClassName="bg-[radial-gradient(circle_at_20%_30%,rgba(96,165,250,0.35),transparent_45%),radial-gradient(circle_at_80%_90%,rgba(34,211,238,0.30),transparent_50%),linear-gradient(135deg,#0b1220_0%,#0b1220_100%)]"
            />
          </div>
        </section>
      </main>

      {loading ? (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
          <div className="pointer-events-none rounded-full bg-black/40 backdrop-blur-sm border border-white/10 p-4">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
