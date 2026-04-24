import { db } from "./index";
import {
  questions, userQuestionProgress, studySessions, users, studyPlans, subscriptions,
  type Question, type UserQuestionProgress,
} from "./schema";
import { and, eq, lte, desc, sql, count, avg, inArray } from "drizzle-orm";

// 10 questões fixas do plano free — uma por área, cobrindo o essencial
// Altere os IDs aqui para trocar quais questões aparecem para usuários gratuitos
export const FREE_DEMO_IDS = [
  "p01",  // Português   — Interpretação de Texto
  "m01",  // Matemática  — Porcentagem
  "i01",  // Informática — Phishing / Segurança
  "a01",  // Administração — Funções PODC (Fayol)
  "l01",  // Legislação  — Natureza Jurídica Petrobras
  "k01",  // Petróleo    — Pré-Sal
  "e01",  // Inglês      — Upstream/Downstream
  "c01",  // Contabilidade — Ativo Circulante
  "m06",  // Matemática  — Lógica Proposicional
  "a04",  // Administração — Análise SWOT
] as const;

// ── Questions ─────────────────────────────────────────────────
export async function getQuestions(filters: {
  area?    : string;
  banca?   : string;
  dif?     : string;
  tipo?    : string;
  enfase?  : string;
  limit?   : number;
  userPlan?: "free" | "premium";
}) {
  const isFree = !filters.userPlan || filters.userPlan === "free";

  // Plano free: sempre retorna exatamente as 10 questões demo, ignorando filtros
  if (isFree) {
    return db
      .select()
      .from(questions)
      .where(and(
        eq(questions.ativa, true),
        inArray(questions.id, FREE_DEMO_IDS as unknown as string[]),
      ));
  }

  // Plano premium: filtros completos
  const conditions = [eq(questions.ativa, true)];
  if (filters.area  && filters.area  !== "todas") conditions.push(eq(questions.area,  filters.area  as any));
  if (filters.banca && filters.banca !== "Todas as Bancas") conditions.push(eq(questions.banca, filters.banca as any));
  if (filters.dif   && filters.dif   !== "Todas") conditions.push(eq(questions.dif,   filters.dif   as any));
  if (filters.tipo  && filters.tipo  !== "misto") conditions.push(eq(questions.tipo,  filters.tipo  as any));
  if (filters.enfase) conditions.push(eq(questions.enfase, filters.enfase));

  return db
    .select()
    .from(questions)
    .where(and(...conditions))
    .limit(filters.limit ?? 200);
}

export async function getQuestionsByIds(ids: string[]) {
  if (!ids.length) return [];
  return db.select().from(questions).where(inArray(questions.id, ids));
}

// ── Progress ──────────────────────────────────────────────────
export async function getUserProgress(userId: string) {
  return db
    .select()
    .from(userQuestionProgress)
    .where(eq(userQuestionProgress.userId, userId));
}

export async function getReviewQueue(userId: string) {
  const now = new Date();
  return db
    .select({ questionId: userQuestionProgress.questionId, erros: userQuestionProgress.erros,
              tentativas: userQuestionProgress.tentativas, proximaRevisao: userQuestionProgress.proximaRevisao })
    .from(userQuestionProgress)
    .where(and(
      eq(userQuestionProgress.userId, userId),
      lte(userQuestionProgress.proximaRevisao, now),
    ))
    .orderBy(desc(userQuestionProgress.erros));
}

export async function upsertProgress(
  userId: string,
  questionId: string,
  acertou: boolean,
) {
  const existing = await db
    .select()
    .from(userQuestionProgress)
    .where(and(
      eq(userQuestionProgress.userId, userId),
      eq(userQuestionProgress.questionId, questionId),
    ))
    .limit(1);

  const cur = existing[0];
  const now = new Date();

  if (!cur) {
    const erros = acertou ? 0 : 1;
    const proximaRevisao = acertou ? null : now; // erros aparecem imediatamente na fila
    await db.insert(userQuestionProgress).values({
      userId, questionId, tentativas: 1,
      acertos: acertou ? 1 : 0, erros,
      intervalo: 1, facilidade: 250,
      proximaRevisao, ultimaVez: now,
    });
  } else {
    // SM-2 simplificado
    const { intervalo, facilidade, erros } = sm2Update(cur, acertou);
    const proximaRevisao = erros > 0 ? addDays(now, intervalo) : null;
    await db
      .update(userQuestionProgress)
      .set({
        tentativas   : cur.tentativas + 1,
        acertos      : cur.acertos + (acertou ? 1 : 0),
        erros,
        intervalo,
        facilidade,
        proximaRevisao,
        ultimaVez    : now,
      })
      .where(and(
        eq(userQuestionProgress.userId, userId),
        eq(userQuestionProgress.questionId, questionId),
      ));
  }
}

