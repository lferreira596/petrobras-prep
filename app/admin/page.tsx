import { auth } from "@/lib/auth";
import { getUserRole } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const role = await getUserRole(session.user.id);
  if (role !== "admin") redirect("/dashboard");

  return <AdminClient />;
}
