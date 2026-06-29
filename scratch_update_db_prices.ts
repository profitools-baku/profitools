import { getDb } from "./api/queries/connection";
import { products } from "./db/schema";
import { eq } from "drizzle-orm";

const MULTIPLIER = 0.52;

async function main() {
  const db = getDb();
  const allProducts = await db.select().from(products);
  
  console.log(`Applying price multiplier ${MULTIPLIER} to ${allProducts.length} products...`);
  
  for (const p of allProducts) {
    const rawPrice = parseFloat(p.price);
    if (isNaN(rawPrice)) {
      console.warn(`Skipping product ID ${p.id} due to invalid price: ${p.price}`);
      continue;
    }
    
    const newPrice = (rawPrice * MULTIPLIER).toFixed(2);
    
    let newOldPrice: string | null = null;
    if (p.oldPrice) {
      const rawOldPrice = parseFloat(p.oldPrice);
      if (!isNaN(rawOldPrice)) {
        newOldPrice = (rawOldPrice * MULTIPLIER).toFixed(2);
      }
    }
    
    console.log(`Product ID ${p.id} (${p.slug}): Price ${p.price} -> ${newPrice} | OldPrice ${p.oldPrice || "none"} -> ${newOldPrice || "none"}`);
    
    await db.update(products)
      .set({
        price: newPrice,
        oldPrice: newOldPrice
      })
      .where(eq(products.id, p.id));
  }
  
  console.log("Product prices updated successfully!");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
