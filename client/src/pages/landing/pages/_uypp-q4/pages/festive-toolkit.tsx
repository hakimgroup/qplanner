/**
 * The Festive Focus Toolkit hub.
 *
 * The source deck is nineteen near-identical slides with no structure between
 * them — the same four paragraphs of "Products to include", "Supporting
 * information" and "Audience" repeat on eight of them, and nothing says how any
 * one activity relates to the next. Reproduced faithfully that becomes nineteen
 * thin pages all saying the same thing, which is exactly the failure mode a
 * toolkit has: too many doors, no map.
 *
 * So the organising idea is not the deck's order. It is that **a toolkit is not a
 * campaign**. With a campaign you choose one; with a toolkit you assemble several.
 * Everything on this page follows from that:
 *
 *   - Three layers, not a menu. Volume drivers get people through the door,
 *     reasons to visit bring them on a particular day, gifting makes the visit
 *     worth more. A practice takes something from each rather than picking one.
 *     The nav chips, the "build your plan" block and the section order all state
 *     that same sequence, so the structure is repeated rather than re-explained.
 *
 *   - Evidence before the menu. Last year's numbers appear high up, because a
 *     practice deciding whether any of this is worth the effort should see that
 *     seventy of them already did it — and should see the one thing that went
 *     wrong, which was dropping out of 12 Days of Christmas over offers that were
 *     never committed to.
 *
 *   - A calendar at the end. The real constraint on a festive plan is lead time,
 *     not choice, so the page closes on November / December / January rather than
 *     on another list of links.
 *
 * The 2025 performance slides are HQ operations data — Jotform submission counts,
 * DotDigital open rates. Those are not recast for practices as metrics; only the
 * two facts that change what a practice should do are carried across.
 */
import { useRef } from "react";
import { Link } from "react-router-dom";
import type { LandingPageMeta } from "../../../registry";
import {
	img,
	useDocTitle,
	useReveal,
	useScrollSpy,
	useScrollToTop,
	useSmoothScroll,
	useStickyHeader,
	useTypography,
} from "../uypp-q4";
import { FeedbackSection } from "../FeedbackSection";
import { HUB } from "../CampaignShell";
import { MARKETING_LINK } from "../links";
import { TOOLKIT_FOOT, TOOLKIT_PAGES, TOOLKIT_PREMISE } from "../festive";
import type { ToolkitPage } from "../festive";
import "../uypp-q4-home.scss";

export const meta: LandingPageMeta = {
	slug: "festive-toolkit",
	title: "Festive Focus Toolkit — Unlock Your Practice Potential",
	description:
		"Festive assets, events and brand gifting for December and January. Built to support exam volume through the quieter period, and routed through your Marketing Planner.",
	publishedAt: "2026-09-29",
	// The same shot as the hero, so the index card and the page agree.
	thumbnail: img("festive-easy-1.jpg"),
};

/** Sections with a nav chip. Add to both this list and the chip, or the chip
 *  never lights up. `#plan` is here without a chip on purpose: it stops the
 *  Gifting chip staying lit once you have scrolled past it. */
const SPY_IDS = ["drivers", "reasons", "gifting", "plan"];

/** One toolkit page, as a card. Same shape as the Q4 hub's campaign cards, minus
 *  the crossfading imagery — there is no imagery yet. */
