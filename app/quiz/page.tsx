import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import QuizClient from "./QuizClient";
import { getQuestions, getUserAccess, getUserProgress } from "@/lib/db/queries";

export default async function QuizPage({ searchParams }: { searchParams: { area?: string; banca?: string; dif?: string; tipo?: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const access = await getUserAccess(session.user.id);
  const progress = await getUserProgress(session.user.id);

  const questions = await getQuestions({
    area  : searchParams.area,
    banca : searchParams.banca,
    dif   : searchParams.dif,
    tipo  : searchParams.tipo,
    enfase: "adm_controle",
    userPlan: access.plan,
    freeAccessActive: access.isFreeAccessActive,
  });

  const progressMap = Object.fromEntries(progress.map(p => [p.questionId, p]));

  return <QuizClient questions={questions} progressMap={progressMap} userId={session.user.id} access={access} />;
}
