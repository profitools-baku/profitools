import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { db } from "./queries/connection";
import { reviews, orders, orderItems, users } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";
import * as cookie from "cookie";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret");

async function getUserIdFromRequest(req: Request) {
  const cookies = cookie.parse(req.headers.get("cookie") || "");
  const token = cookies["user_session"];
  if (!token) return null;
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return parseInt(payload.sub as string);
  } catch (e) {
    return null;
  }
}

export const reviewRouter = createRouter({
  listByProduct: publicQuery
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      return await db.select()
        .from(reviews)
        .where(eq(reviews.productId, input.productId))
        .orderBy(desc(reviews.createdAt));
    }),

  canReview: publicQuery
    .input(z.object({ productId: z.number() }))
    .query(async ({ input, ctx }) => {
      const userId = await getUserIdFromRequest(ctx.req);
      if (!userId) return { allowed: false, reason: "not_logged_in" };

      // Check if user bought this product
      const userOrders = await db.select({ id: orders.id })
        .from(orders)
        .where(eq(orders.userId, userId));
      
      if (userOrders.length === 0) return { allowed: false, reason: "no_purchases" };

      const orderIds = userOrders.map(o => o.id);
      
      const purchased = await db.select()
        .from(orderItems)
        .where(and(
          eq(orderItems.productId, input.productId),
          // Check if orderId is in user's orders
          // Drizzle doesn't have a direct 'in' for arrays in where yet? 
          // Use sql or just manual check
        ));
      
      // Better way to check purchase
      const purchaseCheck = await db.select()
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(and(
          eq(orders.userId, userId),
          eq(orderItems.productId, input.productId)
        ))
        .limit(1);

      if (purchaseCheck.length === 0) return { allowed: false, reason: "not_purchased" };

      return { allowed: true };
    }),

  create: publicQuery
    .input(z.object({
      productId: z.number(),
      rating: z.number().min(1).max(5),
      comment: z.string().min(3),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = await getUserIdFromRequest(ctx.req);
      if (!userId) throw new Error("Unauthorized");

      // Verify purchase again for security
      const purchaseCheck = await db.select()
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(and(
          eq(orders.userId, userId),
          eq(orderItems.productId, input.productId)
        ))
        .limit(1);

      if (purchaseCheck.length === 0) {
        throw new Error("You must purchase the product before reviewing it");
      }

      const [user] = await db.select().from(users).where(eq(users.id, userId));

      return await db.insert(reviews).values({
        productId: input.productId,
        userId: userId,
        userName: user.name || "User",
        rating: input.rating,
        comment: input.comment,
      }).returning();
    }),
});
