import { MUST_CHANGE_PASSWORD_ERR_MSG, NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "@shared/const";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { hasAdminPrivileges } from "../admin-access";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const MUST_CHANGE_PASSWORD_ALLOWED_PATHS = new Set([
  "auth.me",
  "auth.changePassword",
  "auth.logout",
]);

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  if (ctx.user.mustChangePassword && !MUST_CHANGE_PASSWORD_ALLOWED_PATHS.has(opts.path)) {
    throw new TRPCError({ code: "FORBIDDEN", message: MUST_CHANGE_PASSWORD_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;
    const user = ctx.user;

    if (!user || !hasAdminPrivileges(user)) {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    if (user.mustChangePassword && !MUST_CHANGE_PASSWORD_ALLOWED_PATHS.has(opts.path)) {
      throw new TRPCError({ code: "FORBIDDEN", message: MUST_CHANGE_PASSWORD_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user,
      },
    });
  }),
);