// SM-2 algorithm (simplified)
function sm2Update(cur: UserQuestionProgress, acertou: boolean) {
  const q   = acertou ? 5 : 1;  // qualidade da resposta 0-5
  const ef  = cur.facilidade;   // fator EF * 100
  const newEf = Math.max(130, ef + (10 * (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))));
  const newIntervalo = acertou
    ? cur.intervalo === 1 ? 1 : Math.round(cur.intervalo * newEf / 100)
    : 1;
  const newErros = acertou ? Math.max(0, cur.erros - 1) : cur.erros + 1;
  return { intervalo: newIntervalo, facilidade: Math.round(newEf), erros: newErros };
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// ── Sessions ──────────────────────────────────────────────────
export async function saveSession(data: {
  userId: string; modo: "quiz"|"revisao";
  total: number; acertos: number; erros: number;
  duracaoSeg: number; areas: string[];
}) {
  await db.insert(studySessions).values(data);
  // atualiza streak e ultimo estudo
  await updateStreak(data.userId);
}

async function updateStreak(userId: string) {
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user[0]) return;
  const now = new Date();
  const ultimo = user[0].ultimoEstudo;
  let streak = user[0].streakDias;
  if (ultimo) {
    const diffDias = Math.floor((now.getTime() - ultimo.getTime()) / 86400000);
    if (diffDias === 1) streak += 1;
    else if (diffDias > 1) streak = 1;
    // diffDias === 0 → mesmo dia, não altera
  } else {
    streak = 1;
  }
  await db.update(users).set({ streakDias: streak, ultimoEstudo: now }).where(eq(users.id, userId));
}

// ── Stats ─────────────────────────────────────────────────────
export async function getUserStats(userId: string) {
  const [sessionsData] = await db
    .select({
      totalSessoes : count(),
      totalQuestoes: sql<number>`sum(${studySessions.total})`,
      totalAcertos : sql<number>`sum(${studySessions.acertos})`,
      mediaAcerto  : avg(studySessions.acertos),
    })
    .from(studySessions)
    .where(eq(studySessions.userId, userId));

  const progressData = await db
    .select()
    .from(userQuestionProgress)
    .where(eq(userQuestionProgress.userId, userId));

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  const reviewQueue = await getReviewQueue(userId);

  // desempenho por área
  const areaStats: Record<string, { acertos: number; erros: number }> = {};
  for (const p of progressData) {
    const q = await db.select({ area: questions.area }).from(questions)
      .where(eq(questions.id, p.questionId)).limit(1);
    const area = q[0]?.area ?? "other";
    if (!areaStats[area]) areaStats[area] = { acertos: 0, erros: 0 };
    areaStats[area].acertos += p.acertos;
    areaStats[area].erros   += p.erros;
  }

  return {
    totalSessoes  : Number(sessionsData?.totalSessoes ?? 0),
    totalQuestoes : Number(sessionsData?.totalQuestoes ?? 0),
    totalAcertos  : Number(sessionsData?.totalAcertos ?? 0),
    pctAcerto     : sessionsData?.totalQuestoes
      ? Math.round((Number(sessionsData.totalAcertos) / Number(sessionsData.totalQuestoes)) * 100)
      : 0,
    streakDias    : user[0]?.streakDias ?? 0,
    filaRevisao   : reviewQueue.length,
    areaStats,
  };
}

// ── Study Plan ────────────────────────────────────────────────
export async function getStudyPlan(userId: string) {
  const plan = await db.select().from(studyPlans).where(eq(studyPlans.userId, userId)).limit(1);
  return plan[0] ?? null;
}

export async function upsertStudyPlan(userId: string, config: any) {
  const existing = await getStudyPlan(userId);
  if (existing) {
    await db.update(studyPlans).set({ config, updatedAt: new Date() }).where(eq(studyPlans.userId, userId));
  } else {
    await db.insert(studyPlans).values({ userId, config });
  }
}

// ── Users for cron ────────────────────────────────────────────
export async function getUsersForReminder() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  // usuários que não estudaram ontem
  return db
    .select({ id: users.id, email: users.email, name: users.name, streakDias: users.streakDias })
    .from(users)
    .where(
      sql`${users.ultimoEstudo} IS NULL OR ${users.ultimoEstudo} < ${yesterday}`
    );
}

export async function getUsersForWeeklyReport() {
  return db.select({ id: users.id, email: users.email, name: users.name }).from(users);
}

// ── Subscriptions ─────────────────────────────────────────────
export async function getSubscription(userId: string) {
  const rows = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function upsertSubscription(data: {
  userId          : string;
  mpSubscriptionId: string;
  status          : "active" | "cancelled" | "past_due";
  validUntil      : Date;
}) {
  const existing = await getSubscription(data.userId);
  if (existing) {
    await db.update(subscriptions)
      .set({ mpSubscriptionId: data.mpSubscriptionId, status: data.status, validUntil: data.validUntil, updatedAt: new Date() })
      .where(eq(subscriptions.userId, data.userId));
  } else {
    await db.insert(subscriptions).values(data);
  }
  // sincroniza plan no user
  await db.update(users)
    .set({ plan: data.status === "active" ? "premium" : "free" })
    .where(eq(users.id, data.userId));
}

export async function getUserPlan(userId: string): Promise<"free" | "premium"> {
  const rows = await db.select({ plan: users.plan }).from(users).where(eq(users.id, userId)).limit(1);
  return rows[0]?.plan ?? "free";
}

export async function getUserRole(userId: string): Promise<"user" | "admin"> {
  const rows = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
  return rows[0]?.role ?? "user";
}
