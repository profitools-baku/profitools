import { createRouter, adminQuery } from "./middleware";
import { getDb as getDbConnection } from "./queries/connection";
import { users, brands, products } from "@db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const adminRouter = createRouter({
  getUsers: adminQuery.query(async ({ ctx }) => {
    const db = getDbConnection();
    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        lastSignInAt: users.lastSignInAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
  }),

  getStats: adminQuery.query(async () => {
    const db = getDbConnection();
    
    // Top 5 brands by total views of their products
    const brandStats = await db
      .select({
        name: brands.name,
        totalViews: sql<number>`SUM(${products.viewsCount})`,
      })
      .from(products)
      .innerJoin(brands, eq(products.brandId, brands.id))
      .groupBy(brands.id, brands.name)
      .orderBy(desc(sql`SUM(${products.viewsCount})`))
      .limit(5);

    return {
      topBrands: brandStats,
    };
  }),
});
