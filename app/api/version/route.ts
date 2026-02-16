import { NextResponse } from "next/server";

/** Rota para confirmar que o deploy é o novo dashboard (sidebar, Minha Bússola, etc.). */
export async function GET() {
  return NextResponse.json({
    version: "dashboard-v2",
    hasSidebar: true,
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
}
