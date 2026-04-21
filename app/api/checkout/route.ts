import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSubscription } from "@/lib/mercadopago";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.MP_ACCESS_TOKEN) {
    return NextResponse.json({ error: "MP_ACCESS_TOKEN não configurado" }, { status: 500 });
  }

  try {
    const sub = await createSubscription(session.user.email!, session.user.id);
    const data = sub as any;
    // em modo teste o MP retorna sandbox_init_point; em produção retorna init_point
    const url = data.init_point ?? data.sandbox_init_point;
    if (!url) return NextResponse.json({ error: "URL de pagamento não retornada pelo MP", debug: data }, { status: 500 });
    return NextResponse.json({ initPoint: url });
  } catch (err: any) {
    console.error("[checkout]", err);
    return NextResponse.json({ error: err?.message ?? "Erro ao criar assinatura" }, { status: 500 });
  }
}
