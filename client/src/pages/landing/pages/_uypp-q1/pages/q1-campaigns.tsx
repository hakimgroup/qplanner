/**
 * The Q1 2027 Focus Toolkit hub.
 *
 * The brief opens by saying what the quarter is for — "January to March can be a
 * quieter period, so this edition is all about planning ahead" — and then lists
 * its own four parts. The hub follows it: the welcome, the four parts as cards,
 * and then the two things a card cannot carry.
 *
 *   - Two platforms, one promise. The seasonal campaigns have no artwork yet, so
 *     the thing a practice can take away today is the idea: what each platform
 *     says, and what it carries. That is stated here in full rather than left
 *     behind a card whose picture is a placeholder.
 *
 *   - Key dates. Almost everything in Q1 is decided before the month it runs in
 *     — the myopia offer is bespoked ahead of half term, the windows are
 *     registered for before they have dates — so the page ends on what to do
 *     now, what runs all quarter, and what happens in February.
 *
 * Every "Planner" link in the brief points at the Q4 Festive campaign, carried
 * over from the festive deck. None of them is used; see Q1_ORDER in links.ts.
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
} from "../../_uypp-q4/uypp-q4";
import { Cta } from "../../_uypp-q4/Cta";
import { FeedbackSection } from "../../_uypp-q4/FeedbackSection";
import { ToolkitCard } from "../../_uypp-q4/FestiveBits";
import {
	BOOK_MARKETING_CALL,
	MARKETING_LINK,
	Q1_ORDER,
} from "../../_uypp-q4/links";
import { Q1_HERO, Q1_PAGES, Q1_TOOLKIT } from "../q1";
import "../../_uypp-q4/uypp-q4-home.scss";

export const meta: LandingPageMeta = {
	slug: "q1-campaigns",
	title: "Unlock Your Practice Potential — Q1 2027 Focus Toolkit",
	description:
		"Getting your practice ready for the new year. Your 2027 marketing plan and Planner, the two seasonal Q1 platforms, February half term and the quarter's brand activations.",
	publishedAt: "2026-11-23",
	thumbnail: Q1_HERO,
};

/** Sections with a nav chip, plus `planner` without one: it stops the Key dates
 *  chip staying lit once you have scrolled past the calendar. */
const SPY_IDS = ["toolkit", "platforms", "plan", "planner"];

