/**
 * Shared client-side behaviour for the Q4 "Unlock Your Practice Potential"
 * landing pages. These reproduce the vanilla-JS interactions from the standalone
 * microsite (reveal-on-scroll, sticky header, scrollspy, smooth in-page anchors,
 * the typographic widow rule) as React hooks, scoped to each page's lifetime.
 *
 * Deliberately kept separate from the Q3 `_uypp/uypp.ts`: Q3 is live and its
 * pages should not move when Q4 changes.
 */
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

const prefersReducedMotion = () =>
	typeof window !== "undefined" &&
	typeof window.matchMedia === "function" &&
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Base public path for Q4 static assets. */
export const ASSETS = "/landing-assets/uypp-q4";

/** `img("bf-strip.jpg")` -> "/landing-assets/uypp-q4/img/bf-strip.jpg" */
export const img = (file: string) => `${ASSETS}/img/${file}`;

/** Convenience typed root ref for a page wrapper div. */
export function usePageRef() {
	return useRef<HTMLDivElement>(null);
}

/**
 * Reveal-on-scroll. Adds `in` to every `.reveal` inside `root` as it enters the
 * viewport, one-shot. Shows everything immediately when IntersectionObserver is
 * missing or the visitor prefers reduced motion.
 *
 * Re-runs when `deps` changes so content rendered later — an expanded panel, a
 * swapped creative route — still animates in rather than staying invisible.
 */
export function useReveal(root: RefObject<HTMLElement>, deps: unknown[] = []) {
	useEffect(() => {
		const el = root.current;
		if (!el) return;
		const reveals = Array.from(
			el.querySelectorAll<HTMLElement>(".reveal:not(.in)")
		);
		if (!reveals.length) return;
		if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
			reveals.forEach((r) => r.classList.add("in"));
			return;
		}
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("in");
						io.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
		);
		reveals.forEach((r) => io.observe(r));
		return () => io.disconnect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [root, ...deps]);
}

/** True once the page has scrolled past 8px — drives the sticky-header shadow. */
export function useStickyHeader() {
	const [stuck, setStuck] = useState(false);
	useEffect(() => {
		const onScroll = () => setStuck(window.scrollY > 8);
		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();
		return () => window.removeEventListener("scroll", onScroll);
	}, []);
	return stuck;
}

/**
 * Which of the given section ids is currently in view.
 *
 * The band is the middle 40% of the viewport and the winner is whichever section
 * overlaps it most — not simply whichever entry fired last. These sections are
 * thousands of pixels tall, so a threshold-based test can never be satisfied;
 * that bug meant no nav chip ever lit up on the standalone build until it was
 * fixed in August. Keep the geometry test.
 */
export function useScrollSpy(ids: string[]) {
	const key = ids.join(",");
	const [active, setActive] = useState<string | null>(null);
	useEffect(() => {
		if (!("IntersectionObserver" in window)) return;
		const sections = key
			.split(",")
			.map((id) => document.getElementById(id))
			.filter((s): s is HTMLElement => Boolean(s));
		if (!sections.length) return;
		const pick = () => {
			const bandTop = window.innerHeight * 0.2;
			const bandBottom = window.innerHeight * 0.6;
			let best: { id: string; overlap: number } | null = null;
			sections.forEach((s) => {
				const r = s.getBoundingClientRect();
				const overlap =
					Math.min(r.bottom, bandBottom) - Math.max(r.top, bandTop);
				if (overlap > 0 && (!best || overlap > best.overlap)) {
					best = { id: s.id, overlap };
				}
			});
			setActive(best ? best.id : null);
		};
		const spy = new IntersectionObserver(pick, {
			threshold: 0,
			rootMargin: "-20% 0px -40% 0px",
		});
		sections.forEach((s) => spy.observe(s));
		pick();
		return () => spy.disconnect();
	}, [key]);
	return active;
}

/**
 * Smooth in-page anchors with a header offset while the page is mounted,
 * restoring the document's previous values on unmount so the rest of the
 * planner is unaffected.
 */
export function useSmoothScroll() {
	useEffect(() => {
		const root = document.documentElement;
		const prevBehavior = root.style.scrollBehavior;
		const prevPadding = root.style.scrollPaddingTop;
		if (!prefersReducedMotion()) root.style.scrollBehavior = "smooth";
		root.style.scrollPaddingTop = "104px";
		return () => {
			root.style.scrollBehavior = prevBehavior;
			root.style.scrollPaddingTop = prevPadding;
		};
	}, []);
}

/** Sets document.title while mounted, restoring the previous title on unmount. */
export function useDocTitle(title: string) {
	useEffect(() => {
		const previous = document.title;
		document.title = title;
		return () => {
			document.title = previous;
		};
	}, [title]);
}

/**
 * The sentence-opener rule, ported from typography.js.
 *
 * Stops a new sentence starting with a short word that ends up stranded alone at
 * the end of a line — "…confirm print choices. Not" with the rest below. Glues
 * that opening word to the one after it with a non-breaking space so the pair
 * wraps together.
 *
 * Deliberately conservative: body copy only, opening word of 7 characters or
 * fewer, and never where gluing would make an unbreakable run over 18 characters
 * — that could force a horizontal scroll on a phone. Display type set in Bebas is
 * excluded by class: `text-wrap: balance` already handles it and there is nothing
 * there to strand. Safe to run repeatedly; it only ever replaces an ordinary space.
 */
const SKIP = new Set(["SCRIPT", "STYLE", "CODE", "PRE", "TEXTAREA"]);
const SKIP_CLASS =
	".display, .eyebrow, .hero__title, .card__month, .chip, .btn, .supplier__name, .cpd__name";

export function fixSentenceOpeners(root: HTMLElement | null) {
	if (!root) return;
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
		acceptNode(node) {
			const parent = node.parentElement;
			if (!parent) return NodeFilter.FILTER_REJECT;
			if (SKIP.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
			if (parent.closest(SKIP_CLASS)) return NodeFilter.FILTER_REJECT;
			return NodeFilter.FILTER_ACCEPT;
		},
	});
	const targets: Text[] = [];
	let n: Node | null;
	while ((n = walker.nextNode())) targets.push(n as Text);
	targets.forEach((textNode) => {
		const before = textNode.nodeValue || "";
		const after = before.replace(
			/([.!?]["')\]]?\s)([A-Za-z][\w'’-]{0,6}) (\S+)/g,
			(whole, tail: string, opener: string, next: string) =>
				opener.length + 1 + next.length > 18
					? whole
					: `${tail}${opener} ${next}`
		);
		if (after !== before) textNode.nodeValue = after;
	});
}

/** Runs the sentence-opener rule over the page, and again whenever deps change. */
export function useTypography(root: RefObject<HTMLElement>, deps: unknown[] = []) {
	useEffect(() => {
		fixSentenceOpeners(root.current);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [root, ...deps]);
}
