import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { orders, orderItems, cartItems, products } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const orderRouter = createRouter({
  create: publicQuery
    .input(
      z.object({
        sessionId: z.string(),
        shippingName: z.string().min(1),
        shippingPhone: z.string().min(1),
        shippingEmail: z.string().email().optional(),
        shippingAddress: z.string().min(1),
        shippingCity: z.string().min(1),
        shippingRegion: z.string().optional(),
        paymentMethod: z.enum(["online", "cash"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user?.id;

      const cart = await db
        .select({
          id: cartItems.id,
          quantity: cartItems.quantity,
          productId: cartItems.productId,
          productName: products.nameEn,
          productImage: products.images,
          productPrice: products.price,
        })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .where(userId ? eq(cartItems.userId, userId) : eq(cartItems.sessionId, input.sessionId));

      if (cart.length === 0) {
        throw new Error("Cart is empty");
      }

      const totalAmount = cart.reduce(
        (sum, item) => sum + parseFloat(item.productPrice || "0") * item.quantity,
        0
      );

      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

      const [order] = await db
        .insert(orders)
        .values({
          orderNumber,
          userId: userId || null,
          sessionId: input.sessionId,
          status: "pending",
          paymentMethod: input.paymentMethod,
          paymentStatus: "pending",
          totalAmount: totalAmount.toFixed(2),
          shippingName: input.shippingName,
          shippingPhone: input.shippingPhone,
          shippingEmail: input.shippingEmail,
          shippingAddress: input.shippingAddress,
          shippingCity: input.shippingCity,
          shippingRegion: input.shippingRegion,
          notes: input.notes,
        })
        .returning();

      const orderId = order.id;

      for (const item of cart) {
        await db.insert(orderItems).values({
          orderId,
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage?.[0] || null,
          quantity: item.quantity,
          unitPrice: item.productPrice,
          totalPrice: (parseFloat(item.productPrice || "0") * item.quantity).toFixed(2),
        });
      }

      await db.delete(cartItems).where(userId ? eq(cartItems.userId, userId) : eq(cartItems.sessionId, input.sessionId));

      return { success: true, orderId, orderNumber };
    }),

  getOrders: publicQuery
    .input(z.object({ sessionId: z.string() }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user?.id;
      const sessionId = input?.sessionId || "";

      const result = await db
        .select()
        .from(orders)
        .where(userId ? eq(orders.userId, userId) : eq(orders.sessionId, sessionId))
        .orderBy(desc(orders.createdAt));
      return result;
    }),

  getOrderDetails: publicQuery
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.orderId))
        .limit(1);

      if (order.length === 0) return null;

      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, input.orderId));

      return { ...order[0], items };
    }),

  listAll: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }),

  updateStatus: adminQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
      paymentStatus: z.enum(["pending", "paid", "failed"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      return db.update(orders).set(data).where(eq(orders.id, id));
    }),
});
