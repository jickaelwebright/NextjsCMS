import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const tenants = sqliteTable("tenants", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  customDomain: text("custom_domain"),
  adminEmail: text("admin_email").notNull(),
  adminPasswordHash: text("admin_password_hash").notNull(),
  dbPath: text("db_path").notNull(),
  plan: text("plan", { enum: ["active", "suspended"] }).notNull().default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
