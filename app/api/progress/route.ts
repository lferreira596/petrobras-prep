import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserProgress, upsertProgress } from "@/lib/db/queries";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const progress = await getUserProgress(session.user.id);
  return NextResponse.json({ progress });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = z.object({ questionId: z.string(), acertou: z.boolean() }).safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  await upsertProgress(session.user.id, body.data.questionId, body.data.acertou);
  return NextResponse.json({ ok: true });
}
