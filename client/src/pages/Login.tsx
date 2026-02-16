"use client";

import { LoginForm } from "@/components/ui/login-form";
import ShaderBackground from "@/components/ui/shader-background";

export default function Login() {
  return (
    <main className="relative min-h-[100svh] w-screen overflow-hidden bg-black">
      <ShaderBackground />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-black/25" />

      <div className="relative z-10 grid min-h-[100svh] grid-cols-1 lg:grid-cols-3">
        <section className="relative hidden min-h-screen lg:col-span-2 lg:block">
          <div className="absolute inset-0 z-[2] bg-black/35" />
          <div className="absolute inset-0 z-10 flex items-center justify-center px-12">
            <div className="mt-14 flex items-center gap-7">
              <img
                src="/logos/compass-white.svg"
                alt="Compass"
                className="h-auto w-64 max-w-[28vw]"
              />
              <div className="h-14 w-px bg-white/75" />
              <div
                className="space-y-0 text-white/95"
                style={{
                  fontFamily: '"Helvetica Now Display", Helvetica, Arial, sans-serif',
                  letterSpacing: "-0.044em",
                  lineHeight: 1.4,
                }}
              >
                <p className="text-[23px] font-normal">Bússola de vendas</p>
                <p className="text-[23px] font-normal">Sistema de Implementação</p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 flex min-h-[100svh] items-start justify-center px-4 pb-8 pt-28 lg:col-span-1 lg:min-h-screen lg:items-center lg:border-l lg:border-white/10 lg:bg-violet-900/60 lg:px-7 lg:py-10">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-white/[0.02] to-violet-950/35" />
          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-violet-200/25 bg-violet-950/45 px-4 pb-4 pt-5 shadow-2xl backdrop-blur-sm lg:max-w-xl lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            <div className="hidden -mx-5 -mt-5 mb-5 border-b border-white/10 bg-transparent px-5 py-5 text-center lg:-mx-0 lg:-mt-0 lg:mb-7 lg:block lg:px-0 lg:py-3">
              <img
                src="/logos/vocepode-white.svg"
                alt="VocêPode"
                className="mx-auto h-auto w-28 lg:w-40"
              />
            </div>

            <div className="mb-3 space-y-1 text-center lg:hidden">
              <img
                src="/logos/compass-white.svg"
                alt="Compass"
                className="mx-auto h-auto w-36"
              />
              <p className="text-xs text-white/90">Bússola de vendas</p>
              <p className="text-xs text-white/90">Sistema de Implementação</p>
              <div className="mx-auto mt-3 h-px w-16 bg-white/20" />
              <img
                src="/logos/vocepode-white.svg"
                alt="VocêPode"
                className="mx-auto mt-3 h-auto w-20 opacity-90"
              />
            </div>

            <div className="mx-auto w-full max-w-sm pb-0.5 lg:max-w-lg">
              <div className="rounded-xl bg-violet-950/20 p-1.5 lg:bg-transparent lg:p-0">
                <LoginForm />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
