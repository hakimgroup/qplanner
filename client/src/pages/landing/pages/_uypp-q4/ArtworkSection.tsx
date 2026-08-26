/**
 * "See it across your practice" — the placements explorer and its lightbox.
 *
 * Every placement in the active route is rendered onto the strip at once. Only the
 * selected placement shows in colour; the rest sit in greyscale so you can see the
 * whole campaign, and clicking a dimmed tile selects its placement rather than
 * opening it. Recolouring is a class change, not a re-render, so images never
 * reload when you change tab.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useCampaign } from "./CampaignShell";
import { campaignLink } from "./links";
import { Cta } from "./Cta";
import { isPlaceholder } from "./types";
import type { Placement, Tile } from "./types";

const reduced = () =>
	typeof window !== "undefined" &&
	window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function ArtworkSection({
	title = "See it across your practice",
	lead,
}: {
	title?: string;
	lead?: React.ReactNode;
}) {
	const { active, id } = useCampaign();
	const placements = useMemo<Placement[]>(() => active.placements ?? [], [active]);
	const [current, setCurrent] = useState(0);
	const track = useRef<HTMLDivElement>(null);
	const [lightbox, setLightbox] = useState<{ src: string; cap: string } | null>(null);

	// Changing route replaces the whole placement set — start again at the first tab.
	useEffect(() => {
		setCurrent(0);
		if (track.current) track.current.scrollLeft = 0;
	}, [active.id]);

	// Escape closes the lightbox, and the page behind it must not scroll while open.
	useEffect(() => {
		if (!lightbox) return;
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(null);
		document.addEventListener("keydown", onKey);
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = prev;
		};
	}, [lightbox]);

	if (!placements.length) return null;

	const select = (index: number) => {
		setCurrent(index);
		const el = track.current?.querySelector<HTMLElement>(
			`[data-placement="${index}"]`
		);
		if (!el || !track.current) return;
		const tr = track.current.getBoundingClientRect();
		const fr = el.getBoundingClientRect();
		track.current.scrollTo({
			left: Math.max(0, track.current.scrollLeft + (fr.left - tr.left) - (tr.width - fr.width) / 2),
			behavior: reduced() ? "auto" : "smooth",
		});
	};

	const step = (dir: number) => {
		const first = track.current?.querySelector<HTMLElement>(".tile");
		const amount = first ? first.getBoundingClientRect().width + 18 : 320;
		track.current?.scrollBy({ left: dir * amount, behavior: "smooth" });
	};

	const openTile = (t: Tile) => {
		if (isPlaceholder(t)) return;
		setLightbox({ src: t.img, cap: t.cap });
	};

	return (
		<section className="section section--dark" id="artwork">
			<div className="wrap">
				<div className="section-head reveal">
					<div>
						<h2 className="display section-head__title">{title}</h2>
						{lead ? <p className="lead">{lead}</p> : null}
					</div>
				</div>

				<div className="explorer">
					<div className="explorer__tabs" id="placementTabs" role="tablist" aria-label="Placement types">
						{placements.map((p, i) => (
							<button
								key={p.key}
								className={`atab${i === current ? " atab--active" : ""}`}
								type="button"
								role="tab"
								aria-selected={i === current}
								onClick={() => select(i)}
							>
								{p.label}
							</button>
						))}
					</div>

					<div className="explorer__stage">
						<button
							className="explorer__nav explorer__nav--prev"
							type="button"
							aria-label="Scroll artwork left"
							onClick={() => step(-1)}
						/>
						<div className="explorer__track" id="artworkTrack" tabIndex={0} ref={track}>
							{placements.map((p, pi) =>
								p.items.map((item, i) => {
									const dim = pi !== current;
									const key = `${active.id}-${pi}-${i}`;
									if (isPlaceholder(item)) {
										return (
											<figure
												key={key}
												className={`tile tile--ph${dim ? " tile--dim" : ""}`}
												data-placement={pi}
												aria-hidden={dim || undefined}
												style={{ animationDelay: `${i * 0.06}s` }}
												onClick={() => dim && select(pi)}
											>
												<span>{item.cap ?? "Artwork to come"}</span>
											</figure>
										);
									}
									return (
										<figure
											key={key}
											className={`tile${dim ? " tile--dim" : ""}`}
											data-placement={pi}
											aria-hidden={dim || undefined}
											style={{ animationDelay: `${i * 0.06}s` }}
											onClick={() => (dim ? select(pi) : openTile(item))}
										>
											<img src={item.img} alt={item.cap} loading="lazy" />
											{item.badge ? <span className="tile__badge">{item.badge}</span> : null}
											<figcaption className="tile__cap">{item.cap}</figcaption>
										</figure>
									);
								})
							)}
						</div>
						<button
							className="explorer__nav explorer__nav--next"
							type="button"
							aria-label="Scroll artwork right"
							onClick={() => step(1)}
						/>
					</div>

					<div className="explorer__cta">
						<Cta href={campaignLink(id)}>Order this campaign</Cta>
					</div>
				</div>
			</div>

			{lightbox ? (
				<div
					className="lb is-open"
					role="dialog"
					aria-modal="true"
					aria-label="Artwork, full size"
					onClick={(e) => {
						if (e.target === e.currentTarget) setLightbox(null);
					}}
				>
					<button className="lb__close" type="button" aria-label="Close" onClick={() => setLightbox(null)}>
						×
					</button>
					<figure className="lb__figure">
						<div className="lb__media">
							<img src={lightbox.src} alt={lightbox.cap} />
						</div>
						<p className="lb__cap">{lightbox.cap}</p>
					</figure>
				</div>
			) : null}
		</section>
	);
}
