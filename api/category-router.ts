import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { categories, brands, products } from "@db/schema";
import { eq, count, and, ne } from "drizzle-orm";

export const categoryRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    const cats = await db.select().from(categories).orderBy(categories.sortOrder);
    return cats;
  }),

  bySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, input.slug))
        .limit(1);
      return result[0] || null;
    }),

  withProductCount: publicQuery.query(async () => {
    const db = getDb();
    const cats = await db.select().from(categories).orderBy(categories.sortOrder);
    const result = [];
    for (const cat of cats) {
      const cnt = await db
        .select({ count: count() })
        .from(products)
        .where(eq(products.categoryId, cat.id));
      result.push({ ...cat, productCount: cnt[0]?.count || 0 });
    }
    return result;
  }),

  create: adminQuery
    .input(z.object({
      slug: z.string(),
      nameAz: z.string(),
      nameRu: z.string(),
      nameEn: z.string(),
      descriptionAz: z.string().optional(),
      descriptionRu: z.string().optional(),
      descriptionEn: z.string().optional(),
      image: z.string().optional(),
      sortOrder: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      return db.insert(categories).values(input);
    }),

  update: adminQuery
    .input(z.object({
      id: z.number(),
      slug: z.string().optional(),
      nameAz: z.string().optional(),
      nameRu: z.string().optional(),
      nameEn: z.string().optional(),
      descriptionAz: z.string().optional(),
      descriptionRu: z.string().optional(),
      descriptionEn: z.string().optional(),
      image: z.string().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      return db.update(categories).set(data).where(eq(categories.id, id));
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      return db.delete(categories).where(eq(categories.id, input.id));
    }),
});

export const brandRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(brands).orderBy(brands.sortOrder);
  }),

  bySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(brands)
        .where(eq(brands.slug, input.slug))
        .limit(1);
      return result[0] || null;
    }),

  withProductCount: publicQuery.query(async () => {
    const db = getDb();
    const brs = await db.select().from(brands).orderBy(brands.sortOrder);
    const result = [];
    for (const b of brs) {
      const cnt = await db
        .select({ count: count() })
        .from(products)
        .where(eq(products.brandId, b.id));
      result.push({ ...b, productCount: cnt[0]?.count || 0 });
    }
    return result;
  }),


  create: adminQuery
    .input(z.object({
      slug: z.string(),
      name: z.string(),
      logoUrl: z.string().optional(),
      descriptionAz: z.string().optional(),
      descriptionRu: z.string().optional(),
      descriptionEn: z.string().optional(),
      website: z.string().optional(),
      isNew: z.enum(["yes", "no"]).default("no"),
      sortOrder: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      return db.insert(brands).values(input);
    }),

  update: adminQuery
    .input(z.object({
      id: z.number(),
      slug: z.string().optional(),
      name: z.string().optional(),
      logoUrl: z.string().optional(),
      descriptionAz: z.string().optional(),
      descriptionRu: z.string().optional(),
      descriptionEn: z.string().optional(),
      website: z.string().optional(),
      isNew: z.enum(["yes", "no"]).optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      return db.update(brands).set(data).where(eq(brands.id, id));
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      return db.delete(brands).where(eq(brands.id, input.id));
    }),
});
