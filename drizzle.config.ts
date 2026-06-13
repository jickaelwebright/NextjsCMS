import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema/tenant.ts",
  out: "./src/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "./data/tenant-default.db",
  },
} satisfies Config;
