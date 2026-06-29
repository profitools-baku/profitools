import {
  pgTable,
  text,
  integer,
  timestamp,
  jsonb,
  serial,
  numeric,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ── Users (OAuth) ────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: text("unionId"),
  password: text("password"),
  name: text("name"),
  email: text("email").notNull().unique(),
  avatar: text("avatar"),
  role: text("role").default("user").notNull(), // enum ["user", "admin"]
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignInAt: timestamp("last_signin_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Categories ───────────────────────────────────────────────
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameAz: text("name_az").notNull(),
  nameRu: text("name_ru").notNull(),
  nameEn: text("name_en").notNull(),
  descriptionAz: text("description_az"),
  descriptionRu: text("description_ru"),
  descriptionEn: text("description_en"),
  image: text("image"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;

// ── Brands ───────────────────────────────────────────────────
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  descriptionAz: text("description_az"),
  descriptionRu: text("description_ru"),
  descriptionEn: text("description_en"),
  website: text("website"),
  isNew: text("is_new").default("no").notNull(), // "yes", "no"
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Brand = typeof brands.$inferSelect;

// ── Products ─────────────────────────────────────────────────
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  sku: text("sku").notNull().unique(),
  nameAz: text("name_az").notNull(),
  nameRu: text("name_ru").notNull(),
  nameEn: text("name_en").notNull(),
  descriptionAz: text("description_az"),
  descriptionRu: text("description_ru"),
  descriptionEn: text("description_en"),
  specsAz: jsonb("specs_az").$type<Record<string, string>>(),
  specsRu: jsonb("specs_ru").$type<Record<string, string>>(),
  specsEn: jsonb("specs_en").$type<Record<string, string>>(),
  price: text("price").notNull(), // Keep as text for decimal precision
  oldPrice: text("old_price"),
  stock: integer("stock").default(0).notNull(),
  isAvailable: text("is_available").default("yes").notNull(), // "yes", "no"
  rating: text("rating").default("4.5").notNull(),
  reviewCount: integer("review_count").default(0).notNull(),
  images: jsonb("images").$type<string[]>(),
  categoryId: integer("category_id").notNull(),
  brandId: integer("brand_id").notNull(),
  isPopular: text("is_popular").default("no").notNull(), // "yes", "no"
  isNew: text("is_new").default("no").notNull(), // "yes", "no"
  sortOrder: integer("sort_order").default(0).notNull(),
  stockQuantity: integer("stock_quantity").default(0).notNull(),
  viewsCount: integer("views_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;

// ── Reviews ──────────────────────────────────────────────────
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  userId: integer("user_id").notNull(),
  userName: text("user_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;

// ── Cart Items (guest + authenticated) ───────────────────────
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id"),
  userId: integer("user_id"),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;

// ── Wishlist Items ───────────────────────────────────────────
export const wishlistItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id"),
  userId: integer("user_id"),
  productId: integer("product_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type WishlistItem = typeof wishlistItems.$inferSelect;

// ── Comparison Items ─────────────────────────────────────────
export const comparisonItems = pgTable("comparison_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id"),
  userId: integer("user_id"),
  productId: integer("product_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ComparisonItem = typeof comparisonItems.$inferSelect;

// ── Orders ───────────────────────────────────────────────────
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: integer("user_id"),
  sessionId: text("session_id"),
  status: text("status").default("pending").notNull(), // "pending", "confirmed", etc.
  paymentMethod: text("payment_method").default("cash").notNull(), // "online", "cash"
  paymentStatus: text("payment_status").default("pending").notNull(), // "pending", "paid", etc.
  totalAmount: text("total_amount").notNull(),
  shippingName: text("shipping_name").notNull(),
  shippingPhone: text("shipping_phone").notNull(),
  shippingEmail: text("shipping_email"),
  shippingAddress: text("shipping_address").notNull(),
  shippingCity: text("shipping_city").notNull(),
  shippingRegion: text("shipping_region"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;

// ── Order Items ──────────────────────────────────────────────
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  productImage: text("product_image"),
  quantity: integer("quantity").notNull(),
  unitPrice: text("unit_price").notNull(),
  totalPrice: text("total_price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;

