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

	if (!hasSelFrom && !hasSelTo) return true; // no date filter -> no restriction
	if (!av) return false; // user filtered by date, but campaign has no availability

	const cFrom = toDate(av.from);
	const cTo = toDate(av.to);
	if (!cFrom || !cTo) return false;

	const sFrom = toDate(selFrom as any);
	const sTo = toDate(selTo as any);

	// Build a wide interval if only one bound given
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
	if (!selected?.length) return true; // nothing selected → pass
	if (!source?.length) return false;
	// OR semantics: pass if there is any intersection
	return selected.some((x) => source.includes(x));
}

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { unitedView, activePracticeId } = usePractice();
	const { data: selections = [] } = useSelections();
	const [state, setState] = useState(appStateDefault); // full app state

	// Fetch raw campaigns once (or as your hook dictates)
	const { data: rawCampaigns = [], isFetching } =
		useAllCampaigns(activePracticeId);

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

		// Build a set of campaign_ids that are already On Plan for the CURRENT PRACTICE.
		// (United View is typically not used for browsing the catalog.)
		const onPlanSetCurrent = new Set<string>(
			selections.map((s: any) => String(s.campaign_id))
		);

		// Augment rows with a `selected` flag based on current practice selections
		const augmented = (rawCampaigns as any[]).map((c) => ({
			...c,
			selected: onPlanSetCurrent.has(String(c.id)),
		}));

		return augmented.filter((c) => {
			// If we're on the Selected tab, only show items already on plan
			if (isSelectedTab && !c.selected) return false;

			// Date range (overlap)
			if (
				!overlapsWithSelected(
					c?.availability ?? null,
					dateRange?.from,
					dateRange?.to
				)
			)
				return false;

			// Category facet (OR within selected categories)
			if (
				categories?.length &&
				!categories.includes(String(c?.category ?? ""))
			)
				return false;

			// Objectives (OR semantics here)
			if (
				!includesAll(
					c?.objectives as string[] | undefined,
					objectives ?? []
				)
			)
				return false;

			// Topics (OR semantics here)
			if (!includesAll(c?.topics as string[] | undefined, topics ?? []))
				return false;

			// Hide already-selected (only meaningful on Browse; ignore on Selected tab)
			if (!isSelectedTab && !unitedView && hideSelected && c.selected)
				return false;

			return true;
		});
	}, [rawCampaigns, state.filters, selections, unitedView]);

	// Push filtered results + loading flag into global state
	useEffect(() => {
		setState((prev) => ({
			...prev,
			allCampaigns: {
				loading: isFetching,
				data: filteredCampaigns,
			},
		}));
	}, [isFetching, filteredCampaigns]);

	const value: AppContextModel = useMemo(
		() => ({ state, setState }),
		[state]
	);

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;
