import { getDb } from "./api/queries/connection";
import { brands } from "./db/schema";

async function main() {
  const db = getDb();
  const allBrands = await db.select().from(brands);
  console.log("Brands:");
  for (const brand of allBrands) {
    console.log(`- ID: ${brand.id}, Name: ${brand.name}, Logo: ${brand.logoUrl}`);
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
