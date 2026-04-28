import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserAccess, getUserRole } from "@/lib/db/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [access, role] = await Promise.all([
    getUserAccess(session.user.id),
    getUserRole(session.user.id),
  ]);

  return NextResponse.json({ ...access, isAdmin: role === "admin" });
}
