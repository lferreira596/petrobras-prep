import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserPlan, getUserRole } from "@/lib/db/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [plan, role] = await Promise.all([
    getUserPlan(session.user.id),
    getUserRole(session.user.id),
  ]);

  return NextResponse.json({ isPremium: plan === "premium", isAdmin: role === "admin" });
}
