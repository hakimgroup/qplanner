/**
 * The blocks every toolkit page carries: the sub-page hero, the cross-links to
 * the rest of the toolkit, and the card a hub shows for each page.
 *
 * The first two were copied markup on six pages in the first cut of the Festive
 * Focus Toolkit, which is how the Q4 closing sections drifted apart from each
 * other. A component instead: the hero says the same thing in the same shape on
 * every page, and the cross-links can never point at a page that no longer
 * exists, because they are generated from the toolkit's page list rather than
 * typed out.
 *
 * Each takes a `toolkit` — see ToolkitConfig in festive.ts. It defaults to
 * Festive, the toolkit these were written for, so the festive pages pass nothing.
 */
import { Link } from "react-router-dom";
import { img } from "./uypp-q4";
import { FESTIVE_TOOLKIT } from "./festive";
import type { ToolkitConfig, ToolkitPage } from "./festive";
import type { ReactNode } from "react";

/** A page's image: a bare filename lives with the Q4 assets, anything starting
 *  with a slash is already a path. Lets a second toolkit keep its own folder. */
export const toolkitImg = (image: string) =>
	image.startsWith("/") ? image : img(image);

/**
 * The page header.
 *
 * `image` is photography where a page has some that genuinely shows what the
 * page is about — a window carrying the eye-exams poster on the volume drivers
 * page, and so on. Where it does not, the striped placeholder stands in rather
 * than the plain indigo fallback: indigo would sit directly above the indigo hook
 * band below it and the two would read as one strip.
 *
 * Deliberately not defaulted to a generic shot. A hero that shows something
 * other than the page's subject is worse than one that admits the artwork is
 * still coming.
 */
export function ToolkitHero({
	title,
	pills,
	image,
	alt,
	toolkit = FESTIVE_TOOLKIT,
	children,
}: {
	title: ReactNode;
	pills: string[];
	image?: string;
	alt?: string;
	toolkit?: ToolkitConfig;
	children?: ReactNode;
}) {
	return (
		<section className={`hero${image ? "" : " hero--placeholder"}`}>
			{image ? (
				<>
					<img className="hero__img" src={image} alt={alt ?? ""} />
					<div className="hero__overlay" />
				</>
			) : null}
			<div className="wrap hero__content">
				<Link className="back-link back-link--hero reveal" to={toolkit.hub}>
					← Back to the {toolkit.name}
				</Link>
				<p className="eyebrow eyebrow--light reveal">
					{toolkit.name} · Unlock Your Practice Potential
				</p>
				<h1 className="hero__title reveal">{title}</h1>
				<div className="hero__meta reveal">
					{pills.map((p, i) => (
						<span
							key={p}
							className={i === 0 ? "hero__pill" : "hero__pill hero__pill--ghost"}
						>
							{p}
						</span>
					))}
				</div>
				{children}
			</div>
		</section>
	);
}

/**
 * The rest of the toolkit, from inside one page of it.
 *
 * Deliberately shows everything else rather than a curated three. A toolkit's
 * whole argument is that its parts stack — a practice reading about events should
 * be one click from the posters that bring people in — so hiding half of them to
 * keep the row tidy would undercut the point of the page.
 */
export function ToolkitCrosslinks({
	exclude,
	toolkit = FESTIVE_TOOLKIT,
}: {
	exclude: string;
	toolkit?: ToolkitConfig;
}) {
	const others = toolkit.pages.filter((p) => p.slug !== exclude);
	return (
		<section className="section section--tint">
			<div className="wrap">
				<div className="section-head reveal">
					<div>
						<h2 className="display section-head__title">The rest of the toolkit</h2>
						<p className="lead">{toolkit.crosslinksLead}</p>
					</div>
				</div>
				<div className="crosslinks">
					{others.map((p) => (
						<Link className="crosslink reveal" key={p.slug} to={`/landing/${p.slug}`}>
							<span className="crosslink__media">
								{p.image ? (
									<img src={toolkitImg(p.image)} alt="" loading="lazy" />
								) : (
									<span className="ph-block ph-block--fill">
										<span>Artwork to come</span>
									</span>
								)}
							</span>
							<span className="crosslink__month">{p.when}</span>
							<h3 className="crosslink__title">{p.name}</h3>
							<span className="crosslink__arrow" aria-hidden="true">
								→
							</span>
						</Link>
					))}
				</div>
				{/* The premise, restated exactly where the reader is being shown the other
				    parts of the toolkit. It is the sentence that explains why any of this
				    is grouped together, and it is easy to have lost it by this point in a
				    long page. */}
				<p className="quarter__note reveal">{toolkit.premise}</p>
			</div>
		</section>
	);
}

/**
 * One toolkit page, as a card on its hub. Same shape as the Q4 hub's campaign
 * cards, minus the crossfading imagery.
 *
 * Lived inside the festive hub until a second hub needed it. The markup is the
 * home stylesheet's `.card`, so it belongs on a hub page, not a sub-page.
 */
export function ToolkitCard({ page }: { page: ToolkitPage }) {
	return (
		<Link className="card reveal" to={`/landing/${page.slug}`}>
			<div className="card__tab">
				<span className="card__month">{page.when}</span>
			</div>
			<div className="card__media">
				{page.image ? (
					<img src={toolkitImg(page.image)} alt="" loading="lazy" />
				) : (
					<div className="ph-block">
						<span>Artwork to come</span>
					</div>
				)}
			</div>
			<div className="card__body">
				<h3 className="card__title">{page.name}</h3>
				<p>{page.blurb}</p>
				<p className="card__meta">
					<span>{page.count}</span>
				</p>
				<span className="card__cta">
					{page.cta ?? "View assets"} <span aria-hidden="true">→</span>
				</span>
			</div>
		</Link>
	);
}
