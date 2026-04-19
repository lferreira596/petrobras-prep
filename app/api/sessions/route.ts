import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveSession } from "@/lib/db/queries";
import { z } from "zod";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = z.object({
    modo: z.enum(["quiz","revisao"]), total: z.number(), acertos: z.number(),
    erros: z.number(), duracaoSeg: z.number().default(0), areas: z.array(z.string()),
  }).safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  await saveSession({ userId: session.user.id, ...body.data });
  return NextResponse.json({ ok: true });
}
