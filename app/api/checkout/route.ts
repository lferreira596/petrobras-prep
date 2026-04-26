import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCheckout } from "@/lib/mercadopago";

function getAppUrl(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const proto = forwardedProto ?? (host?.startsWith("localhost") ? "http" : "https");
  const fallback = process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;

  return host ? `${proto}://${host}` : fallback;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.MP_ACCESS_TOKEN) {
    return NextResponse.json({ error: "MP_ACCESS_TOKEN nao configurado" }, { status: 500 });
  }

  const appUrl = getAppUrl(request);
  if (!appUrl) {
    return NextResponse.json({ error: "URL publica do app nao configurada" }, { status: 500 });
  }

  try {
    const pref = await createCheckout(session.user.email!, session.user.id, appUrl);
    const data = pref as any;
    // modo teste: sandbox_init_point | producao: init_point
    const url = data.init_point ?? data.sandbox_init_point;
    if (!url) return NextResponse.json({ error: "URL de pagamento nao retornada pelo MP", debug: data }, { status: 500 });
    return NextResponse.json({ initPoint: url });
  } catch (err: any) {
    console.error("[checkout]", err);
    return NextResponse.json({ error: err?.message ?? "Erro ao criar checkout" }, { status: 500 });
  }
}
