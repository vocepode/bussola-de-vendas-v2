import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../../../server/routers";
import { createContext } from "../../../../server/_core/context";

// Garante execução em runtime Node (necessário por usar bcrypt/postgres) e sem SSG.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => createContext({ req }),
  });

export { handler as GET, handler as POST };
