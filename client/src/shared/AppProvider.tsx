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
import { CampaignBooking } from "@/models/campaign.models";
import {
  bookableYears,
  bookingYear,
  windowOverlapsRange,
} from "./planningYears";

type Availability = { from: string; to: string } | null;

// ✅ stable empties
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

  // 1) Fetch dynamic filter options from RPC
  const { data: rpcFilterOptions } = useFilterOptions();

  // 2) Fetch selections & campaigns
  const { data: selectionsRaw } = useSelections();
  const selections = (selectionsRaw ?? EMPTY_ARR_SEL) as any[];

  const [state, setState] = useState(appStateDefault);

  const campaignsQuery = useAllCampaigns(practiceParam);
  const fetchedCampaigns = (campaignsQuery.data ?? EMPTY_ARR) as any[];
  const isFetching = campaignsQuery.isFetching;

  // get_campaigns_v2 returns one row per booking (a campaign can be booked once
  // per year). Attach every booking of the same catalog campaign to each of its
  // rows, so cards and the drawer know which years are already taken.
  const rawCampaigns = useMemo(() => {
    const byCampaign = new Map<string, CampaignBooking[]>();
    for (const c of fetchedCampaigns) {
      if (!c?.selected || c?.is_bespoke || !c?.selection_id || !c?.id) continue;
      const year = bookingYear(c.selection_from_date);
      if (year === null) continue;
      const list = byCampaign.get(c.id) ?? [];
      list.push({
        selection_id: c.selection_id,
        year,
        status: c.status,
        from: c.selection_from_date,
        to: c.selection_to_date,
        practice_id: c.selection_practice_id,
      });
      byCampaign.set(c.id, list);
    }
    if (byCampaign.size === 0) return fetchedCampaigns;
    return fetchedCampaigns.map((c) =>
      !c?.is_bespoke && byCampaign.has(c?.id)
        ? {
            ...c,
            bookings: [...byCampaign.get(c.id)!].sort((a, b) => a.year - b.year),
          }
        : c
    );
  }, [fetchedCampaigns]);

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
  const hasPlans = useMemo<boolean>(() => selections.length > 0, [selections]);

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
      String(userSelectedTab ?? "").toLowerCase() === UserTabModes.Selected;

    return rawCampaigns.filter((c: any) => {
      if (isSelectedTab && !c.selected) return false;
      // Browse shows each catalog campaign once; My Plan shows every booking.
      if (!isSelectedTab && c.is_primary === false) return false;

      // Bookings are filtered by their own dates; catalog campaigns by their
      // availability window, which recurs every year.
      const useBookingDates = c.selected && (isSelectedTab || c.is_bespoke);
      const inRange = useBookingDates
        ? overlapsWithSelected(
            c.selection_from_date && c.selection_to_date
              ? { from: c.selection_from_date, to: c.selection_to_date }
              : null,
            dateRange?.from,
            dateRange?.to
          )
        : windowOverlapsRange(
            c?.availability ?? null,
            toDate(dateRange?.from),
            toDate(dateRange?.to)
          );
      if (!inRange) return false;

      // Normalize the campaign categories into tokens
      const catTokens = String(c?.category ?? "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      // If user selected any categories, keep the row only if there's any match
      if (
        (categories?.length ?? 0) > 0 &&
        !categories.some((sel) => catTokens.includes(String(sel).toLowerCase()))
      ) {
        return false;
      }

      if (!includesAll(c?.objectives as string[] | undefined, objectives ?? []))
        return false;

      if (!includesAll(c?.topics as string[] | undefined, topics ?? []))
        return false;

      // "Hide placed items": hide a catalog campaign only once it can't be
      // booked for any other open year.
      if (!isSelectedTab && !unitedView && hideSelected && c.selected) {
        const fullyBooked =
          c.is_bespoke ||
          bookableYears(
            c.availability,
            (c.bookings ?? []).map((b: CampaignBooking) => b.year)
          ).length === 0;
        if (fullyBooked) return false;
      }

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

  const value: AppContextModel = useMemo(() => ({ state, setState }), [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;
