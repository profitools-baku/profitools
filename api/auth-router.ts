import { z } from "zod";
import * as cookie from "cookie";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { db } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as jose from "jose";
import { env } from "./lib/env";

const ADMIN_CODE = "suka552577";
const JWT_SECRET = new TextEncoder().encode(env.jwtSecret);

export const authRouter = createRouter({
  me: publicQuery.query(async ({ ctx }) => {
    return ctx.user || null;
  }),

  register: publicQuery
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(2),
    }))
    .mutation(async ({ input }) => {
      const hashedPassword = await bcrypt.hash(input.password, 10);
      try {
        const [newUser] = await db.insert(users).values({
          email: input.email,
          password: hashedPassword,
          name: input.name,
          role: "user",
          lastSignInAt: new Date(),
        }).returning();
        return { success: true, userId: newUser.id };
      } catch (e: any) {
        if (e.message.includes("unique constraint")) {
          throw new Error("Email already registered");
        }
        throw e;
      }
    }),
  
  login: publicQuery
    .input(z.object({ 
      email: z.string().email(),
      password: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Admin backdoor
      if (input.email === "admin@zendor.tools" && input.password === ADMIN_CODE) {
        ctx.resHeaders.append(
          "set-cookie",
          cookie.serialize("admin_session", ADMIN_CODE, {
            httpOnly: true,
            path: "/",
            sameSite: "lax",
            maxAge: 365 * 24 * 60 * 60,
          })
        );
        return { success: true, role: "admin" };
      }

      const [user] = await db.select().from(users).where(eq(users.email, input.email));
      if (!user || !user.password) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      const valid = await bcrypt.compare(input.password, user.password);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      const token = await new jose.SignJWT({ sub: user.id.toString(), role: user.role })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(JWT_SECRET);

      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize("user_session", token, {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60,
        })
      );
      
      return { success: true, role: user.role };
    }),

  logout: publicQuery.mutation(async ({ ctx }) => {
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize("admin_session", "", { httpOnly: true, path: "/", maxAge: 0 })
    );
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize("user_session", "", { httpOnly: true, path: "/", maxAge: 0 })
    );
    return { success: true };
  }),
});
