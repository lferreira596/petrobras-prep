import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | undefined;

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    if (!_db) _db = drizzle(neon(process.env.POSTGRES_URL!), { schema });
    return Reflect.get(_db, prop);
  },
});

export * from "./schema";
