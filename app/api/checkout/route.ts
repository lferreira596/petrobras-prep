import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSubscription } from "@/lib/mercadopago";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await createSubscription(session.user.email!, session.user.id);
  return NextResponse.json({ initPoint: (sub as any).init_point });
}
