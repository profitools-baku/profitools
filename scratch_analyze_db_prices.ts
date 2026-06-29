import { getDb } from "./api/queries/connection";
import { products } from "./db/schema";

async function main() {
  const db = getDb();
  const allProducts = await db.select().from(products);
  
  console.log(`Total products: ${allProducts.length}`);
  
  let zeroCount = 0;
  let malformedCount = 0;
  
  for (const p of allProducts) {
    const priceStr = p.price;
    const isZero = priceStr === "0" || parseFloat(priceStr) === 0;
    
    // Check if price has multiple dots or ends with a dot
    const hasMultipleDots = (priceStr.match(/\./g) || []).length > 1;
    const endsWithDot = priceStr.endsWith(".");
    const isMalformed = hasMultipleDots || endsWithDot;
    
    if (isZero) zeroCount++;
    if (isMalformed) malformedCount++;
    
    if (isZero || isMalformed) {
      console.log(`Product ID ${p.id} (${p.slug}): Name="${p.nameRu}", Price="${priceStr}" (Zero: ${isZero}, Malformed: ${isMalformed})`);
    }
  }
  
  console.log(`\nSummary:`);
  console.log(`Zero prices: ${zeroCount}`);
  console.log(`Malformed prices: ${malformedCount}`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
