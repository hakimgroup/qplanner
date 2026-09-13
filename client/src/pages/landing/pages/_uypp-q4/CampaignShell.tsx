/**
 * Shared chrome and state for the six Q4 campaign pages: the sticky top bar, the
 * footer, the page-lifetime behaviours, and the campaign context the sections
 * read from.
 *
 * The active creative route lives here rather than in each page because three
 * separate sections need it — the route panel, the placements explorer, and the
 * "see the visuals" button in the ordering block, which switches route before
 * jumping back up the page.
 */
import { createContext, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
	ASSETS,
	useDocTitle,
	useReveal,
	useScrollToTop,
	useSmoothScroll,
	useStickyHeader,
	useTypography,
} from "./uypp-q4";
import type { Campaign, Route } from "./types";
import type { CampaignId } from "./links";
import "./uypp-q4-detail.scss";

/** Hub slug — every Q4 campaign page links back here. */
export const HUB = "/landing/q4-campaigns";

/** One chip in the sticky nav. `suffix` is dropped on narrow screens by CSS, so
 *  the label alone has to make sense on a phone: "Volume" / " drivers". */
export interface NavLink {
	href: string;
	label: string;
	suffix?: string;
}

/** The Q4 nav — three sections of the campaign hub. */
const Q4_NAV: NavLink[] = [
	{ href: `${HUB}#featured`, label: "Featured", suffix: " campaigns" },
	{ href: `${HUB}#evergreen`, label: "Evergreen", suffix: " assets" },
	{ href: `${HUB}#brand-assets`, label: "Brand", suffix: " assets" },
];

interface Ctx {
	id: CampaignId;
	routes: Route[];
	active: Route;
	setActive: (r: Route) => void;
	campaign: Campaign;
	multi: boolean;
	/** Label for every ordering button on the page — see Campaign.orderLabel. */
	orderLabel: string;
	/** The index this page belongs to, for sections that link back to it. */
	hub: string;
}

const CampaignCtx = createContext<Ctx | null>(null);

export function useCampaign(): Ctx {
	const ctx = useContext(CampaignCtx);
	if (!ctx) throw new Error("Campaign sections must sit inside <CampaignShell>");
	return ctx;
}

/**
 * `hub`, `nav` and `footNote` exist for the Festive Focus Toolkit, whose pages
 * share every section and style with Q4 but belong to a different index — a
 * toolkit page whose logo and chips led back to the Q4 campaign hub would keep
 * ejecting the reader out of the toolkit they were working through. Omitted
 * everywhere in Q4, so those pages are byte-for-byte unchanged.
 */
export function CampaignShell({
	id,
	title,
	campaign,
	hub = HUB,
	nav = Q4_NAV,
	footNote = "Unlock Your Practice Potential \u00b7 Q4 2026",
	children,
}: {
	id: CampaignId;
	title: string;
	campaign: Campaign;
	hub?: string;
	nav?: NavLink[];
	footNote?: string;
	children: ReactNode;
}) {
	const root = useRef<HTMLDivElement>(null);
	const stuck = useStickyHeader();
	const [active, setActive] = useState<Route>(campaign.routes[0]);

	useSmoothScroll();
	useDocTitle(title);
	// Re-run on route change: the panel and the tiles are replaced wholesale, and
	// new copy needs the reveal observer and the typographic rule applying to it.
	useScrollToTop();
	useReveal(root, [active.id]);
	useTypography(root, [active.id]);

	const value = useMemo<Ctx>(
		() => ({
			id,
			campaign,
			routes: campaign.routes,
			active,
			setActive,
			multi: campaign.routes.length > 1,
			orderLabel: campaign.orderLabel ?? "Order this campaign",
			hub,
		}),
		[id, campaign, active, hub]
	);

	return (
		<CampaignCtx.Provider value={value}>
			<div
				className="uypp-q4-detail"
				id="top"
				ref={root}
				style={{ "--route": active.accent ?? "#3D305C" } as React.CSSProperties}
			>
				<header className={`topbar${stuck ? " is-stuck" : ""}`}>
					<div className="wrap topbar__inner">
						<Link className="brand" to={hub}>
							<img
								className="brand__logo"
								src={`${ASSETS}/img/hg-logo.png`}
								alt="Hakim Group"
							/>
						</Link>
						<nav className="topnav" aria-label="Campaign types">
							{nav.map((n) => (
								<Link key={n.href} to={n.href} className="chip">
									{n.label}
									{n.suffix ? (
										<span className="chip__suffix">{n.suffix}</span>
									) : null}
								</Link>
							))}
						</nav>
					</div>
				</header>

				<main>{children}</main>

				<footer className="foot">
					<div className="wrap foot__inner">
						<img
							className="brand__logo brand__logo--foot"
							src={`${ASSETS}/img/hg-logo-white.png`}
							alt="Hakim Group"
						/>
						<span>{footNote}</span>
					</div>
				</footer>
			</div>
		</CampaignCtx.Provider>
	);
}
