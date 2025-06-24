import type { Config } from "drizzle-kit"

export default {
  schema: "./lib/db.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config
