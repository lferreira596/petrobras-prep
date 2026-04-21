import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserRole } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const QuestionSchema = z.object({
  id       : z.string().min(1),
  area     : z.enum(["port","mat","info","adm","leg","pet","ing","con"]),
  sub      : z.string(),
  banca    : z.enum(["CESGRANRIO","CEBRASPE"]),
  ano      : z.number().int(),
  dif      : z.enum(["facil","media","dificil"]),
  tipo     : z.enum(["multipla","certo_errado"]),
  enunciado: z.string().min(1),
  opcoes   : z.array(z.string()).min(2),
  correta  : z.number().int().min(0),
  explicacao: z.string(),
  enfase   : z.string().optional(),
  isPremium: z.boolean().optional(),
  ativa    : z.boolean().optional(),
});

async function assertAdmin(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return false;
  const role = await getUserRole(session.user.id);
  return role === "admin";
}

export async function GET(req: NextRequest) {
  if (!await assertAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rows = await db.select().from(questions).orderBy(questions.area);
  return NextResponse.json({ questions: rows });
}

export async function POST(req: NextRequest) {
  if (!await assertAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const parsed = QuestionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  await db.insert(questions).values(parsed.data as any);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  if (!await assertAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.update(questions).set(fields).where(eq(questions.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!await assertAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.update(questions).set({ ativa: false }).where(eq(questions.id, id));
  return NextResponse.json({ ok: true });
}
