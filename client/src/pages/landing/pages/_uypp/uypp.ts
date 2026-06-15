/**
 * Shared client-side behaviour for the "Unlock Your Practice Potential"
 * landing pages. These reproduce the small vanilla-JS interactions from the
 * original standalone microsite (reveal-on-scroll, sticky header, scrollspy,
 * smooth in-page anchors) as React hooks, scoped to each page's lifetime.
 */
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

const prefersReducedMotion = () =>
	typeof window !== "undefined" &&
	typeof window.matchMedia === "function" &&
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Base public path for UYPP static assets (images + fonts). */
export const ASSETS = "/landing-assets/uypp";

/** Convenience typed root ref for a page wrapper div. */
export function usePageRef() {
	return useRef<HTMLDivElement>(null);
}

/**
 * Reveal-on-scroll. Adds the `in` class to every `.reveal` element inside
 * `root` as it enters the viewport (one-shot). Falls back to showing all
 * elements immediately when IntersectionObserver is unavailable or the user
 * prefers reduced motion.
 */
export function useReveal(root: RefObject<HTMLElement>) {
	useEffect(() => {
		const el = root.current;
		if (!el) return;
		const reveals = Array.from(el.querySelectorAll<HTMLElement>(".reveal"));
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
	}, [root]);
}

/** Returns true once the page has scrolled past 8px — drives the sticky-header shadow. */
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

/** Tracks which of the given section ids is currently in view (or null). */
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
		const spy = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) setActive((entry.target as HTMLElement).id);
				});
			},
			{ threshold: 0.5, rootMargin: "-20% 0px -40% 0px" }
		);
		sections.forEach((s) => spy.observe(s));
		return () => spy.disconnect();
	}, [key]);
	return active;
}

/**
 * Enables smooth in-page anchor scrolling with a header offset while the page
 * is mounted, restoring the document's previous values on unmount so the rest
 * of the planner is unaffected.
 */
export function useSmoothScroll() {
	useEffect(() => {
		const root = document.documentElement;
		const prevBehavior = root.style.scrollBehavior;
		const prevPadding = root.style.scrollPaddingTop;
		if (!prefersReducedMotion()) root.style.scrollBehavior = "smooth";
		root.style.scrollPaddingTop = "84px";
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
