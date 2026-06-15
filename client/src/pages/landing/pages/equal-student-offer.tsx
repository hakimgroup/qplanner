import { useState } from "react";
import type { KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import type { LandingPageMeta } from "../registry";
import { ASSETS } from "./_uypp/uypp";
import { DetailShell, HUB } from "./_uypp/DetailShell";
import { ArtExplorer } from "./_uypp/explorer";
import type { ArtSet, Tile } from "./_uypp/explorer";

export const meta: LandingPageMeta = {
	slug: "equal-student-offer",
	title: "Equal Student Offer — Hakim Group Campaign",
	description:
		"Core campaign 02. A bold, duotone campaign that plays on the Equal brand name to drive frame sales and build loyalty with younger, student patients.",
	publishedAt: "2026-06-15",
	thumbnail: `${ASSETS}/img/student-a-posters.jpg`,
	hidden: true,
};

const img = (file: string, cap: string): Tile => ({
	img: `${ASSETS}/img/${file}`,
	cap,
});
const ph: Tile = { ph: true };

const ROUTE = { a: "Student Lifestyle", b: "Student Graphic" } as const;

const ART: Record<"a" | "b", ArtSet> = {
	a: {
		posters: [img("student-a-posters.jpg", "Window posters"), ph, ph, ph],
		strut: [ph, ph, ph, ph],
		aboard: [ph, ph, ph, ph],
		iptv: [img("student-a-iptv.jpg", "In-practice IPTV screen"), ph, ph, ph],
		recall: [ph, ph, ph, ph],
		email: [ph, ph, ph],
		social: [img("student-a-social.jpg", "Instagram story posts"), ph, ph, ph],
	},
	b: {
		posters: [
			img("student-b-posters.jpg", "Window poster + strut card"),
			ph,
			ph,
			ph,
		],
		strut: [ph, ph, ph, ph],
		aboard: [ph, ph, ph, ph],
		iptv: [ph, ph, ph, ph],
		recall: [ph, ph, ph, ph],
		email: [ph, ph, ph],
		social: [ph, ph, ph, ph],
	},
};

export default function EqualStudentOffer() {
	const [opt, setOpt] = useState<"a" | "b">("a");

	const onKey = (key: "a" | "b") => (e: KeyboardEvent<HTMLElement>) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			setOpt(key);
		}
	};

	return (
		<DetailShell title={meta.title}>
			{/* ============ HERO ============ */}
			<section className="hero">
				<img
					className="hero__img"
					src={`${ASSETS}/img/student-hero.jpg`}
					alt="Equal student offer campaign shown on an in-practice screen"
				/>
				<div className="hero__overlay" />
				<div className="wrap hero__content">
					<p className="eyebrow eyebrow--light reveal">
						Q3 Campaigns · Unlock Your Practice Potential
					</p>
					<h1 className="hero__title reveal">Equal Student Offer</h1>
				</div>
			</section>

			{/* ============ INTRO ============ */}
			<section className="section" id="core">
				<div className="wrap">
					<Link to={HUB} className="back-link">
						← Back to campaign overview
					</Link>

					<div className="intro">
						<div className="intro__lead reveal">
							<p className="eyebrow">Core campaign 02</p>
							<h2 className="display intro__heading">Equal student offer</h2>
							<p className="lead">
								A bold, eye-catching campaign that uses a duotone design to
								capture attention and plays on the Equal brand name to showcase a
								student discount. Two creative options have been developed so you
								can choose the style that best reflects your practice.
							</p>
						</div>
						<ul className="intro__points reveal">
							<li>Squarely focused on attracting younger and student patients</li>
							<li>
								Familiar, on-trend creative that feels relevant to their tastes
							</li>
							<li>
								A clear discount incentive to choose you over another optician
							</li>
							<li>
								Designed for social stories, grid and in-practice touchpoints
							</li>
							<li>
								Built around the Equal frame range — clean, minimal and
								affordable
							</li>
						</ul>
					</div>
				</div>
			</section>

			{/* ============ AT-A-GLANCE ============ */}
			<section className="section section--tint">
				<div className="wrap glance">
					<figure className="glance__media reveal">
						<img
							src={`${ASSETS}/img/student-a-posters.jpg`}
							alt="Equal student offer creative shown in practice"
						/>
					</figure>
					<div className="glance__panel reveal">
						<div className="meta-block">
							<h3 className="meta-block__title">Best for practices who want to</h3>
							<p>
								Attract younger and student patients, drive volume and show that
								your practice has frames and offers relevant to their tastes.
							</p>
						</div>
						<div className="meta-block">
							<h3 className="meta-block__title">Core KPI</h3>
							<p className="pipes">Volume</p>
						</div>
						<div className="meta-block">
							<h3 className="meta-block__title">Audience</h3>
							<p className="pipes">
								Students <span>|</span> Younger patients <span>|</span> New
								patients
							</p>
						</div>
						<div className="meta-block">
							<h3 className="meta-block__title">Campaign period</h3>
							<p className="pipes">
								August <span>|</span> September
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* ============ STATS ============ */}
			<section className="section">
				<div className="wrap stats">
					<div className="stat reveal">
						<span className="stat__num display">£150</span>
						<span className="stat__label">Minimum paid social budget</span>
					</div>
					<div className="stat reveal">
						<span className="stat__num display">2</span>
						<span className="stat__label">Creative directions to choose from</span>
					</div>
					<div className="stat reveal">
						<span className="stat__num display">
							2<span className="stat__unit">mo</span>
						</span>
						<span className="stat__label">Live across August &amp; September</span>
					</div>
				</div>
			</section>

			{/* ============ STEP 01 · CHOOSE CREATIVE ROUTE ============ */}
			<section className="section section--tint" id="creative">
				<div className="wrap">
					<div className="section-head reveal">
						<div>
							<p className="eyebrow">Step 01 · Choose your route</p>
							<h2 className="display section-head__title">
								Pick your creative direction
							</h2>
							<p className="lead lead--narrow">
								The Equal student offer comes in two visual routes. Select one to
								preview how it carries across every placement below.
							</p>
						</div>
						<div className="toggle" role="tablist" aria-label="Creative routes">
							<button
								type="button"
								className={`toggle__btn${opt === "a" ? " toggle__btn--active" : ""}`}
								role="tab"
								aria-selected={opt === "a"}
								onClick={() => setOpt("a")}
							>
								Student Lifestyle
							</button>
							<button
								type="button"
								className={`toggle__btn${opt === "b" ? " toggle__btn--active" : ""}`}
								role="tab"
								aria-selected={opt === "b"}
								onClick={() => setOpt("b")}
							>
								Student Graphic
							</button>
						</div>
					</div>

					<div className="options" data-active={opt}>
						<article
							className={`option reveal ${opt === "a" ? "option--feature" : "option--muted"}`}
							role="button"
							tabIndex={0}
							aria-pressed={opt === "a"}
							aria-label="Select the Student Lifestyle route"
							onClick={() => setOpt("a")}
							onKeyDown={onKey("a")}
						>
							<figure className="option__media">
								<img
									src={`${ASSETS}/img/student-a-posters.jpg`}
									alt="Student lifestyle creative route"
								/>
								<span className="option__check" aria-hidden="true">
									✓
								</span>
							</figure>
							<div className="option__body">
								<span className="tag">Option A · Photography</span>
								<h3 className="option__title">Student Lifestyle</h3>
								<p>
									A warm duotone route led by photography of real students —
									friendly, relatable and full of personality.
								</p>
								<span className="option__status" aria-hidden="true" />
							</div>
						</article>
						<article
							className={`option reveal ${opt === "b" ? "option--feature" : "option--muted"}`}
							role="button"
							tabIndex={0}
							aria-pressed={opt === "b"}
							aria-label="Select the Student Graphic route"
							onClick={() => setOpt("b")}
							onKeyDown={onKey("b")}
						>
							<figure className="option__media">
								<img
									src={`${ASSETS}/img/student-b-posters.jpg`}
									alt="Student graphic creative route"
								/>
								<span className="option__check" aria-hidden="true">
									✓
								</span>
							</figure>
							<div className="option__body">
								<span className="tag">Option B · Graphic</span>
								<h3 className="option__title">Student Graphic</h3>
								<p>
									A bold, product-led duotone route with electric colour and big
									type that stops the scroll.
								</p>
								<span className="option__status" aria-hidden="true" />
							</div>
						</article>
					</div>

					<p className="options__hint" aria-hidden="true">
						Scroll down to see your chosen route across every placement{" "}
						<span className="options__hint-arrow">↓</span>
					</p>
				</div>
			</section>

			{/* ============ STEP 02 · PLACEMENTS ============ */}
			<section className="section section--dark" id="artwork">
				<div className="wrap">
					<div className="section-head reveal">
						<div>
							<p className="eyebrow">Step 02 · The placements</p>
							<h2 className="display section-head__title">
								See it across your practice
							</h2>
							<p className="lead lead--narrow">
								Showing the{" "}
								<strong className="route-name">{ROUTE[opt]}</strong> route.
								Choose an asset type to scroll through how it comes to life.
							</p>
						</div>
					</div>

					<ArtExplorer data={ART[opt]} routeKey={opt} />
				</div>
			</section>

			{/* ============ SOCIAL PROOF / TESTIMONIAL ============ */}
			<section className="section">
				<div className="wrap">
					<blockquote className="quote reveal">
						<span className="quote__mark" aria-hidden="true">
							“
						</span>
						<p className="quote__text">
							The student creative felt instantly on-trend. It gave us a simple,
							confident way to invite a younger audience into the practice.
						</p>
						<footer className="quote__by">— Practice marketing lead</footer>
					</blockquote>
				</div>
			</section>

			{/* ============ BRINGING TO LIFE ============ */}
			<section className="section">
				<div className="wrap split">
					<figure className="split__media reveal">
						<img
							src={`${ASSETS}/img/student-a-iptv.jpg`}
							alt="Equal student offer on an in-practice screen"
						/>
					</figure>
					<div className="split__body reveal">
						<h2 className="display split__title">
							Bringing this campaign to life
						</h2>
						<p className="lead">
							Use the campaign on social media stories and grid to target a
							younger audience, and across your practice to reach younger
							community members.
						</p>
						<p>
							Display it at multiple touchpoints — posters, strut cards and IPTV
							— so the student offer is visible the moment they walk in.
						</p>
						<p>
							Where discounts are applied, use the <strong>‘Student’</strong>{" "}
							discount code with a matching description such as ‘Equal’. Avoid the
							‘Discount to amount’ option, as it will erase your discount code.
						</p>
						<div className="services">
							<h3 className="meta-block__title">Frames to include</h3>
							<ul>
								<li>Equal — clean lines, minimal branding</li>
								<li>Accessible price points for students</li>
								<li>
									Frames, complete specs or contact lenses (your discretion)
								</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* ============ PAID SOCIAL ============ */}
			<section className="section section--tint">
				<div className="wrap split split--reverse">
					<div className="split__body reveal">
						<h2 className="display split__title">
							Reaching students with paid social
						</h2>
						<p className="lead">
							Students can be hard to reach organically — most practices
							naturally attract an older following, so student posts may not land
							with the right people.
						</p>
						<p>
							Paid social extends your message beyond your current followers and
							places it in front of the right audience, targeting by age,
							interests and location near local universities and student
							accommodation.
						</p>
						<p>
							It’s designed to build awareness rather than deliver immediate
							bookings — an effective way to introduce your practice and your
							student offer to a highly active new audience.
						</p>
						<div className="services">
							<h3 className="meta-block__title">Campaign investment</h3>
							<ul>
								<li>Minimum budget of £150 per campaign</li>
								<li>Boosts key messages to a targeted local student audience</li>
								<li>
									Ensures the right people see your offer and find your practice
								</li>
							</ul>
						</div>
					</div>
					<figure className="split__media reveal">
						<img
							src={`${ASSETS}/img/student-a-social.jpg`}
							alt="Equal student offer Instagram story posts"
						/>
					</figure>
				</div>
			</section>

			{/* ============ HOW TO GET INVOLVED ============ */}
			<section className="section">
				<div
					className="wrap cta__inner reveal"
					style={{ textAlign: "left", maxWidth: 760 }}
				>
					<h2 className="display split__title">How to get involved</h2>
					<p className="lead">
						The best and easiest way to receive HG Campaigns is adding them to
						your online Marketing Planner.
					</p>
					<p>
						All you need is your Hakim OneDrive login to access your practice(s)
						portal. We’ll send out artwork and print choices shortly after you
						choose your campaign.
					</p>
					<Link className="btn" to="/dashboard">
						Access the marketing planner
					</Link>
					<p className="fineprint">
						If you’re having issues connecting, please contact{" "}
						<a href="mailto:marketing@hakimgroup.co.uk">
							marketing@hakimgroup.co.uk
						</a>
					</p>
				</div>
			</section>

			{/* ============ FOOTER CTA ============ */}
			<section className="cta">
				<div className="wrap cta__inner reveal">
					<h2 className="display cta__title">Tell us what you think</h2>
					<p>
						Please share your thoughts with us, we’d really appreciate your
						feedback.
					</p>
					<Link className="btn btn--ghost" to={HUB}>
						Back to our campaign overview
					</Link>
				</div>
			</section>
		</DetailShell>
	);
}
