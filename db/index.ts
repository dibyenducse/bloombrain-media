import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

// Reuse one pool per server process (and across dev hot reloads).
const globalForDb = globalThis as unknown as { bbPool?: mysql.Pool };

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it in your hosting panel, e.g. mysql://user:password@localhost:3306/dbname"
    );
  }

  globalForDb.bbPool ??= mysql.createPool({ uri: url, connectionLimit: 5 });
  return drizzle(globalForDb.bbPool, { schema, mode: "default" });
}
