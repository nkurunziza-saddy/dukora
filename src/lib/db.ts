import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { upstashCache } from "drizzle-orm/cache/upstash";
import { Pool } from "pg";
import * as schema from "@/lib/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle({
  client: pool,
  schema,
  cache: upstashCache({
    url: process.env.UPSTASH_URL as string,
    token: process.env.UPSTASH_TOKEN as string,
    global: true,
  }),
});

export { db };
