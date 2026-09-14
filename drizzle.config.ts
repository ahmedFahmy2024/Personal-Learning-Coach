import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  strict: true,
  dbCredentials: {
    // Only needed for `db:migrate`. `db:generate` works without a live database.
    url: process.env.DATABASE_URL ?? "",
  },
});
