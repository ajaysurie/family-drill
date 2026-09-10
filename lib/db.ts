import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { foundationSql, seedSql } from "./database-bootstrap";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const client = postgres(process.env.DATABASE_URL, { prepare: false });
export const db = drizzle(client);

let bootstrap: Promise<unknown> | undefined;

export function ensureSchema() {
  if (!bootstrap) {
    bootstrap = client.begin(async (transaction) => {
      await transaction`select pg_advisory_xact_lock(1178943932)`;
      await transaction.unsafe(foundationSql);
      await transaction.unsafe(seedSql);
    });
    bootstrap.catch(() => { bootstrap = undefined; });
  }
  return bootstrap;
}
