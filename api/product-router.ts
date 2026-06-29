import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products, reviews, categories, brands } from "@db/schema";
import { eq, and, or, ilike, like, gte, lte, ne, desc, sql } from "drizzle-orm";

export const productRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        categoryId: z.number().optional(),
        brandId: z.number().optional(),
        search: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        isPopular: z.boolean().optional(),
        isNew: z.boolean().optional(),
        page: z.number().default(1),
        limit: z.number().default(24),
        sort: z.enum(["price_asc", "price_desc", "newest", "popular", "rating"]).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 24;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (input?.categoryId) conditions.push(eq(products.categoryId, input.categoryId));
      if (input?.brandId) conditions.push(eq(products.brandId, input.brandId));
      if (input?.minPrice) conditions.push(gte(products.price, input.minPrice.toString()));
      if (input?.maxPrice) conditions.push(lte(products.price, input.maxPrice.toString()));
      if (input?.isPopular) conditions.push(eq(products.isPopular, "yes"));
      if (input?.isNew) conditions.push(eq(products.isNew, "yes"));
      
      if (input?.search) {
        const searchPattern = `%${input.search}%`;
        conditions.push(
          sql`(${products.nameRu} ILIKE ${searchPattern} OR ${products.nameAz} ILIKE ${searchPattern} OR ${products.nameEn} ILIKE ${searchPattern} OR ${products.sku} ILIKE ${searchPattern})`
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      let orderBy: any[] = [desc(products.sortOrder), desc(products.id)];
      if (input?.sort === "price_asc") {
        orderBy = [sql`CAST(${products.price} AS NUMERIC) ASC`];
      } else if (input?.sort === "price_desc") {
        orderBy = [sql`CAST(${products.price} AS NUMERIC) DESC`];
      } else if (input?.sort === "newest") {
        orderBy = [desc(products.createdAt)];
      } else if (input?.sort === "popular") {
        orderBy = [desc(products.isPopular), desc(products.sortOrder)];
      } else if (input?.sort === "rating") {
        orderBy = [sql`CAST(${products.rating} AS NUMERIC) DESC`, desc(products.reviewCount)];
      }

      const items = await db
        .select({
          id: products.id,
          slug: products.slug,
          sku: products.sku,
          nameAz: products.nameAz,
          nameRu: products.nameRu,
          nameEn: products.nameEn,
          descriptionAz: products.descriptionAz,
          descriptionRu: products.descriptionRu,
          descriptionEn: products.descriptionEn,
          price: products.price,
          oldPrice: products.oldPrice,
          images: products.images,
          rating: products.rating,
          reviewCount: products.reviewCount,
          isPopular: products.isPopular,
          isNew: products.isNew,
          categoryId: products.categoryId,
          categoryNameAz: categories.nameAz,
          categoryNameRu: categories.nameRu,
          categoryNameEn: categories.nameEn,
          brandId: products.brandId,
          brandName: brands.name,
          brandLogoUrl: brands.logoUrl,
          stock: products.stock,
          stockQuantity: products.stockQuantity,
          viewsCount: products.viewsCount,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(brands, eq(products.brandId, brands.id))
        .where(where)
        .orderBy(...orderBy)
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(where);

      const total = Number(countResult[0]?.count || 0);

      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  bySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      try {
        const db = getDb();
        const result = await db
          .select()
          .from(products)
          .where(eq(products.slug, input.slug))
          .limit(1);

        if (result.length === 0) return null;

        const product = result[0];

        // Increment view count
        await db
          .update(products)
          .set({ viewsCount: sql`${products.viewsCount} + 1` })
          .where(eq(products.id, product.id));

        // Safe fetch category
        let category = null;
        if (product.categoryId) {
          const catRes = await db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1);
          category = catRes[0] || null;
        }

        // Safe fetch brand
        let brand = null;
        if (product.brandId) {
          const brandRes = await db.select().from(brands).where(eq(brands.id, product.brandId)).limit(1);
          brand = brandRes[0] || null;
        }

        // Safe fetch reviews
        let productReviews: any[] = [];
        try {
          productReviews = await db
            .select()
            .from(reviews)
            .where(eq(reviews.productId, product.id))
            .orderBy(desc(reviews.createdAt));
        } catch (e) {
          console.error("Error fetching reviews:", e);
        }

        return {
          ...product,
          category,
          brand,
          reviews: productReviews,
        };
      } catch (error) {
        console.error("Error in bySlug query:", error);
        throw error;
      }
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(products)
        .where(eq(products.id, input.id))
        .limit(1);
      return result[0] || null;
    }),

  related: publicQuery
    .input(z.object({ productId: z.number(), limit: z.number().default(4) }))
    .query(async ({ input }) => {
      const db = getDb();
      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, input.productId))
        .limit(1);

      if (product.length === 0 || !product[0].categoryId) return [];

      const related = await db
        .select({
          id: products.id,
          slug: products.slug,
          nameAz: products.nameAz,
          nameRu: products.nameRu,
          nameEn: products.nameEn,
          price: products.price,
          images: products.images,
          rating: products.rating,
          reviewCount: products.reviewCount,
          isPopular: products.isPopular,
        })
        .from(products)
        .where(
          and(
            eq(products.categoryId, product[0].categoryId),
            ne(products.id, input.productId)
          )
        )
        .limit(input.limit);

      return related;
    }),

  search: publicQuery
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const searchPattern = `%${input.query}%`;
      return db
        .select({
          id: products.id,
          slug: products.slug,
          nameAz: products.nameAz,
          nameRu: products.nameRu,
          nameEn: products.nameEn,
          price: products.price,
          images: products.images,
          stockQuantity: products.stockQuantity,
        })
        .from(products)
        .where(
          or(
            ilike(products.nameRu, searchPattern),
            ilike(products.nameAz, searchPattern),
            ilike(products.nameEn, searchPattern),
            ilike(products.descriptionRu, searchPattern),
            ilike(products.sku, searchPattern)
          )
        )
        .limit(7);
    }),

  create: adminQuery
    .input(z.object({
      sku: z.string(),
      nameAz: z.string(),
      nameRu: z.string(),
      nameEn: z.string(),
      descriptionAz: z.string().optional(),
      descriptionRu: z.string().optional(),
      descriptionEn: z.string().optional(),
      price: z.string(),
      oldPrice: z.string().optional(),
      stock: z.number().default(0),
      stockQuantity: z.number().default(0),
      categoryId: z.number(),
      brandId: z.number(),
      images: z.array(z.string()).optional(),
      isPopular: z.enum(["yes", "no"]).default("no"),
      isNew: z.enum(["yes", "no"]).default("no"),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      
      const transliterate = (text: string) => {
        const map: Record<string, string> = {
          'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ы':'y','э':'e','ю':'yu','я':'ya','ә':'ae','ü':'u','ö':'o','ı':'i','ş':'sh','ç':'ch'
        };
        return text.toLowerCase().split('').map(char => map[char] || char).join('');
      };

      // Sanitize: transliterate, remove all non-alphanumeric (including / \ . , etc)
      let baseSlug = transliterate(input.nameEn || input.nameRu || input.nameAz)
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .substring(0, 80); // limit length
      
      if (!baseSlug) baseSlug = "product";
      
      const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;

      return db.insert(products).values({
        ...input,
        slug,
      });
    }),

  update: adminQuery
    .input(z.object({
      id: z.number(),
      sku: z.string().optional(),
      nameAz: z.string().optional(),
      nameRu: z.string().optional(),
      nameEn: z.string().optional(),
      descriptionAz: z.string().optional(),
      descriptionRu: z.string().optional(),
      descriptionEn: z.string().optional(),
      price: z.string().optional(),
      oldPrice: z.string().optional(),
      stock: z.number().optional(),
      stockQuantity: z.number().optional(),
      categoryId: z.number().optional(),
      brandId: z.number().optional(),
      images: z.array(z.string()).optional(),
      isPopular: z.enum(["yes", "no"]).optional(),
      isNew: z.enum(["yes", "no"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      return db.update(products).set({
        ...data,
        updatedAt: new Date(),
      }).where(eq(products.id, id));
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      return db.delete(products).where(eq(products.id, input.id));
    }),
});
