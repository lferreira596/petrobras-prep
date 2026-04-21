import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userQuestionProgress, users } from "@/lib/db/schema";
import { and, lt, isNotNull, gt, sql, eq } from "drizzle-orm";
import { sendReviewReminderEmail } from "@/lib/email";

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

  const total = Number(vencidos[0]?.count ?? 0);
  console.log(`[Spaced Repetition] ${total} itens vencidos em ${now.toISOString()}`);

  // Dispara e-mail para usuários com revisões pendentes hoje
  const pendentes = await db
    .select({
      userId: userQuestionProgress.userId,
      qtd   : sql<number>`count(*)`,
    })
    .from(userQuestionProgress)
    .where(and(
      isNotNull(userQuestionProgress.proximaRevisao),
      lt(userQuestionProgress.proximaRevisao, now),
      gt(userQuestionProgress.erros, 0),
    ))
    .groupBy(userQuestionProgress.userId);

  let emailsSent = 0;
  for (const row of pendentes) {
    const userRows = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, row.userId)).limit(1);
    const u = userRows[0];
    if (u?.email && u?.name) {
      await sendReviewReminderEmail(u.email, u.name, Number(row.qtd)).catch(() => null);
      emailsSent++;
    }
  }

  return NextResponse.json({
    ok: true,
    vencidos: total,
    emailsSent,
    processedAt: now.toISOString(),
  });
}
