/* AppProvider.tsx */
import { useState, useMemo, useEffect } from "react";
import AppContext, { AppContextModel } from "./AppContext";
import { appStateDefault } from "./shared.const";
import { useAllCampaigns } from "@/hooks/campaign.hooks";
import {
	parseISO,
	isValid as isValidDate,
	areIntervalsOverlapping,
} from "date-fns";
import { useSelections } from "@/hooks/selection.hooks";
import { usePractice } from "./PracticeProvider";
import { UserTabModes } from "@/models/general.models";
import { useFilterOptions } from "@/hooks/general.hooks";

type Availability = { from: string; to: string } | null;

// ✅ stable empties
const EMPTY_ARR: any[] = [];
const EMPTY_ARR_SEL: any[] = [];

// shallow equality for string arrays
const sameStrArr = (a?: string[], b?: string[]) => {
	if (a === b) return true;
	if (!a?.length && !b?.length) return true;
	if ((a?.length ?? 0) !== (b?.length ?? 0)) return false;
	for (let i = 0; i < (a?.length ?? 0); i++) {
		if (a![i] !== b![i]) return false;
	}
	return true;
};

function toDate(input: unknown): Date | null {
	if (!input) return null;
	if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
	if (typeof input === "string") {
		const d = parseISO(input);
		return isValidDate(d) ? d : null;
	}
	return null;
}

function overlapsWithSelected(
	av: Availability,
	selFrom?: unknown,
	selTo?: unknown
): boolean {
	const hasSelFrom = !!selFrom;
	const hasSelTo = !!selTo;

	if (!hasSelFrom && !hasSelTo) return true;
	if (!av) return false;

	const cFrom = toDate(av.from);
	const cTo = toDate(av.to);
	if (!cFrom || !cTo) return false;

	const sFrom = toDate(selFrom as any);
	const sTo = toDate(selTo as any);

	const FAR_PAST = new Date(1900, 0, 1);
	const FAR_FUTURE = new Date(2999, 11, 31);

	const selStart = sFrom ?? FAR_PAST;
	const selEnd = sTo ?? FAR_FUTURE;

	return areIntervalsOverlapping(
		{ start: cFrom, end: cTo },
		{ start: selStart, end: selEnd },
		{ inclusive: true }
	);
}

function includesAll(
	source: string[] | undefined,
	selected: string[]
): boolean {
	if (!selected?.length) return true;
	if (!source?.length) return false;
	return selected.some((x) => source.includes(x));
}

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { unitedView, activePracticeId } = usePractice();
	const practiceParam = unitedView ? null : activePracticeId;

	// 1) Fetch dynamic filter options from RPC
	const { data: rpcFilterOptions } = useFilterOptions();

	// 2) Fetch selections & campaigns
	const { data: selectionsRaw } = useSelections();
	const selections = (selectionsRaw ?? EMPTY_ARR_SEL) as any[];

	const [state, setState] = useState(appStateDefault);

	const campaignsQuery = useAllCampaigns(practiceParam);
	const rawCampaigns = (campaignsQuery.data ?? EMPTY_ARR) as any[];
	const isFetching = campaignsQuery.isFetching;

	// === Keep app-level filtersOptions in sync with RPC ===
	useEffect(() => {
		if (!rpcFilterOptions) return;

		// normalize + dedupe + sort for stable comparisons
		const norm = (arr?: string[]) =>
			Array.from(new Set((arr ?? []).filter(Boolean))).sort();

		const next = {
			objectives: norm(rpcFilterOptions.objectives),
			topics: norm(rpcFilterOptions.topics),
			categories: norm(rpcFilterOptions.categories),
		};

		setState((prev) => {
			const prevFO = (prev as any).filtersOptions ?? {
				objectives: [],
				topics: [],
				categories: [],
			};

			const sameStrArr = (a?: string[], b?: string[]) => {
				if (a === b) return true;
				if (!a?.length && !b?.length) return true;
				if ((a?.length ?? 0) !== (b?.length ?? 0)) return false;
				for (let i = 0; i < (a?.length ?? 0); i++) {
					if (a![i] !== b![i]) return false;
				}
				return true;
			};

			const unchanged =
				sameStrArr(prevFO.objectives, next.objectives) &&
				sameStrArr(prevFO.topics, next.topics) &&
				sameStrArr(prevFO.categories, next.categories);

			if (unchanged) return prev;

			return {
				...prev,
				// ✅ correct key (matches appStateDefault)
				filtersOptions: next,
			};
		});
	}, [rpcFilterOptions]);

	// TRUE if the user has added any plan
	const hasPlans = useMemo<boolean>(
		() => selections.length > 0,
		[selections]
	);

	// Compute filtered campaigns from app-level filters
	const filteredCampaigns = useMemo(() => {
		const { filters } = state;
		const {
			dateRange,
			categories,
			objectives,
			topics,
			hideSelected,
			userSelectedTab,
		} = filters;

		const isSelectedTab =
			String(userSelectedTab ?? "").toLowerCase() ===
			UserTabModes.Selected;

		return rawCampaigns.filter((c: any) => {
			if (isSelectedTab && !c.selected) return false;

			if (
				!overlapsWithSelected(
					c?.availability ?? null,
					dateRange?.from,
					dateRange?.to
				)
			)
				return false;

			// Normalize the campaign categories into tokens
			const catTokens = String(c?.category ?? "")
				.split(",")
				.map((s) => s.trim().toLowerCase())
				.filter(Boolean);

			// If user selected any categories, keep the row only if there's any match
			if (
				(categories?.length ?? 0) > 0 &&
				!categories.some((sel) =>
					catTokens.includes(String(sel).toLowerCase())
				)
			) {
				return false;
			}

			if (
				!includesAll(
					c?.objectives as string[] | undefined,
					objectives ?? []
				)
			)
				return false;

			if (!includesAll(c?.topics as string[] | undefined, topics ?? []))
				return false;

			if (!isSelectedTab && !unitedView && hideSelected && c.selected)
				return false;

			return true;
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rawCampaigns, state.filters, unitedView]);

	// Guarded state update to prevent loops/flashes
	useEffect(() => {
		setState((prev) => {
			const prevAll = prev.allCampaigns;

			const nextLoading = isFetching;
			const nextHasPlans = hasPlans;
			const nextData = filteredCampaigns;

			const loadingChanged = prevAll.loading !== nextLoading;
			const hasPlansChanged = prevAll.hasPlans !== nextHasPlans;
			const dataChanged = prevAll.data !== nextData;

			if (!loadingChanged && !hasPlansChanged && !dataChanged) {
				return prev; // no-op
			}

			return {
				...prev,
				allCampaigns: {
					...prevAll,
					loading: nextLoading,
					hasPlans: nextHasPlans,
					data: nextData,
				},
			};
		});
	}, [isFetching, filteredCampaigns, hasPlans]);

	const value: AppContextModel = useMemo(
		() => ({ state, setState }),
		[state]
	);

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;
