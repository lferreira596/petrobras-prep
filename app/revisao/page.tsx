import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getReviewQueue, getQuestionsByIds } from "@/lib/db/queries";
import RevisaoClient from "./RevisaoClient";

export default async function RevisaoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const queue = await getReviewQueue(session.user.id);
  if (!queue.length) redirect("/dashboard");

  const questionIds = queue.map(q => q.questionId);
  const questions   = await getQuestionsByIds(questionIds);
  const errosMap    = Object.fromEntries(queue.map(q => [q.questionId, { erros: q.erros, tentativas: q.tentativas }]));

  return <RevisaoClient questions={questions} errosMap={errosMap} userId={session.user.id}/>;
}
