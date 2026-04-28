import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getQuestions, getUserAccess } from "@/lib/db/queries";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const access = await getUserAccess(session.user.id);
  const { searchParams } = new URL(req.url);

  const questions = await getQuestions({
    area    : searchParams.get("area")   ?? undefined,
    banca   : searchParams.get("banca")  ?? undefined,
    dif     : searchParams.get("dif")    ?? undefined,
    tipo    : searchParams.get("tipo")   ?? undefined,
    enfase  : searchParams.get("enfase") ?? undefined,
    limit   : Number(searchParams.get("limit") ?? 200),
    userPlan: access.plan,
    freeAccessActive: access.isFreeAccessActive,
  });

  return NextResponse.json({ questions, access });
}
