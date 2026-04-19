import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getReviewQueue } from "@/lib/db/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const queue = await getReviewQueue(session.user.id);
  return NextResponse.json({ queue });
}
