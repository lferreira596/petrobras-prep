import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userQuestionProgress } from "@/lib/db/schema";
import { and, lt, isNotNull, gt, sql } from "drizzle-orm";

/**
 * Cron de Repetição Espaçada
 * Roda diariamente às 6h.
 * Garante que questões com proximaRevisao vencida
 * sejam marcadas e apareçam na fila do usuário.
 * (As queries de getReviewQueue já filtram por data,
 *  este cron apenas loga e pode disparar push notifications futuras)
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Conta quantos itens de revisão estão vencidos hoje
  const vencidos = await db
    .select({ count: sql<number>`count(*)` })
    .from(userQuestionProgress)
    .where(and(
      isNotNull(userQuestionProgress.proximaRevisao),
      lt(userQuestionProgress.proximaRevisao, now),
      gt(userQuestionProgress.erros, 0),
    ));

  console.log(`[Spaced Repetition] ${vencidos[0]?.count ?? 0} itens vencidos em ${now.toISOString()}`);

  return NextResponse.json({
    ok: true,
    vencidos: Number(vencidos[0]?.count ?? 0),
    processedAt: now.toISOString(),
  });
}
