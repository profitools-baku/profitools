import { authRouter } from "./auth-router";
import { productRouter } from "./product-router";
import { categoryRouter, brandRouter } from "./category-router";
import { cartRouter, wishlistRouter, comparisonRouter } from "./cart-router";
import { orderRouter } from "./order-router";
import { reviewRouter } from "./review-router";
import { adminRouter } from "./admin-router";
import { settingsRouter } from "./settings-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  product: productRouter,
  category: categoryRouter,
  brand: brandRouter,
  cart: cartRouter,
  wishlist: wishlistRouter,
  comparison: comparisonRouter,
  order: orderRouter,
  review: reviewRouter,
  admin: adminRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;

