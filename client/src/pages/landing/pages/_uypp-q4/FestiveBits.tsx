/**
 * The two blocks every Festive Focus Toolkit sub-page carries.
 *
 * Both were copied markup on six pages in the first cut, which is how the Q4
 * closing sections drifted apart from each other. A component instead: the hero
 * says the same thing in the same shape on every page, and the cross-links can
 * never point at a page that no longer exists, because they are generated from
 * TOOLKIT_PAGES rather than typed out.
 */
import { Link } from "react-router-dom";
import { TOOLKIT_HUB, TOOLKIT_PAGES, TOOLKIT_PREMISE } from "./festive";
import type { ReactNode } from "react";

/**
 * The page header.
 *
 * No photography anywhere in the toolkit yet, so this uses the striped
 * placeholder treatment rather than the plain indigo fallback — indigo would sit
 * directly above the indigo hook band below it and the two would read as one
 * strip. Swap `.hero--placeholder` for an `<img className="hero__img">` when the
 * artwork arrives; nothing else has to change.
 */
export function ToolkitHero({
	title,
	pills,
	children,
}: {
	title: ReactNode;
	pills: string[];
	children?: ReactNode;
}) {
	return (
		<section className="hero hero--placeholder">
			<div className="wrap hero__content">
				<Link className="back-link back-link--hero reveal" to={TOOLKIT_HUB}>
					← Back to the Festive Focus Toolkit
				</Link>
				<p className="eyebrow eyebrow--light reveal">
					Festive Focus Toolkit · Unlock Your Practice Potential
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
 * Deliberately shows everything else rather than a curated three. The toolkit's
 * whole argument is that these stack — a practice reading about events should be
 * one click from the posters that get people through the door — so hiding half
 * of them to keep the row tidy would undercut the point of the page.
 */
export function ToolkitCrosslinks({ exclude }: { exclude: string }) {
	const others = TOOLKIT_PAGES.filter((p) => p.slug !== exclude);
	return (
		<section className="section section--tint">
			<div className="wrap">
				<div className="section-head reveal">
					<div>
						<h2 className="display section-head__title">The rest of the toolkit</h2>
						<p className="lead">
							These are meant to stack. Most practices will run something from each
							of the three layers rather than picking one.
						</p>
					</div>
				</div>
				<div className="crosslinks">
					{others.map((p) => (
						<Link className="crosslink reveal" key={p.slug} to={`/landing/${p.slug}`}>
							<span className="crosslink__media">
								<span className="ph-block ph-block--fill">
									<span>Artwork to come</span>
								</span>
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
				<p className="quarter__note reveal">{TOOLKIT_PREMISE}</p>
			</div>
		</section>
	);
}
