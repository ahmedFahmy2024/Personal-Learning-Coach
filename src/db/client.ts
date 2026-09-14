/**
 * Server-only Neon Postgres connection through Drizzle ORM.
 *
 * The Neon HTTP driver (`drizzle-orm/neon-http`) suits the App Router's
 * serverless request model: one fetch per query, no pooled sockets held
 * between requests, and no WebSocket dependency during builds.
 *
 * `DATABASE_URL` is read only here. Nothing in this module is importable from
 * client code (`server-only` throws at build time if that happens), and the
 * connection string never leaves the server in an action return value.
 */

import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

export type Database = ReturnType<typeof createDatabase>;

/** Thrown when `DATABASE_URL` is missing instead of leaking env details. */
export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super(
      "DATABASE_URL is not set. Add it to .env.local to enable database persistence.",
    );
    this.name = "DatabaseNotConfiguredError";
  }
}

function createDatabase(connectionString: string) {
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

let cached: Database | null = null;
let cachedConnectionString: string | null = null;

export function isDatabaseConfigured(): boolean {
  const value = process.env.DATABASE_URL;
  return value !== undefined && value.trim().length > 0;
}

/** Returns the shared Drizzle client, or throws a safe error when unconfigured. */
export function getDb(): Database {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString === undefined || connectionString.trim().length === 0) {
    throw new DatabaseNotConfiguredError();
  }
  if (cached === null || cachedConnectionString !== connectionString) {
    cached = createDatabase(connectionString);
    cachedConnectionString = connectionString;
  }
  return cached;
}
