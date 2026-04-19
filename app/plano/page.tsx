import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStudyPlan } from "@/lib/db/queries";
import PlanoClient from "./PlanoClient";

export default async function PlanoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const plan = await getStudyPlan(session.user.id);
  return <PlanoClient plan={plan} userId={session.user.id} />;
}
