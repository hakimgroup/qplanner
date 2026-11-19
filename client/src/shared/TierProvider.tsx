// shared/TierProvider.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/api/supabase";
import { useAuth } from "@/shared/AuthProvider";
import { DatabaseTables } from "@/shared/shared.models";
import { Availability } from "@/shared/planningYears";

type TierContextModel = {
	goodIds: string[];
	betterIds: string[];
	bestIds: string[];
	/** Each tier campaign's availability window (recurs every year). */
	availabilityById: Record<string, Availability>;
	loading: boolean;
	refresh: () => void;
};

const TierContext = createContext<TierContextModel>({
	goodIds: [],
	betterIds: [],
	bestIds: [],
	availabilityById: {},
	loading: false,
	refresh: () => {},
});

export const useTiers = () => useContext(TierContext);

export const TierProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { user } = useAuth(); // only fetch when signed in
	const [goodIds, setGood] = useState<string[]>([]);
	const [betterIds, setBetter] = useState<string[]>([]);
	const [bestIds, setBest] = useState<string[]>([]);
	const [availabilityById, setAvailabilityById] = useState<
		Record<string, Availability>
	>({});
	const [loading, setLoading] = useState<boolean>(false);

	const fetchTiers = async () => {
		if (!user) return;
		setLoading(true);

		// Fetch tier rows (hidden ones excluded). Availability windows recur
		// every year, so Quick Populate filters by the year being planned.
		const { data, error } = await supabase
			.from(DatabaseTables.CampaignsCatalog)
			.select("id, tiers, hidden, availability")
			.overlaps("tiers", ["good", "better", "best"])
			.eq("hidden", false);

		if (!error && Array.isArray(data)) {
			const good = new Set<string>();
			const windows: Record<string, Availability> = {};
			const better = new Set<string>();
			const best = new Set<string>();

			for (const row of data as Array<{
				id: string;
				tiers: string[] | null;
				hidden: boolean;
				availability: { from?: string; to?: string } | null;
			}>) {
				windows[row.id] = row.availability;

				const tArr = Array.isArray(row.tiers)
					? row.tiers.map((t) => t?.toLowerCase?.() ?? t)
					: [];

				if (tArr.includes("good")) good.add(row.id);
				if (tArr.includes("better")) better.add(row.id);
				if (tArr.includes("best")) best.add(row.id);
			}

			setGood([...good]);
			setBetter([...better]);
			setBest([...best]);
			setAvailabilityById(windows);
		}

		setLoading(false);
	};

	useEffect(() => {
		fetchTiers();
		if (!user) return;

		// Live updates on inserts/updates/deletes
		const channel = supabase
			.channel("tiers-live")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: DatabaseTables.CampaignsCatalog,
				},
				() => fetchTiers()
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.id]);

	const value = useMemo<TierContextModel>(
		() => ({
			goodIds,
			betterIds,
			bestIds,
			availabilityById,
			loading,
			refresh: fetchTiers,
		}),
		[goodIds, betterIds, bestIds, availabilityById, loading]
	);

	return (
		<TierContext.Provider value={value}>{children}</TierContext.Provider>
	);
};
