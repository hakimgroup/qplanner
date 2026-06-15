/**
 * Artwork "placements explorer" used by the three UYPP detail pages — a React
 * port of the vanilla `render()` / tab / arrow logic in care.js, student.js
 * and dual.js. Tabs choose a placement type; the track is a horizontal,
 * snap-scrolling strip of tiles; prev/next arrows scroll it by one tile; a
 * meta line summarises how many placements are live vs. placeholder.
 *
 * The active creative route is owned by the parent page (Care and Student let
 * the visitor switch routes; Dual has a single direction). The parent passes
 * the resolved `data` set plus a `routeKey` so that switching routes remounts
 * the tiles and re-triggers their entrance animation.
 */
import { useRef, useState } from "react";
import type { CSSProperties } from "react";

export type ArtType =
	| "posters"
	| "strut"
	| "aboard"
	| "iptv"
	| "recall"
	| "email"
	| "social";

export type Tile = { img: string; cap: string } | { ph: true };

export type ArtSet = Record<ArtType, Tile[]>;

const TAB_ORDER: { type: ArtType; label: string }[] = [
	{ type: "posters", label: "Posters" },
	{ type: "strut", label: "Strut card" },
	{ type: "aboard", label: "A-board" },
	{ type: "iptv", label: "IPTV" },
	{ type: "recall", label: "Recall reverse" },
	{ type: "email", label: "Email" },
	{ type: "social", label: "Social" },
];

const LABELS: Record<ArtType, string> = {
	posters: "Posters",
	strut: "Strut card",
	aboard: "A-board",
	iptv: "IPTV",
	recall: "Recall reverse",
	email: "Email",
	social: "Social",
};

function isPlaceholder(tile: Tile): tile is { ph: true } {
	return "ph" in tile;
}

function countText(type: ArtType, items: Tile[]): string {
	const phCount = items.filter(isPlaceholder).length;
	const real = items.length - phCount;
	const base =
		`${items.length} ${LABELS[type].toLowerCase()} placement` +
		(items.length === 1 ? "" : "s");
	const suffix = phCount
		? ` · ${real} live, ${phCount} placeholder${phCount === 1 ? "" : "s"}`
		: " · all live";
	return base + suffix;
}

export function ArtExplorer({
	data,
	routeKey = "x",
}: {
	data: ArtSet;
	routeKey?: string;
}) {
	const [type, setType] = useState<ArtType>("posters");
	const trackRef = useRef<HTMLDivElement>(null);
	const items = data[type] ?? [];

	const step = (dir: number) => {
		const track = trackRef.current;
		if (!track) return;
		const first = track.querySelector<HTMLElement>(".tile");
		const amount = first ? first.getBoundingClientRect().width + 18 : 300;
		track.scrollBy({ left: dir * amount, behavior: "smooth" });
	};

	let phNumber = 0;

	return (
		<div className="explorer reveal">
			<div className="explorer__tabs" role="tablist" aria-label="Artwork types">
				{TAB_ORDER.map((t) => (
					<button
						key={t.type}
						type="button"
						className={`atab${type === t.type ? " atab--active" : ""}`}
						role="tab"
						aria-selected={type === t.type}
						onClick={() => setType(t.type)}
					>
						{t.label}
					</button>
				))}
			</div>

			<div className="explorer__stage">
				<button
					type="button"
					className="explorer__nav explorer__nav--prev"
					aria-label="Previous placement"
					onClick={() => step(-1)}
				>
					‹
				</button>
				<div className="explorer__track" ref={trackRef} tabIndex={0}>
					{items.map((item, i) => {
						const style: CSSProperties = { animationDelay: `${i * 0.06}s` };
						const key = `${routeKey}-${type}-${i}`;
						if (isPlaceholder(item)) {
							phNumber += 1;
							return (
								<figure key={key} className="tile tile--ph" style={style}>
									<span>Placeholder {phNumber}</span>
								</figure>
							);
						}
						return (
							<figure key={key} className="tile" style={style}>
								<img src={item.img} alt={item.cap} loading="lazy" />
								<figcaption className="tile__cap">{item.cap}</figcaption>
							</figure>
						);
					})}
				</div>
				<button
					type="button"
					className="explorer__nav explorer__nav--next"
					aria-label="Next placement"
					onClick={() => step(1)}
				>
					›
				</button>
			</div>
			<p className="explorer__meta">
				<span>{countText(type, items)}</span>
			</p>
		</div>
	);
}
