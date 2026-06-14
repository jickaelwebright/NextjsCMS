import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const pages = sqliteTable("pages", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  status: text("status", { enum: ["draft", "published", "archived"] })
    .notNull()
    .default("draft"),
  pageType: text("page_type", { enum: ["page", "post", "landing", "template"] })
    .notNull()
    .default("page"),
  content: text("content").notNull().default("{}"),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  publishedAt: integer("published_at", { mode: "timestamp" }),
});

export const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  width: integer("width"),
  height: integer("height"),
  url: text("url").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const templates = sqliteTable("templates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category"),
  thumbnail: text("thumbnail"),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const forms = sqliteTable("forms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  fields: text("fields").notNull().default("[]"),
  emailTo: text("email_to"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const formSubmissions = sqliteTable("form_submissions", {
  id: text("id").primaryKey(),
  formId: text("form_id").notNull(),
  data: text("data").notNull(),
  submittedAt: integer("submitted_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
});

export const globalRegions = sqliteTable("global_regions", {
  id: text("id").primaryKey(),
  content: text("content").notNull().default("{}"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const addonSettings = sqliteTable("addon_settings", {
  key: text("key").primaryKey(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(false),
  config: text("config").notNull().default("{}"),
  enabledAt: integer("enabled_at", { mode: "timestamp" }),
});

// ─── Shop addon tables (only created when shop addon is activated) ─────────────

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  shortDescription: text("short_description"),
  type: text("type", { enum: ["physical", "digital", "variable"] }).notNull().default("physical"),
  status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
  price: integer("price").notNull().default(0),
  salePrice: integer("sale_price"),
  sku: text("sku"),
  stock: integer("stock").notNull().default(0),
  stockTracking: integer("stock_tracking", { mode: "boolean" }).notNull().default(false),
  images: text("images").notNull().default("[]"),
  categories: text("categories").notNull().default("[]"),
  downloadFiles: text("download_files").notNull().default("[]"),
  weight: integer("weight"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const productVariants = sqliteTable("product_variants", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  name: text("name").notNull(),
  sku: text("sku"),
  price: integer("price").notNull().default(0),
  salePrice: integer("sale_price"),
  stock: integer("stock").notNull().default(0),
  attributes: text("attributes").notNull().default("{}"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status", { enum: ["pending", "processing", "completed", "cancelled", "refunded"] }).notNull().default("pending"),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  billingAddress: text("billing_address").notNull().default("{}"),
  shippingAddress: text("shipping_address").notNull().default("{}"),
  items: text("items").notNull().default("[]"),
  subtotal: integer("subtotal").notNull().default(0),
  shippingCost: integer("shipping_cost").notNull().default(0),
  tax: integer("tax").notNull().default(0),
  total: integer("total").notNull().default(0),
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status", { enum: ["unpaid", "paid", "refunded"] }).notNull().default("unpaid"),
  paymentRef: text("payment_ref"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const digitalDeliveries = sqliteTable("digital_deliveries", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  productId: text("product_id").notNull(),
  token: text("token").notNull().unique(),
  downloadLimit: integer("download_limit").notNull().default(3),
  downloadCount: integer("download_count").notNull().default(0),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
