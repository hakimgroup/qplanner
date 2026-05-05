// shared/TierProvider.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/api/supabase";
import { useAuth } from "@/shared/AuthProvider";
import { DatabaseTables } from "@/shared/shared.models";

type TierContextModel = {
	goodIds: string[];
	betterIds: string[];
	bestIds: string[];
	loading: boolean;
	refresh: () => void;
};

const TierContext = createContext<TierContextModel>({
	goodIds: [],
	betterIds: [],
	bestIds: [],
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
	const [loading, setLoading] = useState<boolean>(false);

	const fetchTiers = async () => {
		if (!user) return;
		setLoading(true);

		// Fetch tier rows. We filter hidden + ISO-date-expired client-side
		// so a campaign that's been hidden or rolled past its 'to' date
		// stops appearing in Quick Populate batches silently.
		const { data, error } = await supabase
			.from(DatabaseTables.CampaignsCatalog)
			.select("id, tiers, hidden, availability")
			.overlaps("tiers", ["good", "better", "best"])
			.eq("hidden", false);

		if (!error && Array.isArray(data)) {
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			const isExpired = (availability: any): boolean => {
				const to = availability?.to;
				if (typeof to !== "string") return false;
				// Month codes (JAN, FEB, ...) recur every year and never expire.
				if (!/^\d{4}-\d{2}-\d{2}$/.test(to)) return false;
				const toDate = new Date(to);
				return toDate < today;
			};

			const good = new Set<string>();
			const better = new Set<string>();
			const best = new Set<string>();

			for (const row of data as Array<{
				id: string;
				tiers: string[] | null;
				hidden: boolean;
				availability: { from?: string; to?: string } | null;
			}>) {
				if (isExpired(row.availability)) continue;

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
			loading,
			refresh: fetchTiers,
		}),
		[goodIds, betterIds, bestIds, loading]
	);

	return (
		<TierContext.Provider value={value}>{children}</TierContext.Provider>
	);
};