export default function Q1Campaigns() {
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
						<a href="#toolkit" className={chip("toolkit")} data-spy="toolkit">
							Toolkit
						</a>
						<a href="#platforms" className={chip("platforms")} data-spy="platforms">
							Platforms
						</a>
						<a href="#plan" className={chip("plan")} data-spy="plan">
							Key dates
						</a>
					</nav>
				</div>
			</header>

			<main>
				{/* ============ HERO ============ */}

				<section className="hero">
					<img className="hero__img is-active" src={Q1_HERO} alt="" aria-hidden="true" />
					<div className="hero__overlay"></div>
					<div className="wrap hero__content">
						<p className="eyebrow eyebrow--light reveal">
							Unlock Your Practice Potential · January to March 2027
						</p>
						<h1 className="hero__title reveal">
							Q1 2027
							<br />
							Focus Toolkit
						</h1>
						<p className="hero__sub reveal">
							Getting your practice ready for the new year.
						</p>
						<div className="hero__cta reveal">
							<a href="#toolkit" className="btn btn--ghost-light">
								Inside the toolkit
							</a>
							<a href="#platforms" className="btn btn--ghost-light">
								The two platforms
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

				{/* ============ WELCOME ============ */}

				<section className="section section--intro section--tint" id="intro">
					<div className="wrap">
						<p className="lead reveal">
							Welcome to the Q1 2027 edition of Unlock Your Practice Potential, your
							toolkit for getting ready for the new year, with updates from your
							Activity Planning Team at HGHQ. January to March can be a quieter
							period, so this edition is all about planning ahead. Book in your key
							Q1 activity now, and set up your full 2027 marketing plan, so you can
							adapt as the year goes on rather than reacting to issues as they arise.
						</p>
						<div className="quicklinks">
							<a href="#toolkit" className="quicklink reveal">
								<span className="quicklink__label">Inside the toolkit</span>
								<span className="quicklink__arrow" aria-hidden="true">
									→
								</span>
							</a>
							<a href="#platforms" className="quicklink reveal">
								<span className="quicklink__label">The two platforms</span>
								<span className="quicklink__arrow" aria-hidden="true">
									→
								</span>
							</a>
							<a href="#plan" className="quicklink reveal">
								<span className="quicklink__label">Key dates</span>
								<span className="quicklink__arrow" aria-hidden="true">
									→
								</span>
							</a>
						</div>
					</div>
				</section>

				{/* ============ THE FOUR PARTS ============ */}

				<section className="section" id="toolkit">
					<div className="wrap">
						<div className="section-head reveal">
							<h2 className="display section-head__title">Inside this toolkit</h2>
							<p className="lead lead--narrow">
								Four parts. Every page shows how each campaign drives your core
								KPIs, and the tools, tips and support available to put it into
								action. <strong>Start with the plan</strong>: the other three are
								what goes into it.
							</p>
						</div>
						<div className="cards cards--two">
							{Q1_PAGES.map((p) => (
								<ToolkitCard key={p.slug} page={p} />
							))}
						</div>
					</div>
				</section>

				{/* ============ TWO PLATFORMS ============ */}
				{/* The quarter's idea, stated in full. There is no artwork to show for
				    either platform yet, so the claim and what it carries are the content. */}

				<section className="section section--dark" id="platforms">
					<div className="wrap">
						<div className="section-head section-head--light reveal">
							<h2 className="display section-head__title">Two platforms, one promise</h2>
							<p className="lead lead--narrow">
								Our seasonal campaigns run each quarter and give you a ready-made
								reason to talk to patients at the right moment. For Q1 they are
								built on two platforms. Both say what independents do that the high
								street can&rsquo;t: <strong>treat every patient personally</strong>.
							</p>
						</div>
						<div className="platforms">
							<article
								className="platform reveal"
								style={{ "--platform": "#1F5A5E" } as React.CSSProperties}
							>
								<p className="platform__label">Platform A · Clinical / Technical Care</p>
								<h3 className="platform__claim">&ldquo;Because we care for you&rdquo;</h3>
								<p className="platform__line">
									Personal, uncompromised clinical care, where a number becomes a
									name.
								</p>
								<ul className="qlist">
									<li>The eye exam as a health check, and myopia management</li>
									<li>Dry eye, allergy and contact lens health</li>
									<li>
										First-time varifocals, occupational lenses, and hearing through
										holistic care
									</li>
								</ul>
								<p className="tier__link platform__link">
									<Link to="/landing/q1-seasonal-campaigns">Platform A in full →</Link>
								</p>
							</article>
							<article
								className="platform reveal"
								style={{ "--platform": "#B03A6B" } as React.CSSProperties}
							>
								<p className="platform__label">
									Platform B · Self-Expression / Look &amp; Feel
								</p>
								<h3 className="platform__claim">&ldquo;Treat you as an individual&rdquo;</h3>
								<p className="platform__line">
									Personal styling and guidance: being chosen for, not choosing
									alone. You deserve more&hellip;
								</p>
								<ul className="qlist">
									<li>Frames, brands and new-season collections, and sunglasses</li>
									<li>Contact lenses for confidence and look</li>
									<li>Gifting, styling events and multi-pair</li>
								</ul>
								<p className="tier__link platform__link">
									<Link to="/landing/q1-seasonal-campaigns">Platform B in full →</Link>
								</p>
							</article>
						</div>
						<p className="platforms__note reveal">
							Artwork and full campaign information to follow.
						</p>
					</div>
				</section>

				{/* ============ KEY DATES ============ */}

				<section className="section section--tint-deep" id="plan">
					<div className="wrap">
						<div className="section-head reveal">
							<h2 className="display section-head__title">Plan your quarter</h2>
							<p className="lead lead--narrow">
								Most of Q1 is decided before the month it runs in. This is the order
								to do it in.
							</p>
						</div>
						<div className="quarter reveal">
							<article className="qmonth">
								<div className="qmonth__head">
									<span className="qmonth__name">Now</span>
									<span className="qmonth__no">Plan and book</span>
								</div>
								<div className="qgroup">
									<h3 className="qgroup__title">Set up 2027</h3>
									<ul className="qlist">
										<li>
											<Link to="/landing/q1-get-ready">
												Open your 2027 Marketing Planner
											</Link>
										</li>
										<li>
											<Link to="/landing/q1-get-ready">Book your marketing call</Link>
										</li>
										<li className="is-tbc">Look back at 2026, set your priorities</li>
									</ul>
								</div>
								<div className="qgroup qgroup--brand">
									<h3 className="qgroup__title">Order early</h3>
									<ul className="qlist">
										<li>
											<Link to="/landing/q1-half-term">Bespoke your myopia offer</Link>
										</li>
										<li>
											<Link to="/landing/q1-brand-activations">
												Register for a brand window
											</Link>
										</li>
										<li className="is-tbc">Assets, print and opt-ins take weeks</li>
									</ul>
								</div>
							</article>
							<article className="qmonth">
								<div className="qmonth__head">
									<span className="qmonth__name">Jan – Mar</span>
									<span className="qmonth__no">All quarter</span>
								</div>
								<div className="qgroup">
									<h3 className="qgroup__title">Seasonal campaigns</h3>
									<ul className="qlist">
										<li>
											<Link to="/landing/q1-seasonal-campaigns">
												Platform A: clinical care
											</Link>
										</li>
										<li>
											<Link to="/landing/q1-seasonal-campaigns">
												Platform B: self-expression
											</Link>
										</li>
										<li className="is-tbc">Artwork to follow</li>
									</ul>
								</div>
								<div className="qgroup qgroup--brand">
									<h3 className="qgroup__title">Brand activations</h3>
									<ul className="qlist">
										<li>
											<Link to="/landing/q1-brand-activations">
												Independent eyewear brands
											</Link>
										</li>
										<li className="is-tbc">Brand windows: timings to be confirmed</li>
									</ul>
								</div>
							</article>
							<article className="qmonth">
								<div className="qmonth__head">
									<span className="qmonth__name">February</span>
									<span className="qmonth__no">Half term</span>
								</div>
								<div className="qgroup">
									<h3 className="qgroup__title">Two weeks before</h3>
									<ul className="qlist">
										<li>
											<Link to="/landing/q1-half-term">
												Half term assets up, in practice and on social
											</Link>
										</li>
										<li>
											<Link to="/landing/q1-half-term">
												Recall email or SMS to families
											</Link>
										</li>
									</ul>
								</div>
								<div className="qgroup qgroup--brand">
									<h3 className="qgroup__title">The week itself</h3>
									<ul className="qlist">
										<li>
											<Link to="/landing/q1-half-term">Myopia management</Link>
										</li>
										<li>
											<Link to="/landing/q1-half-term">Family voucher</Link>
										</li>
										<li className="is-tbc">Dates vary by local authority</li>
									</ul>
								</div>
							</article>
						</div>
						<p className="quarter__note reveal">
							A plan isn&rsquo;t fixed. Review it each quarter with your Marketing
							Executive and adjust based on what&rsquo;s working. Questions:{" "}
							<a href={MARKETING_LINK}>marketing@hakimgroup.co.uk</a>
						</p>
					</div>
				</section>

				{/* ============ THE PLANNER ============ */}

				<section className="section" id="planner">
					<div className="wrap">
						<div className="panel panel--flag reveal">
							<h3 className="panel__title">Your 2027 Marketing Planner is now live</h3>
							<p>
								It brings together all campaigns, assets and event opportunities in
								one place, so you can build your plan for the year ahead and see it
								all in a clear calendar view. Start adding your campaigns today, or
								book your marketing call and build the plan with your Marketing
								Executive.
							</p>
							<div className="btnrow">
								<Cta href={Q1_ORDER.planner} className="btn--ghost">
									Open your Marketing Planner
								</Cta>
								<Cta href={BOOK_MARKETING_CALL} className="btn--ghost">
									Book your marketing call
								</Cta>
							</div>
							<p className="panel__signoff">
								Thank you for reading. Your HGHQ Activity Planning Team
							</p>
						</div>
					</div>
				</section>

				<FeedbackSection lead={Q1_TOOLKIT.feedbackLead} />
			</main>

			<footer className="foot">
				<div className="wrap foot__inner">
					<img
						className="brand__logo brand__logo--foot"
						src={img("hg-logo-white.png")}
						alt="Hakim Group"
					/>
					<span>{Q1_TOOLKIT.foot}</span>
				</div>
			</footer>
		</div>
	);
}
