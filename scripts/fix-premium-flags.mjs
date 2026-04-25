import fs from "node:fs";
import { neon } from "@neondatabase/serverless";

for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!match || process.env[match[1]]) continue;
  process.env[match[1]] = match[2].replace(/^"|"$/g, "");
}

const freeDemoIds = [
  "p01",
  "m01",
  "i01",
  "a01",
  "l01",
  "k01",
  "e01",
  "c01",
  "m06",
  "a04",
];

const sql = neon(process.env.POSTGRES_URL);

await sql("update questions set is_premium = true");
await sql("update questions set is_premium = false where id = any($1)", [freeDemoIds]);

const rows = await sql(`
  select
    is_premium,
    count(*)::int as total
  from questions
  group by is_premium
  order by is_premium
`);

console.log(JSON.stringify(rows, null, 2));
