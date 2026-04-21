import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserPlan } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

const AREAS = ["port","mat","info","adm","leg","pet","ing","con"] as const;
// Distribuição por área baseada no edital Petrobras
const DIST: Record<string, number> = {
  port: 10, mat: 10, info: 10, adm: 30, leg: 10, pet: 10, ing: 10, con: 10,
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plan = await getUserPlan(session.user.id);
  if (plan !== "premium") return NextResponse.json({ error: "Premium required" }, { status: 403 });

  const result: any[] = [];
  for (const area of AREAS) {
    const qtd = DIST[area] ?? 10;
    const rows = await db
      .select()
      .from(questions)
      .where(and(eq(questions.area, area as any), eq(questions.ativa, true)))
      .orderBy(sql`random()`)
      .limit(qtd);
    result.push(...rows);
  }

  // embaralha o array final
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return NextResponse.json({ questions: result });
}
