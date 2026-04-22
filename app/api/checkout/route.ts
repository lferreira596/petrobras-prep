import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCheckout } from "@/lib/mercadopago";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.MP_ACCESS_TOKEN) {
    return NextResponse.json({ error: "MP_ACCESS_TOKEN não configurado" }, { status: 500 });
  }

  try {
    const pref = await createCheckout(session.user.email!, session.user.id);
    const data = pref as any;
    // modo teste: sandbox_init_point | produção: init_point
    const url = data.init_point ?? data.sandbox_init_point;
    if (!url) return NextResponse.json({ error: "URL de pagamento não retornada pelo MP", debug: data }, { status: 500 });
    return NextResponse.json({ initPoint: url });
  } catch (err: any) {
    console.error("[checkout]", err);
    return NextResponse.json({ error: err?.message ?? "Erro ao criar checkout" }, { status: 500 });
  }
}
