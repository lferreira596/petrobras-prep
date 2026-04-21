"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface PlanState {
  isPremium : boolean;
  isAdmin   : boolean;
  loading   : boolean;
}

export function usePlan(): PlanState {
  const { data: session, status } = useSession();
  const [state, setState] = useState<PlanState>({ isPremium: false, isAdmin: false, loading: true });

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) {
      setState({ isPremium: false, isAdmin: false, loading: false });
      return;
    }
    fetch("/api/me/plan")
      .then((r) => r.json())
      .then((data) => setState({ isPremium: data.isPremium, isAdmin: data.isAdmin, loading: false }))
      .catch(() => setState({ isPremium: false, isAdmin: false, loading: false }));
  }, [session, status]);

  return state;
}
