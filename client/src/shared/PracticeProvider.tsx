// PracticeProvider.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/api/supabase";
import { DatabaseTables } from "./shared.models";
import { useAuth } from "./AuthProvider"; // ← use auth to know if signed in

export type Practice = { id: string; name: string; numberOfPlans?: number };

type PracticeCtx = {
  practices: Practice[];
  activePracticeId: string | null;
  activePracticeName: string | null;
  setActivePracticeId: (id: string | null) => void;
  unitedView: boolean;
  setUnitedView: (v: boolean) => void;
};

const PracticeContext = createContext<PracticeCtx>({
  practices: [],
  activePracticeId: null,
  activePracticeName: null,
  unitedView: false,
  setUnitedView: () => {},
  setActivePracticeId: () => {},
});

export const usePractice = () => useContext(PracticeContext);

export const PracticeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth(); // ← signed-in user (null when logged out)

  const [practices, setPractices] = useState<Practice[]>([]);
  const [activePracticeId, setActive] = useState<string | null>(() =>
    localStorage.getItem("active_practice_id")
  );
  const [unitedView, setUnitedView] = useState<boolean>(false);

  // Fetch practices only when user is signed in
  useEffect(() => {
    let cancelled = false;

    async function loadPractices() {
      // If no user, don't fetch; also clear state to avoid stale access
      if (!user) {
        setPractices([]);
        setActive(null);
        localStorage.removeItem("active_practice_id");
        return;
      }

      const { data, error } = await supabase
        .from(DatabaseTables.Practices)
        .select("id, name")
        .order("name", { ascending: true });

      if (cancelled) return;

      if (error) {
        // keep prior state if fetch fails; optionally log
        return;
      }

      const list = (data ?? []) as Practice[];
      setPractices(list);

      // Default to first practice (alphabetical)
      if (list.length === 0) {
        setActive(null);
        localStorage.removeItem("active_practice_id");
        return;
      }

      if (!activePracticeId || !list.some((p) => p.id === activePracticeId)) {
        const first = list[0].id;
        setActive(first);
        localStorage.setItem("active_practice_id", first);
      }
    }

    loadPractices();
    return () => {
      cancelled = true;
    };
    // Re-run when auth user changes
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const setActivePracticeId = (id: string | null) => {
    setActive(id);
    if (id) localStorage.setItem("active_practice_id", id);
    else localStorage.removeItem("active_practice_id");
  };

  // Derive active practice name from id (and optionally reflect united view)
  const activePracticeName = useMemo<string | null>(() => {
    if (unitedView) return "United View";
    if (!activePracticeId) return null;
    const found = practices.find((p) => p.id === activePracticeId);
    return found?.name ?? null;
  }, [practices, activePracticeId, unitedView]);

  const value = useMemo<PracticeCtx>(
    () => ({
      practices,
      activePracticeId,
      activePracticeName,
      setActivePracticeId,
      unitedView,
      setUnitedView,
    }),
    [practices, activePracticeId, activePracticeName, unitedView]
  );

  return (
    <PracticeContext.Provider value={value}>
      {children}
    </PracticeContext.Provider>
  );
};
