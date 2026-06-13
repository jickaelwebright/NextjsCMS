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
