import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/lib/schema";

const db = drizzle(process.env.DATABASE_URL!, {
  schema,
  casing: "snake_case",
});
export { db };
