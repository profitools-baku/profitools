import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { settings } from "@db/schema";
import { eq } from "drizzle-orm";

export const settingsRouter = createRouter({
  getAll: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(settings);
  }),

  updateMany: adminQuery
    .input(
      z.array(
        z.object({
          key: z.string(),
          value: z.string(),
        })
      )
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      for (const item of input) {
        const existing = await db
          .select()
          .from(settings)
          .where(eq(settings.key, item.key))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(settings)
            .set({ value: item.value, updatedAt: new Date() })
            .where(eq(settings.key, item.key));
        } else {
          await db.insert(settings).values({
            key: item.key,
            value: item.value,
          });
        }
      }
      return { success: true };
    }),
});
