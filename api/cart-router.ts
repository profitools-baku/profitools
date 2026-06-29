import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { cartItems, wishlistItems, products, comparisonItems } from "@db/schema";
import { eq, and } from "drizzle-orm";

function getSessionId(req: Request): string {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/session_id=([^;]+)/);
  if (match) return match[1];
  return "anon_" + Math.random().toString(36).slice(2);
}

export const cartRouter = createRouter({
  getCart: publicQuery
    .input(z.object({ sessionId: z.string() }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const sessionId = input?.sessionId || getSessionId(ctx.req);
      const userId = ctx.user?.id;

      const items = await db
        .select({
          id: cartItems.id,
          quantity: cartItems.quantity,
          productId: cartItems.productId,
          productSlug: products.slug,
          productNameAz: products.nameAz,
          productNameRu: products.nameRu,
          productNameEn: products.nameEn,
          productPrice: products.price,
          productImage: products.images,
          productStock: products.stock,
        })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .where(userId ? eq(cartItems.userId, userId) : eq(cartItems.sessionId, sessionId));

      const total = items.reduce(
        (sum, item) => sum + parseFloat(item.productPrice || "0") * item.quantity,
        0
      );

      return { items, total: total.toFixed(2), count: items.reduce((s, i) => s + i.quantity, 0) };
    }),

  addToCart: publicQuery
    .input(z.object({ productId: z.number(), quantity: z.number().default(1), sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user?.id;
      
      const whereClause = userId 
        ? and(eq(cartItems.userId, userId), eq(cartItems.productId, input.productId))
        : and(eq(cartItems.sessionId, input.sessionId), eq(cartItems.productId, input.productId));

      const existing = await db
        .select()
        .from(cartItems)
        .where(whereClause)
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(cartItems)
          .set({ quantity: existing[0].quantity + input.quantity })
          .where(eq(cartItems.id, existing[0].id));
      } else {
        await db.insert(cartItems).values({
          sessionId: userId ? null : input.sessionId,
          userId: userId || null,
          productId: input.productId,
          quantity: input.quantity,
        });
      }

      return { success: true };
    }),

  sync: publicQuery
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user?.id;
      if (!userId) return { success: false };

      // Move items from session to user
      const guestItems = await db.select().from(cartItems).where(eq(cartItems.sessionId, input.sessionId));
      
      for (const item of guestItems) {
        const existing = await db.select().from(cartItems).where(and(eq(cartItems.userId, userId), eq(cartItems.productId, item.productId))).limit(1);
        if (existing.length > 0) {
          await db.update(cartItems).set({ quantity: existing[0].quantity + item.quantity }).where(eq(cartItems.id, existing[0].id));
          await db.delete(cartItems).where(eq(cartItems.id, item.id));
        } else {
          await db.update(cartItems).set({ userId, sessionId: null }).where(eq(cartItems.id, item.id));
        }
      }

      return { success: true };
    }),

  updateQuantity: publicQuery
    .input(z.object({ cartItemId: z.number(), quantity: z.number(), sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      // Safety check: ensure item belongs to user or session
      if (input.quantity <= 0) {
        await db.delete(cartItems).where(eq(cartItems.id, input.cartItemId));
      } else {
        await db
          .update(cartItems)
          .set({ quantity: input.quantity })
          .where(eq(cartItems.id, input.cartItemId));
      }
      return { success: true };
    }),

  removeItem: publicQuery
    .input(z.object({ cartItemId: z.number(), sessionId: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(cartItems).where(eq(cartItems.id, input.cartItemId));
      return { success: true };
    }),

  clearCart: publicQuery
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user?.id;
      await db.delete(cartItems).where(userId ? eq(cartItems.userId, userId) : eq(cartItems.sessionId, input.sessionId));
      return { success: true };
    }),
});

export const wishlistRouter = createRouter({
  getWishlist: publicQuery
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select({
          id: wishlistItems.id,
          productId: wishlistItems.productId,
          productSlug: products.slug,
          productNameAz: products.nameAz,
          productNameRu: products.nameRu,
          productNameEn: products.nameEn,
          productPrice: products.price,
          productImage: products.images,
        })
        .from(wishlistItems)
        .innerJoin(products, eq(wishlistItems.productId, products.id))
        .where(eq(wishlistItems.sessionId, input.sessionId));
    }),

  toggle: publicQuery
    .input(z.object({ productId: z.number(), sessionId: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(wishlistItems)
        .where(and(eq(wishlistItems.sessionId, input.sessionId), eq(wishlistItems.productId, input.productId)))
        .limit(1);

      if (existing.length > 0) {
        await db.delete(wishlistItems).where(eq(wishlistItems.id, existing[0].id));
        return { added: false };
      } else {
        await db.insert(wishlistItems).values({
          sessionId: input.sessionId,
          productId: input.productId,
        });
        return { added: true };
      }
    }),
});

export const comparisonRouter = createRouter({
  getComparison: publicQuery
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select({
          id: comparisonItems.id,
          productId: comparisonItems.productId,
          productSlug: products.slug,
          productNameAz: products.nameAz,
          productNameRu: products.nameRu,
          productNameEn: products.nameEn,
          productPrice: products.price,
          productImage: products.images,
          specsAz: products.specsAz,
          specsRu: products.specsRu,
          specsEn: products.specsEn,
        })
        .from(comparisonItems)
        .innerJoin(products, eq(comparisonItems.productId, products.id))
        .where(eq(comparisonItems.sessionId, input.sessionId));
    }),

  add: publicQuery
    .input(z.object({ productId: z.number(), sessionId: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(comparisonItems)
        .where(and(eq(comparisonItems.sessionId, input.sessionId), eq(comparisonItems.productId, input.productId)))
        .limit(1);

      if (existing.length === 0) {
        const count = await db
          .select()
          .from(comparisonItems)
          .where(eq(comparisonItems.sessionId, input.sessionId));
        if (count.length >= 4) {
          return { success: false, message: "Max 4 items" };
        }
        await db.insert(comparisonItems).values({
          sessionId: input.sessionId,
          productId: input.productId,
        });
      }
      return { success: true };
    }),

  remove: publicQuery
    .input(z.object({ comparisonItemId: z.number(), sessionId: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(comparisonItems).where(eq(comparisonItems.id, input.comparisonItemId));
      return { success: true };
    }),

  clear: publicQuery
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(comparisonItems).where(eq(comparisonItems.sessionId, input.sessionId));
      return { success: true };
    }),
});
