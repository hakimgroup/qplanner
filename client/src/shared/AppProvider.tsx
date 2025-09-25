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

type Availability = { from: string; to: string } | null;

// ✅ stable empties (same reference across renders)
const EMPTY_ARR: any[] = [];
const EMPTY_ARR_SEL: any[] = [];

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

	// 🚫 avoid "= []" default; use stable ref instead
	const { data: selectionsRaw } = useSelections();
	const selections = (selectionsRaw ?? EMPTY_ARR_SEL) as any[];

	const [state, setState] = useState(appStateDefault);

	// 🚫 avoid "= []" default; use stable ref instead
	const campaignsQuery = useAllCampaigns(practiceParam);
	const rawCampaigns = (campaignsQuery.data ?? EMPTY_ARR) as any[];
	const isFetching = campaignsQuery.isFetching;

	// TRUE if the user has added any plan
	const hasPlans = useMemo<boolean>(() => {
		return selections.length > 0;
	}, [selections]);

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

			if (
				categories?.length &&
				!categories.includes(String(c?.category ?? ""))
			)
				return false;

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
			const dataChanged = prevAll.data !== nextData; // ref compare (stable due to memo + stable empties)

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