function ToolkitCard({ page }: { page: ToolkitPage }) {
	return (
		<Link className="card reveal" to={`/landing/${page.slug}`}>
			<div className="card__tab">
				<span className="card__month">{page.when}</span>
			</div>
			<div className="card__media">
				{page.image ? (
					<img src={img(page.image)} alt="" loading="lazy" />
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
					View assets <span aria-hidden="true">→</span>
				</span>
			</div>
		</Link>
	);
}

const layer = (name: ToolkitPage["layer"]) =>
	TOOLKIT_PAGES.filter((p) => p.layer === name);

export default function FestiveToolkit() {
	const root = useRef<HTMLDivElement>(null);
	const stuck = useStickyHeader();
	const active = useScrollSpy(SPY_IDS);
	useScrollToTop();
	useReveal(root);
	useSmoothScroll();
	useTypography(root);
	useDocTitle(meta.title);

	const chip = (id: string) => `chip${active === id ? " is-active" : ""}`;

	return (
		<div className="uypp-q4-home" id="top" ref={root}>
			<header className={`topbar${stuck ? " is-stuck" : ""}`}>
				<div className="wrap topbar__inner">
					<a className="brand" href="#top">
						<img className="brand__logo" src={img("hg-logo.png")} alt="Hakim Group" />
					</a>
					<nav className="topnav" aria-label="Toolkit sections">
						<a href="#drivers" className={chip("drivers")} data-spy="drivers">
							Volume<span className="chip__suffix"> drivers</span>
						</a>
						<a href="#reasons" className={chip("reasons")} data-spy="reasons">
							Reasons<span className="chip__suffix"> to visit</span>
						</a>
						<a href="#gifting" className={chip("gifting")} data-spy="gifting">
							Gifting<span className="chip__suffix"> &amp; goodwill</span>
						</a>
					</nav>
				</div>
			</header>

			<main>
				{/* ============ HERO ============ */}

				<section className="hero">
					<img
						className="hero__img is-active"
						src={img("festive-easy-1.jpg")}
						alt=""
						aria-hidden="true"
					/>
					<div className="hero__overlay"></div>
					<div className="wrap hero__content">
						<p className="eyebrow eyebrow--light reveal">
							Unlock Your Practice Potential · December and January
						</p>
						<h1 className="hero__title reveal">
							Festive Focus
							<br />
							Toolkit
						</h1>
						<p className="hero__sub reveal">
							Everything you need to make December work harder — and to carry that
							into a quiet January.
						</p>
						<div className="hero__cta reveal">
							<a href="#build" className="btn btn--ghost-light">
								Build your plan
							</a>
							<a href="#drivers" className="btn btn--ghost-light">
								Start with the posters
							</a>
							<a href="#plan" className="btn btn--ghost-light">
								Key dates
							</a>
						</div>
					</div>
					<a className="hero__scroll" href="#intro" aria-label="Scroll down for more">
						<span className="hero__scroll-arrow" aria-hidden="true">
							↓
						</span>
					</a>
				</section>

				{/* ============ INTRO ============ */}

				<section className="section section--intro section--tint" id="intro">
					<div className="wrap">
						<p className="lead reveal">
							{TOOLKIT_PREMISE} It is not a new campaign — it repackages assets you
							already know from Q4 and previous festive work, adds two new festive
							posters, and routes all of it through the Marketing Planner so capacity
							can be tracked centrally. It sits inside Unlock Your Practice Potential
							and is meant to be used alongside it, not instead of it.
						</p>
						<div className="quicklinks">
							<a href="#drivers" className="quicklink reveal">
								<span className="quicklink__label">Volume drivers</span>
								<span className="quicklink__arrow" aria-hidden="true">
									→
								</span>
							</a>
							<a href="#reasons" className="quicklink reveal">
								<span className="quicklink__label">Reasons to visit</span>
								<span className="quicklink__arrow" aria-hidden="true">
									→
								</span>
							</a>
							<a href="#gifting" className="quicklink reveal">
								<span className="quicklink__label">Gifting &amp; goodwill</span>
								<span className="quicklink__arrow" aria-hidden="true">
									→
								</span>
							</a>
						</div>
					</div>
				</section>

				{/* ============ 2025 ============ */}
				{/* Evidence before the menu. Three numbers and one caution, all of which
				    change what a practice should do — not the internal engagement
				    reporting the numbers came from. */}

				<section className="section" id="lastyear">
					<div className="wrap">
						<div className="section-head reveal">
							<h2 className="display section-head__title">What last year told us</h2>
							<p className="lead lead--narrow">
								Between 6 November and 5 December 2025, practices across the group
								ran festive activity and told us how it went.
							</p>
						</div>
						<div className="stats">
							<div className="stat reveal">
								<p className="stat__figure">70</p>
								<p className="stat__label">practices took part</p>
								<p className="stat__note">
									Across 62 requests, plus around ten more made directly to the
									marketing executives and events team.
								</p>
							</div>
							<div className="stat reveal">
								<p className="stat__figure">38</p>
								<p className="stat__label">requests each for the two most popular</p>
								<p className="stat__note">
									Reactivation and outside prescriptions — which is why the festive
									volume drivers lead this year's toolkit.
								</p>
							</div>
							<div className="stat reveal">
								<p className="stat__figure">23</p>
								<p className="stat__label">practices chose 12 Days of Christmas</p>
								<p className="stat__note">
									Easily the most requested event format, and the one worth starting
									on earliest.
								</p>
							</div>
						</div>
						<div className="panel panel--flag panel--wide reveal">
							<h3 className="panel__title">One to start early</h3>
							<p>
								Several practices found 12 Days of Christmas harder to land than
								expected, mostly because the twelve daily offers had not been settled
								by the time the event came round.
							</p>
							<p>
								So if it is on your list,{" "}
								<strong>it is worth agreeing all twelve before you announce it</strong>
								. Twelve is not many in October, and quite a lot come December.
							</p>
						</div>
					</div>
				</section>

				{/* ============ BUILD YOUR PLAN ============ */}
				{/* The structural idea, stated once and plainly. Everything below is an
				    instance of it, which is why this sits above all three sections rather
				    than reading as a fourth. */}

				<section className="section section--tint-deep" id="build">
					<div className="wrap">
						<div className="section-head reveal">
							<h2 className="display section-head__title">Build your festive plan</h2>
							<p className="lead lead--narrow">
								This is a toolkit, not a campaign — you are not choosing one thing.
								Take something from each of the three layers and they compound.
							</p>
						</div>
						<div className="tiers">
							<article className="tier reveal">
								<span className="tier__step">01</span>
								<div className="tier__body">
									<h3 className="tier__title">Get them through the door</h3>
									<p>
										Posters that say you are open, you can see them, and you will
										take their prescription. No offer, no planning, no lead time.
										The cheapest volume in the toolkit and the first thing to put
										up.
									</p>
									<p className="tier__link">
										<Link to="/landing/festive-volume-drivers">Volume drivers →</Link>
									</p>
								</div>
							</article>
							<article className="tier reveal">
								<span className="tier__step">02</span>
								<div className="tier__body">
									<h3 className="tier__title">Give them a reason to come now</h3>
									<p>
										An event on a date, or an offer with an end. This is what turns
										&ldquo;I should get my eyes tested&rdquo; into a Thursday
										evening. It needs deciding early, which is the only hard part.
									</p>
									<p className="tier__link">
										<Link to="/landing/festive-events">Events →</Link>
									</p>
								</div>
							</article>
							<article className="tier reveal">
								<span className="tier__step">03</span>
								<div className="tier__body">
									<h3 className="tier__title">Make the visit worth more</h3>
									<p>
										A gift with purchase, a second pair, a brand activation. It
										costs the practice nothing, the supplier funds it, and it is
										the difference between a sight test and a dispense.
									</p>
									<p className="tier__link">
										<Link to="/landing/festive-gifting">Gifting →</Link>
									</p>
								</div>
							</article>
						</div>
						<p className="quarter__note reveal">
							A practice doing all three has an A-board out, an evening in the diary
							and something to hand over at the till. None of the three is much use
							on its own.
						</p>
					</div>
				</section>

				{/* ============ LAYER 1 ============ */}

				<section className="section" id="drivers">
					<div className="wrap">
						<div className="section-head reveal">
							<h2 className="display section-head__title">Volume drivers</h2>
							<p className="lead lead--narrow">
								<strong>Layer one.</strong> The assets that work on people who were
								not looking for you — on the pavement, in the window, and in the
								inbox. Nothing here needs a date or a decision.
							</p>
						</div>
						<div className="cards cards--two">
							{layer("drivers").map((p) => (
								<ToolkitCard key={p.slug} page={p} />
							))}
						</div>
					</div>
				</section>

				{/* ============ LAYER 2 ============ */}

				<section className="section section--tint" id="reasons">
					<div className="wrap">
						<div className="section-head reveal">
							<h2 className="display section-head__title">Reasons to visit</h2>
							<p className="lead lead--narrow">
								<strong>Layer two.</strong> Something happening on a particular day.
								Both of these need deciding well before December — the artwork is
								the easy part, the date and the offer are not.
							</p>
						</div>
						<div className="cards cards--two">
							{layer("reasons").map((p) => (
								<ToolkitCard key={p.slug} page={p} />
							))}
						</div>
					</div>
				</section>

				{/* ============ LAYER 3 ============ */}

				<section className="section" id="gifting">
					<div className="wrap">
						<div className="section-head reveal">
							<h2 className="display section-head__title">Gifting &amp; goodwill</h2>
							<p className="lead lead--narrow">
								<strong>Layer three.</strong> Accessories and stocking fillers
								first — COTI chains, Theia cloths and multi-frame cases need no form
								and no allocation. Then supplier-funded gifts with purchase, the
								brand activations behind them, and the local PR campaign HQ runs on
								your behalf. All of it costs the practice nothing but the
								conversation.
							</p>
						</div>
						<div className="cards cards--two">
							{layer("gifting").map((p) => (
								<ToolkitCard key={p.slug} page={p} />
							))}
						</div>
					</div>
				</section>

				{/* ============ PLAN ============ */}
				{/* The page closes on a calendar rather than another list of links: the
				    real constraint on a festive plan is lead time, and this is the only
				    place the toolkit says out loud that some of it has to be decided in
				    October. */}

				<section className="section section--tint-deep" id="plan">
					<div className="wrap">
						<div className="section-head reveal">
							<h2 className="display section-head__title">Plan your December</h2>
							<p className="lead lead--narrow">
								Almost everything here is decided before the month it runs in. This
								is the order to do it in.
							</p>
						</div>
						<div className="quarter reveal">
							<article className="qmonth">
								<div className="qmonth__head">
									<span className="qmonth__name">November</span>
									<span className="qmonth__no">Decide and order</span>
								</div>
								<div className="qgroup">
									<h3 className="qgroup__title">Now</h3>
									<ul className="qlist">
										<li>
											<Link to="/landing/festive-retail-moments">
												Black Friday — set the promotion
											</Link>
										</li>
										<li>
											<Link to="/landing/festive-gifting">
												Opt in to gifts with purchase
											</Link>
										</li>
										<li>
											<Link to="/landing/festive-in-practice">
												Order the window decor
											</Link>
										</li>
									</ul>
								</div>
								<div className="qgroup qgroup--brand">
									<h3 className="qgroup__title">Start planning</h3>
									<ul className="qlist">
										<li>
											<Link to="/landing/festive-events">
												Pick an event date and audience
											</Link>
										</li>
										<li>
											<Link to="/landing/festive-gifting#accessories">
												Accessories front and centre
											</Link>
										</li>
										<li className="is-tbc">Agree all twelve daily offers</li>
									</ul>
								</div>
							</article>
							<article className="qmonth">
								<div className="qmonth__head">
									<span className="qmonth__name">December</span>
									<span className="qmonth__no">Run it</span>
								</div>
								<div className="qgroup">
									<h3 className="qgroup__title">Up in the practice</h3>
									<ul className="qlist">
										<li>
											<Link to="/landing/festive-volume-drivers">
												Festive posters and A-boards
											</Link>
										</li>
										<li>
											<Link to="/landing/festive-in-practice">
												The window display
											</Link>
										</li>
										<li>
											<Link to="/landing/festive-in-practice">
												Merry Christmas from the team
											</Link>
										</li>
									</ul>
								</div>
								<div className="qgroup qgroup--brand">
									<h3 className="qgroup__title">Happening</h3>
									<ul className="qlist">
										<li>
											<Link to="/landing/festive-events">
												Your event — 12 Days or late-night VIP
											</Link>
										</li>
										<li>
											<Link to="/landing/festive-gifting#accessories">
												Stocking fillers on the counter
											</Link>
										</li>
										<li>
											<Link to="/landing/festive-retail-moments">
												The December sale
											</Link>
										</li>
										<li>
											<Link to="/landing/festive-local-pr">
												Local PR form closes 11 December
											</Link>
										</li>
									</ul>
								</div>
							</article>
							<article className="qmonth">
								<div className="qmonth__head">
									<span className="qmonth__name">January</span>
									<span className="qmonth__no">Keep going</span>
								</div>
								<div className="qgroup">
									<h3 className="qgroup__title">Leave these up</h3>
									<ul className="qlist">
										<li>
											<Link to="/landing/festive-volume-drivers">
												Eye exams available
											</Link>
										</li>
										<li>
											<Link to="/landing/festive-volume-drivers">
												Outside prescriptions welcome
											</Link>
										</li>
										<li>
											<Link to="/landing/festive-volume-drivers">Multi pair</Link>
										</li>
									</ul>
								</div>
								<div className="qgroup qgroup--brand">
									<h3 className="qgroup__title">Worth knowing</h3>
									<ul className="qlist">
										<li className="is-tbc">
											January is the quietest testing month of the year
										</li>
										<li className="is-tbc">
											Tell your marketing executive what worked, for 2027
										</li>
									</ul>
								</div>
							</article>
						</div>
						<p className="quarter__note reveal">
							Everything here is ordered through the Marketing Planner, so festive
							activity and capacity can be tracked centrally. To make sure you do not
							miss out next year, tell your marketing executive and add it to your
							2027 Marketing Planner. Questions:{" "}
							<a href={MARKETING_LINK}>marketing@hakimgroup.co.uk</a>
						</p>
					</div>
				</section>

				{/* ============ BACK TO Q4 ============ */}

				<section className="section">
					<div className="wrap">
						<div className="panel panel--flag panel--wide reveal">
							<h3 className="panel__title">Part of Unlock Your Practice Potential</h3>
							<p>
								The toolkit is an addition to the quarter, not a replacement for it.
								Your featured campaign, the evergreen assets and the quarter's brand
								activations all still run — and several of these festive assets are
								the same planner cards seen from a different angle.
							</p>
							<Link className="btn btn--ghost" to={HUB}>
								Q4 campaigns
							</Link>
						</div>
					</div>
				</section>

				<FeedbackSection />
			</main>

			<footer className="foot">
				<div className="wrap foot__inner">
					<img
						className="brand__logo brand__logo--foot"
						src={img("hg-logo-white.png")}
						alt="Hakim Group"
					/>
					<span>{TOOLKIT_FOOT}</span>
				</div>
			</footer>
		</div>
	);
}
