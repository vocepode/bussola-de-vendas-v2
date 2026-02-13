import type { User } from "../../drizzle/schema";
import { COOKIE_NAME } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import * as db from "../db";

export type TrpcContext = {
  req: Request;
  user: User | null;
};

export async function createContext(
  opts: { req: Request }
): Promise<TrpcContext> {
  const cookieHeader = opts.req.headers.get("cookie") ?? undefined;
  const cookies = cookieHeader ? parseCookieHeader(cookieHeader) : {};
  const token = cookies[COOKIE_NAME];
  const user = await (async () => {
    if (!token) return null;
    try {
      return await db.getUserBySessionToken(token);
    } catch (error) {
      // Se o banco estiver temporariamente indisponível, não derruba o app inteiro com 500 em /auth.me.
      console.warn("[auth] Falha ao resolver sessão:", error);
      return null;
    }
  })();

  return {
    req: opts.req,
    user,
  };
}
