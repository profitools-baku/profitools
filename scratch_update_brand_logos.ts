import { getDb } from "./api/queries/connection";
import { brands } from "./db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const db = getDb();
  
  const updates = [
    { id: 1, logo: "/images/brands/proxxon.svg" },
    { id: 2, logo: "/images/brands/pica.svg" },
    { id: 3, logo: "/images/brands/hardy.svg" },
    { id: 4, logo: "/images/brands/jokari.svg" },
    { id: 5, logo: "/images/brands/stabila.svg" },
  ];

  for (const item of updates) {
    console.log(`Updating brand ID ${item.id} logo to: ${item.logo}`);
    await db.update(brands)
      .set({ logoUrl: item.logo })
      .where(eq(brands.id, item.id));
  }

  console.log("Brand logos successfully updated!");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
