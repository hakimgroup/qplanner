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
		if (!user) return; // no session yet → skip
		setLoading(true);
		const { data, error } = await supabase
			.from(DatabaseTables.CampaignsCatalog) // e.g. "campaigns_catalog"
			.select("id, tier")
			.in("tier", ["good", "better", "best"]); // only the labeled tiers

		if (!error && Array.isArray(data)) {
			const g: string[] = [];
			const b: string[] = [];
			const B: string[] = [];

			for (const row of data as Array<{
				id: string;
				tier: string | null;
			}>) {
				if (row.tier === "good") g.push(row.id);
				else if (row.tier === "better") b.push(row.id);
				else if (row.tier === "best") B.push(row.id);
			}

			setGood(g);
			setBetter(b);
			setBest(B);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchTiers();
		// Optional: live updates when a campaign tier changes
		if (!user) return;

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
	}, [user?.id]); // refetch/subscribe when auth becomes available

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
