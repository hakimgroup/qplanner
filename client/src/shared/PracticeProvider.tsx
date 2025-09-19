// PracticeProvider.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/api/supabase";
import { DatabaseTables } from "./shared.models";

export type Practice = { id: string; name: string };

type PracticeCtx = {
	practices: Practice[];
	activePracticeId: string | null;
	setActivePracticeId: (id: string | null) => void;
	unitedView: boolean;
	setUnitedView: (v: boolean) => void;
};

const PracticeContext = createContext<PracticeCtx>({
	practices: [],
	activePracticeId: null,
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
			// RLS: returns only practices I can access
			const { data, error } = await supabase
				.from(DatabaseTables.Practices)
				.select("id, name")
				.order("name", { ascending: true });
			const list = (data ?? []) as Practice[];
			setPractices(list);

			// Default to first practice (alphabetical) for Select view
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
	}, []);

	const setActivePracticeId = (id: string | null) => {
		setActive(id);
		if (id) localStorage.setItem("active_practice_id", id);
		else localStorage.removeItem("active_practice_id");
	};

	const value = useMemo(
		() => ({
			practices,
			activePracticeId,
			setActivePracticeId,
			unitedView,
			setUnitedView,
		}),
		[practices, activePracticeId, unitedView]
	);

	return (
		<PracticeContext.Provider value={value}>
			{children}
		</PracticeContext.Provider>
	);
};
