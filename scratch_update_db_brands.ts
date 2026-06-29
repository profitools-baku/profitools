import { getDb } from "./api/queries/connection";
import { brands } from "./db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const db = getDb();
  
  const updates = [
    { slug: "proxxon", logoUrl: "/images/brands/proxxon.jpg" },
    { slug: "pica", logoUrl: "/images/brands/pica.jpg" },
    { slug: "hardy", logoUrl: "/images/brands/hardy.jpg" },
    { slug: "jokari", logoUrl: "/images/brands/jokari.jpg" },
    { slug: "stabila", logoUrl: "/images/brands/stabila.png" },
  ];
  
  for (const item of updates) {
    console.log(`Updating brand: ${item.slug} -> ${item.logoUrl}`);
    await db.update(brands)
      .set({ logoUrl: item.logoUrl })
      .where(eq(brands.slug, item.slug));
  }
  
  console.log("Brand logos updated successfully!");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
