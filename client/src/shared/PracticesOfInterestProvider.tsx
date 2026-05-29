// shared/PracticesOfInterestProvider.tsx
//
// Per-user "Practices of Interest" feature. Super-admin marketing execs can
// mark practices they're responsible for. A global view-mode toggle lets them
// switch between viewing ALL practices and only their POI list (hard scope —
// non-POI practices disappear from filter dropdowns and tables everywhere
// except the practices directory).

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { supabase } from "@/api/supabase";
import { useAuth } from "@/shared/AuthProvider";
import { usePractice, type Practice } from "@/shared/PracticeProvider";
import { RPCFunctions } from "@/shared/shared.models";

export type ViewMode = "all" | "poi";

export type PracticeOfInterest = {
	practice_id: string;
	practice_name: string;
	address: string | null;
	post_code: string | null;
	added_at: string;
};

type ContextModel = {
	/** Full list of POI records for the current user (with practice details). */
	poi: PracticeOfInterest[];
	/** Convenience: array of practice IDs in the POI list. */
	poiPracticeIds: string[];
	/** Set of IDs for O(1) membership checks. */
	poiPracticeIdSet: Set<string>;
	/** 'all' = show every practice. 'poi' = scope to the user's list. */
	viewMode: ViewMode;
	setViewMode: (m: ViewMode) => void;
	/** True only if the current user is a super_admin (feature gate). */
	isEnabled: boolean;
	loading: boolean;
	refresh: () => Promise<void>;
	addPractice: (practiceId: string) => Promise<boolean>;
	removePractice: (practiceId: string) => Promise<boolean>;
};

const DEFAULT_CTX: ContextModel = {
	poi: [],
	poiPracticeIds: [],
	poiPracticeIdSet: new Set(),
	viewMode: "all",
	setViewMode: () => {},
	isEnabled: false,
	loading: false,
	refresh: async () => {},
	addPractice: async () => false,
	removePractice: async () => false,
};

const POIContext = createContext<ContextModel>(DEFAULT_CTX);

export const usePracticesOfInterest = () => useContext(POIContext);

const LS_KEY = "poi.viewMode";

function loadViewMode(): ViewMode {
	try {
		const raw = window.localStorage.getItem(LS_KEY);
		if (raw === "poi" || raw === "all") return raw;
	} catch {
		/* ignore */
	}
	return "all";
}

function saveViewMode(m: ViewMode) {
	try {
		window.localStorage.setItem(LS_KEY, m);
	} catch {
		/* ignore */
	}
}

export const PracticesOfInterestProvider: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	const { user, role } = useAuth();
	const isEnabled = role === "super_admin";

	const [poi, setPoi] = useState<PracticeOfInterest[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [viewMode, setViewModeState] = useState<ViewMode>(() => loadViewMode());

	const refresh = useCallback(async () => {
		if (!user || !isEnabled) {
			setPoi([]);
			return;
		}
		setLoading(true);
		try {
			const { data, error } = await supabase.rpc(
				RPCFunctions.ListPracticesOfInterest,
			);
			if (!error && Array.isArray(data)) {
				setPoi(data as PracticeOfInterest[]);
			} else if (error) {
				console.error("[POI] list error:", error.message);
				setPoi([]);
			}
		} finally {
			setLoading(false);
		}
	}, [user, isEnabled]);

	const addPractice = useCallback(
		async (practiceId: string) => {
			if (!isEnabled) return false;
			const { data, error } = await supabase.rpc(
				RPCFunctions.AddPracticeOfInterest,
				{ p_practice_id: practiceId },
			);
			if (error || (data && !data.success)) {
				console.error(
					"[POI] add error:",
					error?.message ?? data?.error,
				);
				return false;
			}
			await refresh();
			return true;
		},
		[isEnabled, refresh],
	);

	const removePractice = useCallback(
		async (practiceId: string) => {
			if (!isEnabled) return false;
			const { data, error } = await supabase.rpc(
				RPCFunctions.RemovePracticeOfInterest,
				{ p_practice_id: practiceId },
			);
			if (error || (data && !data.success)) {
				console.error(
					"[POI] remove error:",
					error?.message ?? data?.error,
				);
				return false;
			}
			await refresh();
			return true;
		},
		[isEnabled, refresh],
	);

	const setViewMode = useCallback((m: ViewMode) => {
		setViewModeState(m);
		saveViewMode(m);
	}, []);

	// Fetch POI list when user/role becomes available
	useEffect(() => {
		refresh();
	}, [refresh]);

	// If user loses super_admin role, force viewMode back to 'all' to avoid
	// the global toggle being stuck "on" with no way to flip it off.
	useEffect(() => {
		if (!isEnabled && viewMode !== "all") {
			setViewMode("all");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isEnabled]);

	const value = useMemo<ContextModel>(() => {
		const ids = poi.map((p) => p.practice_id);
		return {
			poi,
			poiPracticeIds: ids,
			poiPracticeIdSet: new Set(ids),
			viewMode,
			setViewMode,
			isEnabled,
			loading,
			refresh,
			addPractice,
			removePractice,
		};
	}, [
		poi,
		viewMode,
		setViewMode,
		isEnabled,
		loading,
		refresh,
		addPractice,
		removePractice,
	]);

	return <POIContext.Provider value={value}>{children}</POIContext.Provider>;
};

/**
 * Returns the practice list scoped to the active POI view mode.
 *
 * - viewMode='all' OR POI feature disabled → full practices list
 * - viewMode='poi' AND user is super_admin → only practices on the user's POI list
 *
 * Admin screens that previously read `usePractice().practices` should swap to
 * this hook so the global POI toggle applies automatically.
 */
export function useScopedPractices(): {
	practices: Practice[];
	isPoiActive: boolean;
	isPoiEmpty: boolean;
} {
	const { practices } = usePractice();
	const { viewMode, isEnabled, poiPracticeIdSet } = usePracticesOfInterest();

	const isPoiActive = isEnabled && viewMode === "poi";

	const scoped = useMemo(() => {
		if (!isPoiActive) return practices;
		return practices.filter((p) => poiPracticeIdSet.has(p.id));
	}, [practices, isPoiActive, poiPracticeIdSet]);

	return {
		practices: scoped,
		isPoiActive,
		isPoiEmpty: isPoiActive && scoped.length === 0,
	};
}
