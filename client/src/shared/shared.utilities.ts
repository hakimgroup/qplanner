// src/utils/stateUtils.ts
import _ from "lodash";
import { parseISO, format } from "date-fns";

type State = Record<string, any>;
type SetState = React.Dispatch<React.SetStateAction<State>>;

/**
 * Update nested app state by path.
 * Example: updateState(setState, "filters.dateRange.from", newDate)
 */
export function updateState(setState: SetState, path: string, value: any) {
	setState((prev) => {
		const next = _.cloneDeep(prev);
		_.set(next, path, value);
		return next;
	});
}

type Availability = { from: string; to: string } | null;
export const normalizeAvailability = (input: unknown): Availability => {
	const MONTH_ABBR_TO_INDEX: Record<string, number> = {
		Jan: 0,
		Feb: 1,
		Mar: 2,
		Apr: 3,
		May: 4,
		Jun: 5,
		Jul: 6,
		Aug: 7,
		Sep: 8,
		Oct: 9,
		Nov: 10,
		Dec: 11,
	};

	const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n));

	if (!input) return null;

	// If it came in as a JSON string: {"from":"Sep","to":"Oct"}
	if (typeof input === "string") {
		try {
			const parsed = JSON.parse(input);
			if (parsed && typeof parsed === "object") input = parsed;
		} catch {
			return null;
		}
	}

	if (typeof input !== "object") return null;
	const av = input as { from?: string; to?: string };

	const fromIdx = av.from ? MONTH_ABBR_TO_INDEX[av.from] : undefined;
	const toIdx = av.to ? MONTH_ABBR_TO_INDEX[av.to] : undefined;

	if (fromIdx === undefined || toIdx === undefined) return null;

	const year = new Date().getFullYear();

	// First day of from-month
	const first = new Date(year, fromIdx, 1);
	// Last day of to-month (day 0 of next month)
	const last = new Date(year, toIdx + 1, 0);

	const fromStr = `${first.getFullYear()}-${pad2(
		first.getMonth() + 1
	)}-${pad2(first.getDate())}`;
	const toStr = `${last.getFullYear()}-${pad2(last.getMonth() + 1)}-${pad2(
		last.getDate()
	)}`;

	return { from: fromStr, to: toStr };
};

export const formatAvailabilityForUI = (av: Availability): string => {
	if (!av || !av.from || !av.to) return "—";
	try {
		const start = parseISO(av.from); // "2024-03-01"
		const end = parseISO(av.to); // "2024-03-31"
		const sameYear = start.getFullYear() === end.getFullYear();

		// Same year: "Mar 01 - Mar 31, 2024"
		if (sameYear) {
			return `${format(start, "MMM dd")} - ${format(
				end,
				"MMM dd, yyyy"
			)}`;
		}

		// Cross-year fallback: "Dec 01, 2024 - Jan 31, 2025"
		return `${format(start, "MMM dd, yyyy")} - ${format(
			end,
			"MMM dd, yyyy"
		)}`;
	} catch {
		return "—";
	}
};

// AuthProvider.tsx (inside file)
export const pushAuthNotice = (code: "denied" | "failed") => {
	// will survive the redirect to /login within same tab
	localStorage.setItem("auth_notice", code);
};

export function firstSentence(input: string): string {
	const clean = _.replace(_.trim(_.toString(input)), /\s+/g, " ");
	if (!clean) return "";
	const match = clean.match(/^.*?[.?!](?=(?:['")\]]+)?\s|$)/);
	if (match) return match[0];
	const nl = clean.indexOf("\n");
	return nl >= 0 ? clean.slice(0, nl) : clean;
}
