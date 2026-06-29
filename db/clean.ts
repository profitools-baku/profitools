import { getDb } from "../api/queries/connection";
import { reviews, products, brands, categories } from "./schema";

const db = getDb();

async function clean() {
  try {
    await db.delete(reviews);
    console.log("Deleted reviews");
  } catch (e) { /* ignore */ }
  try {
    await db.delete(products);
    console.log("Deleted products");
  } catch (e) { /* ignore */ }
  try {
    await db.delete(brands);
    console.log("Deleted brands");
  } catch (e) { /* ignore */ }
  try {
    await db.delete(categories);
    console.log("Deleted categories");
  } catch (e) { /* ignore */ }
  console.log("Database cleaned");
}

clean().catch(console.error);
