/**
 * Shared chrome for the three UYPP campaign-detail pages: the sticky top bar,
 * the footer, and the page-lifetime behaviours (reveal-on-scroll, sticky
 * header shadow, smooth in-page scrolling, document title). The page body is
 * passed as children. Importing the scoped detail stylesheet here means every
 * detail page picks it up without repeating the import.
 */
import { useRef } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
	ASSETS,
	useDocTitle,
	useReveal,
	useSmoothScroll,
	useStickyHeader,
} from "./uypp";
import "./uypp-detail.scss";

/** Hub slug — every detail page links back here. */
export const HUB = "/landing/q3-campaigns";

export function DetailShell({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	const root = useRef<HTMLDivElement>(null);
	const stuck = useStickyHeader();
	useReveal(root);
	useSmoothScroll();
	useDocTitle(title);

	return (
		<div className="uypp-detail" id="top" ref={root}>
			{/* ============ TOP BAR ============ */}
			<header className={`topbar${stuck ? " is-stuck" : ""}`}>
				<div className="wrap topbar__inner">
					<Link className="brand" to={HUB}>
						<img
							className="brand__mark"
							src={`${ASSETS}/img/hakim-circle.svg`}
							alt=""
							aria-hidden="true"
						/>
						<span className="brand__divider" aria-hidden="true" />
						<img
							className="brand__wordmark"
							src={`${ASSETS}/img/hakim-wordmark.svg`}
							alt="Hakim Group"
						/>
					</Link>
					<nav className="topnav" aria-label="Campaign types">
						<Link to={`${HUB}#core`} className="chip chip--active">
							Core campaigns
						</Link>
						<Link to={`${HUB}#brand`} className="chip">
							Brand campaigns
						</Link>
						<Link to={`${HUB}#cpd`} className="chip">
							CPD | Education
						</Link>
					</nav>
				</div>
			</header>

			{children}

			<footer className="foot">
				<div className="wrap foot__inner">
					<img
						className="brand__wordmark"
						src={`${ASSETS}/img/hakim-wordmark-light.svg`}
						alt="Hakim Group"
					/>
					<span>Unlock Your Practice Potential</span>
				</div>
			</footer>
		</div>
	);
}
