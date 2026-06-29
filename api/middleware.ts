import { ErrorMessages } from "@contracts/constants";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import * as cookie from "cookie";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

const ADMIN_CODE = "suka552577";

const requireAdmin = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  
  // 1. Check if user is logged in as admin
  if (ctx.user?.role === "admin") {
    return next({ ctx });
  }

  // 2. Fallback to old admin code check
  const cookies = cookie.parse(ctx.req.headers.get("cookie") || "");
  const adminCode = cookies["admin_session"];

  if (adminCode !== ADMIN_CODE) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.insufficientRole,
    });
  }

  return next({ ctx });
});

export const authedQuery = t.procedure; // For now, let's keep it simple
export const adminQuery = t.procedure.use(requireAdmin);
