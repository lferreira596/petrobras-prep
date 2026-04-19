import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStudyPlan, upsertStudyPlan } from "@/lib/db/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const plan = await getStudyPlan(session.user.id);
  return NextResponse.json({ plan });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { config } = await req.json();
  await upsertStudyPlan(session.user.id, config);
  return NextResponse.json({ ok: true });
}
