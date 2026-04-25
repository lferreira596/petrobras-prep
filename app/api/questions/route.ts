import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getQuestions, getUserPlan } from "@/lib/db/queries";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userPlan = session?.user?.id ? await getUserPlan(session.user.id) : "free";
  const { searchParams } = new URL(req.url);

  const questions = await getQuestions({
    area    : searchParams.get("area")   ?? undefined,
    banca   : searchParams.get("banca")  ?? undefined,
    dif     : searchParams.get("dif")    ?? undefined,
    tipo    : searchParams.get("tipo")   ?? undefined,
    enfase  : searchParams.get("enfase") ?? undefined,
    limit   : Number(searchParams.get("limit") ?? 200),
    userPlan,
  });

  return NextResponse.json({ questions, userPlan });
}
