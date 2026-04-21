import { NextRequest, NextResponse } from "next/server";
import { getSubscription as getMpSubscription } from "@/lib/mercadopago";
import { upsertSubscription } from "@/lib/db/queries";
import { sendPremiumConfirmationEmail } from "@/lib/email";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { addMonths } from "date-fns";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // MP envia type "subscription_preapproval" para eventos de assinatura
  if (body.type !== "subscription_preapproval") return NextResponse.json({ ok: true });

  const subscriptionId = body.data?.id;
  if (!subscriptionId) return NextResponse.json({ ok: true });

  const mpSub = await getMpSubscription(subscriptionId);
  const userId = (mpSub as any).external_reference;
  if (!userId) return NextResponse.json({ ok: true });

  const rawStatus = (mpSub as any).status as string;
  const status: "active" | "cancelled" | "past_due" =
    rawStatus === "authorized" ? "active"
    : rawStatus === "cancelled" ? "cancelled"
    : "past_due";

  const wasActive = status === "active";
  await upsertSubscription({
    userId,
    mpSubscriptionId : subscriptionId,
    status,
    validUntil       : addMonths(new Date(), 1),
  });

  if (wasActive) {
    const userRows = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, userId)).limit(1);
    const u = userRows[0];
    if (u?.email && u?.name) await sendPremiumConfirmationEmail(u.email, u.name).catch(() => null);
  }

  return NextResponse.json({ ok: true });
}
