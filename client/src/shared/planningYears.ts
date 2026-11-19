/**
 * Planning years and recurring catalog windows.
 *
 * A practice can book each catalog campaign once per year (the year of the
 * booking's start date). A campaign's `availability` is stored with one set of
 * dates (e.g. 1–25 Dec 2026) and recurs every year, so the same window is
 * offered for every open planning year.
 *
 * The SQL mirror of windowForYear() is campaign_window_for_year() in
 * supabase/supabase_bookings_per_year.sql; keep the two in step.
 */
import {
	addDays,
	addYears,
	endOfMonth,
	format,
	isAfter,
	isValid,
	parseISO,
	startOfDay,
} from "date-fns";

/**
 * The last year practices can book into. Bump this (e.g. to 2028) to open the
 * next year's planning; the current year is always open until it ends.
 */
export const LAST_PLANNING_YEAR = 2027;

/** Gradient for "Add 2027" / "Book for 2027" buttons: same look as the "Go To Admin View" button. */
export const ADD_YEAR_GRADIENT = { from: "violet", to: "indigo", deg: 135 };

/** Earliest a catalog booking can start, in days from today. */
export const BOOKING_LEAD_DAYS = 7;

export type Availability =
	| { from?: string | Date | null; to?: string | Date | null }
	| null
	| undefined;

export type DateWindow = { from: Date; to: Date };

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function toLocalDay(v: string | Date | null | undefined): Date | null {
	if (!v) return null;
	const d = v instanceof Date ? v : parseISO(v);
	return isValid(d) ? startOfDay(d) : null;
}

/** Years open for booking: this year up to LAST_PLANNING_YEAR. */
export function planningYears(today: Date = new Date()): number[] {
	const years: number[] = [];
	for (let y = today.getFullYear(); y <= LAST_PLANNING_YEAR; y++) years.push(y);
	return years.length ? years : [today.getFullYear()];
}

/**
 * The campaign's window moved into `year`, keeping its length (a window that
 * crosses New Year ends the following year). No availability = the whole year.
 */
export function windowForYear(av: Availability, year: number): DateWindow | null {
	const fromRaw = av?.from;
	const toRaw = av?.to;
	if (!fromRaw || !toRaw) {
		return { from: new Date(year, 0, 1), to: new Date(year, 11, 31) };
	}

	if (typeof fromRaw === "string" && typeof toRaw === "string") {
		const fm = MONTHS.indexOf(fromRaw.toUpperCase());
		const tm = MONTHS.indexOf(toRaw.toUpperCase());
		if (fm >= 0 && tm >= 0) {
			return {
				from: new Date(year, fm, 1),
				to: startOfDay(endOfMonth(new Date(tm < fm ? year + 1 : year, tm, 1))),
			};
		}
	}

	const from = toLocalDay(fromRaw);
	const to = toLocalDay(toRaw);
	if (!from || !to || isAfter(from, to)) return null;

	const shift = year - from.getFullYear();
	return { from: addYears(from, shift), to: addYears(to, shift) };
}

/**
 * The part of the `year` window that can still be booked (no sooner than the
 * lead time). Null when that year's window has already passed.
 */
export function bookableWindow(
	av: Availability,
	year: number,
	today: Date = new Date(),
): DateWindow | null {
	const w = windowForYear(av, year);
	if (!w) return null;
	const earliest = startOfDay(addDays(today, BOOKING_LEAD_DAYS));
	const from = isAfter(w.from, earliest) ? w.from : earliest;
	if (isAfter(from, w.to)) return null;
	return { from, to: w.to };
}

/** The year a booking counts against: the year of its start date. */
export function bookingYear(fromDate: string | Date | null | undefined): number | null {
	const d = toLocalDay(fromDate ?? null);
	return d ? d.getFullYear() : null;
}

/**
 * Open planning years this campaign can still be booked for, leaving out the
 * years already booked.
 */
export function bookableYears(
	av: Availability,
	bookedYears: Iterable<number> = [],
	today: Date = new Date(),
): number[] {
	const booked = new Set(bookedYears);
	return planningYears(today).filter(
		(y) => !booked.has(y) && bookableWindow(av, y, today) !== null,
	);
}

/**
 * The year to pre-select when booking: the first year whose window hasn't
 * started yet (so a running year-round campaign defaults to next year), else
 * the first bookable year.
 */
export function defaultBookingYear(
	av: Availability,
	years: number[],
	today: Date = new Date(),
): number | null {
	if (!years.length) return null;
	const earliest = startOfDay(addDays(today, BOOKING_LEAD_DAYS));
	const notStarted = years.find((y) => {
		const w = windowForYear(av, y);
		return w ? !isAfter(earliest, w.from) : false;
	});
	return notStarted ?? years[0];
}

/**
 * Whether the campaign's recurring window overlaps [from, to] in any year.
 * Open-ended sides are unbounded; no range at all always matches.
 */
export function windowOverlapsRange(
	av: Availability,
	from?: Date | null,
	to?: Date | null,
	today: Date = new Date(),
): boolean {
	if (!from && !to) return true;
	const start = from ? startOfDay(from) : null;
	const end = to ? startOfDay(to) : null;
	const firstYear = (start ?? today).getFullYear() - 1;
	const lastYear = Math.min((end ?? addYears(today, 1)).getFullYear(), firstYear + 10);
	for (let y = firstYear; y <= lastYear; y++) {
		const w = windowForYear(av, y);
		if (!w) continue;
		const startsBeforeEnd = !end || !isAfter(w.from, end);
		const endsAfterStart = !start || !isAfter(start, w.to);
		if (startsBeforeEnd && endsAfterStart) return true;
	}
	return false;
}

/**
 * A catalog campaign's recurring window for display, without a year:
 * "Dec 01 - Dec 25", or "All year".
 */
export function formatRecurringWindow(av: Availability): string {
	if (!av?.from || !av?.to) return "All year";
	const w = windowForYear(av, new Date().getFullYear());
	if (!w) return "—";
	const allYear =
		w.from.getMonth() === 0 &&
		w.from.getDate() === 1 &&
		w.to.getMonth() === 11 &&
		w.to.getDate() === 31;
	if (allYear) return "All year";
	return `${format(w.from, "MMM dd")} - ${format(w.to, "MMM dd")}`;
}
