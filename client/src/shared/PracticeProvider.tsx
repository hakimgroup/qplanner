// PracticeProvider.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/api/supabase";
import { DatabaseTables } from "./shared.models";

export type Practice = { id: string; name: string; numberOfPlans?: number };

type PracticeCtx = {
	practices: Practice[];
	activePracticeId: string | null;
	activePracticeName: string | null; // ← NEW
	setActivePracticeId: (id: string | null) => void;
	unitedView: boolean;
	setUnitedView: (v: boolean) => void;
};

const PracticeContext = createContext<PracticeCtx>({
	practices: [],
	activePracticeId: null,
	activePracticeName: null, // ← NEW default
	setActivePracticeId: () => {},
	unitedView: false,
	setUnitedView: () => {},
});

export const usePractice = () => useContext(PracticeContext);

export const PracticeProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [practices, setPractices] = useState<Practice[]>([]);
	const [activePracticeId, setActive] = useState<string | null>(() =>
		localStorage.getItem("active_practice_id")
	);
	const [unitedView, setUnitedView] = useState<boolean>(false);

	useEffect(() => {
		(async () => {
			// RLS: returns only practices the current user can access
			const { data } = await supabase
				.from(DatabaseTables.Practices)
				.select("id, name")
				.order("name", { ascending: true });

			const list = (data ?? []) as Practice[];
			setPractices(list);

			// Default to first practice (alphabetical)
			if (list.length === 0) {
				setActive(null);
				localStorage.removeItem("active_practice_id");
				return;
			}

			if (
				!activePracticeId ||
				!list.some((p) => p.id === activePracticeId)
			) {
				const first = list[0].id;
				setActive(first);
				localStorage.setItem("active_practice_id", first);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // run once on mount (initial bootstrap)

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
			activePracticeName, // ← NEW in context value
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
