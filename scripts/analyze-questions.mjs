import fs from "node:fs";
import { neon } from "@neondatabase/serverless";

for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!match || process.env[match[1]]) continue;
  process.env[match[1]] = match[2].replace(/^"|"$/g, "");
}

const sql = neon(process.env.POSTGRES_URL);

const byAreaLabel = {
  port: "Português",
  mat: "Matemática/Raciocínio",
  info: "Informática",
  adm: "Administração",
  leg: "Legislação",
  pet: "Petróleo e Gás",
  ing: "Inglês",
  con: "Contabilidade",
};

const run = (query) => sql(query);

const [
  total,
  active,
  area,
  banca,
  dif,
  tipo,
  premium,
  years,
  areaBanca,
  areaDif,
  topSub,
] = await Promise.all([
  run("select count(*)::int as total from questions"),
  run("select ativa, count(*)::int as total from questions group by ativa order by ativa desc"),
  run("select area, count(*)::int as total from questions group by area order by total desc, area"),
  run("select banca, count(*)::int as total from questions group by banca order by total desc"),
  run("select dificuldade as dif, count(*)::int as total from questions group by dificuldade order by case dificuldade when 'facil' then 1 when 'media' then 2 when 'dificil' then 3 end"),
  run("select tipo, count(*)::int as total from questions group by tipo order by total desc"),
  run("select is_premium, count(*)::int as total from questions group by is_premium order by is_premium"),
  run("select ano, count(*)::int as total from questions group by ano order by ano"),
  run("select area, banca, count(*)::int as total from questions group by area, banca order by area, banca"),
  run("select area, dificuldade as dif, count(*)::int as total from questions group by area, dificuldade order by area, case dificuldade when 'facil' then 1 when 'media' then 2 when 'dificil' then 3 end"),
  run("select area, sub, count(*)::int as total from questions group by area, sub order by total desc, area, sub limit 20"),
]);

const report = {
  total: total[0].total,
  active,
  area: area.map((row) => ({ ...row, materia: byAreaLabel[row.area] ?? row.area })),
  banca,
  dif,
  tipo,
  premium,
  years,
  areaBanca: areaBanca.map((row) => ({ ...row, materia: byAreaLabel[row.area] ?? row.area })),
  areaDif: areaDif.map((row) => ({ ...row, materia: byAreaLabel[row.area] ?? row.area })),
  topSub: topSub.map((row) => ({ ...row, materia: byAreaLabel[row.area] ?? row.area })),
};

console.log(JSON.stringify(report, null, 2));
