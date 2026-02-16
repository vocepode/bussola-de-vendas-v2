"use client";

import { LoginForm } from "@/components/ui/login-form";
import ShaderBackground from "@/components/ui/shader-background";

export default function Login() {
  return (
    <main className="relative min-h-screen w-screen overflow-hidden bg-black">
      <ShaderBackground />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[#060618]/26" />

      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-[2fr_1fr]">
        <section className="relative hidden min-h-screen lg:block">
          <div className="absolute inset-0 z-[2] bg-[#050513]/32" />
          <div className="absolute inset-0 z-10 flex items-center justify-center px-12">
            <div className="mt-14 flex items-center gap-7">
              <img
                src="/logos/compass-white.svg"
                alt="Compass"
                className="h-auto w-[250px] max-w-[28vw]"
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

        <section className="relative z-10 flex min-h-screen items-center justify-center p-4 lg:border-l lg:border-white/10 lg:bg-[#492374]/62 lg:px-7 lg:py-10">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_24%,rgba(33,8,60,0.35)_100%)]" />
          <div className="relative z-10 w-full max-w-[430px] rounded-[26px] border border-violet-200/25 bg-[#3c1e62]/58 p-5 shadow-[0_22px_48px_rgba(10,2,24,0.45)] backdrop-blur-[3px] lg:max-w-[480px] lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            <div className="hidden -mx-5 -mt-5 mb-5 border-b border-white/10 bg-transparent px-5 py-5 text-center lg:-mx-0 lg:-mt-0 lg:mb-7 lg:block lg:px-0 lg:py-3">
              <img
                src="/logos/vocepode-white.svg"
                alt="VocêPode"
                className="mx-auto h-auto w-[132px] lg:w-[170px]"
              />
            </div>

            <div className="mb-4 space-y-1 text-center lg:hidden">
              <img
                src="/logos/compass-white.svg"
                alt="Compass"
                className="mx-auto h-auto w-[140px]"
              />
              <p className="text-xs text-white/90">Bússola de vendas</p>
              <p className="text-xs text-white/90">Sistema de Implementação</p>
              <div className="mx-auto mt-3 h-px w-16 bg-white/20" />
              <img
                src="/logos/vocepode-white.svg"
                alt="VocêPode"
                className="mx-auto mt-3 h-auto w-[94px] opacity-90"
              />
            </div>

            <div className="mx-auto w-full max-w-[360px] pb-1 lg:max-w-[430px]">
              <div className="bg-[#371b58]/28 p-2 lg:bg-transparent lg:p-0">
                <LoginForm />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
