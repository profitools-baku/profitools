import { getDb } from "./api/queries/connection";
import { products } from "./db/schema";

async function main() {
  const db = getDb();
  const allProducts = await db.select().from(products);
  allProducts.sort((a, b) => a.id - b.id);
  console.log("All product prices:");
  for (const p of allProducts) {
    console.log(`ID: ${p.id} | Slug: ${p.slug} | Price: ${p.price} | Name: ${p.nameRu}`);
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
