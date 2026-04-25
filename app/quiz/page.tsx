import { auth } from "@/lib/auth";
import QuizClient from "./QuizClient";
import { getQuestions, getUserProgress, getUserPlan } from "@/lib/db/queries";

export default async function QuizPage({ searchParams }: { searchParams: { area?: string; banca?: string; dif?: string; tipo?: string } }) {
  const session = await auth();
  const userPlan: "guest" | "free" | "premium" = session?.user?.id ? await getUserPlan(session.user.id) : "guest";
  const progress = session?.user?.id ? await getUserProgress(session.user.id) : [];

  const questions = await getQuestions({
    area  : searchParams.area,
    banca : searchParams.banca,
    dif   : searchParams.dif,
    tipo  : searchParams.tipo,
    enfase: "adm_controle",
    userPlan: userPlan === "premium" ? "premium" : "free",
  });

  const progressMap = Object.fromEntries(progress.map(p => [p.questionId, p]));

  return <QuizClient questions={questions} progressMap={progressMap} userId={session?.user?.id} userPlan={userPlan} />;
}
