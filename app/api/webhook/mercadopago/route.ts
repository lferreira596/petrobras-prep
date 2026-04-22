import { NextRequest, NextResponse } from "next/server";
import { getPayment } from "@/lib/mercadopago";
import { upsertSubscription } from "@/lib/db/queries";
import { sendPremiumConfirmationEmail } from "@/lib/email";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { addDays } from "date-fns";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // MP envia type "payment" para pagamentos únicos (PIX, cartão, boleto)
  if (body.type !== "payment") return NextResponse.json({ ok: true });

  const paymentId = body.data?.id;
  if (!paymentId) return NextResponse.json({ ok: true });

  try {
    const payment = await getPayment(String(paymentId));
    const data = payment as any;

    // Só ativa premium se pagamento aprovado
    if (data.status !== "approved") return NextResponse.json({ ok: true });

    const userId = data.external_reference;
    if (!userId) return NextResponse.json({ ok: true });

    await upsertSubscription({
      userId,
      mpSubscriptionId : String(paymentId),
      status           : "active",
      validUntil       : addDays(new Date(), 30),
    });

    const userRows = await db.select({ email: users.email, name: users.name })
      .from(users).where(eq(users.id, userId)).limit(1);
    const u = userRows[0];
    if (u?.email && u?.name) {
      await sendPremiumConfirmationEmail(u.email, u.name).catch(() => null);
    }
  } catch (err) {
    console.error("[webhook/mp]", err);
  }

  return NextResponse.json({ ok: true });
}
