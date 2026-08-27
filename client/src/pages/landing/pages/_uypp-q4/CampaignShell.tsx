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

/** Hub slug — every campaign page links back here. */
export const HUB = "/landing/q4-campaigns";

interface Ctx {
	id: CampaignId;
	routes: Route[];
	active: Route;
	setActive: (r: Route) => void;
	campaign: Campaign;
	multi: boolean;
}

const CampaignCtx = createContext<Ctx | null>(null);

export function useCampaign(): Ctx {
	const ctx = useContext(CampaignCtx);
	if (!ctx) throw new Error("Campaign sections must sit inside <CampaignShell>");
	return ctx;
}

export function CampaignShell({
	id,
	title,
	campaign,
	children,
}: {
	id: CampaignId;
	title: string;
	campaign: Campaign;
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
		}),
		[id, campaign, active]
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
						<Link className="brand" to={HUB}>
							<img
								className="brand__logo"
								src={`${ASSETS}/img/hg-logo.png`}
								alt="Hakim Group"
							/>
						</Link>
						<nav className="topnav" aria-label="Campaign types">
							<Link to={`${HUB}#featured`} className="chip">
								Featured<span className="chip__suffix"> campaigns</span>
							</Link>
							<Link to={`${HUB}#evergreen`} className="chip">
								Evergreen<span className="chip__suffix"> assets</span>
							</Link>
							<Link to={`${HUB}#brand-assets`} className="chip">
								Brand<span className="chip__suffix"> assets</span>
							</Link>
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
						<span>Unlock Your Practice Potential · Q4 2026</span>
					</div>
				</footer>
			</div>
		</CampaignCtx.Provider>
	);
}
