import { useState } from "react";
import type { KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import type { LandingPageMeta } from "../registry";
import { ASSETS } from "./_uypp/uypp";
import { DetailShell, HUB } from "./_uypp/DetailShell";
import { ArtExplorer } from "./_uypp/explorer";
import type { ArtSet, Tile } from "./_uypp/explorer";

export const meta: LandingPageMeta = {
	slug: "care-you-can-see",
	title: "Care You Can See — Hakim Group Campaign",
	description:
		"Core campaign 01. A campaign focusing on what sets independent opticians apart: longer chair time, a more personal approach and advanced clinical equipment.",
	publishedAt: "2026-06-15",
	thumbnail: `${ASSETS}/img/creative-card.jpg`,
	hidden: true,
};

const img = (file: string, cap: string): Tile => ({
	img: `${ASSETS}/img/${file}`,
	cap,
});
const ph: Tile = { ph: true };

const ROUTE = { a: "Clinical Lifestyle", b: "Playful Illustration" } as const;

const ART: Record<"a" | "b", ArtSet> = {
	a: {
		posters: [
			img("creative-card.jpg", "Window poster"),
			img("poster-mounted.jpg", "In-practice mounted poster"),
			img("option-a.jpg", "Clinical lifestyle poster"),
			ph,
		],
		strut: [
			img("strut.png", "Counter strut card"),
			img("storefront.jpg", "Desk strut card"),
			ph,
			ph,
		],
		aboard: [img("aboard.jpg", "Pavement A-board"), ph, ph, ph],
		iptv: [img("hero-care.jpg", "Window IPTV screens"), ph, ph, ph],
		recall: [ph, ph, ph, ph],
		email: [img("email-portrait.jpg", "Patient recall email"), ph, ph],
		social: [ph, ph, ph, ph],
	},
	b: {
		posters: [img("option-b.jpg", "Window poster"), ph, ph, ph],
		strut: [ph, ph, ph, ph],
		aboard: [ph, ph, ph, ph],
		iptv: [ph, ph, ph, ph],
		recall: [ph, ph, ph, ph],
		email: [ph, ph, ph],
		social: [img("option-b.jpg", "Social post"), ph, ph, ph],
	},
};

export default function CareYouCanSee() {
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
					src={`${ASSETS}/img/hero-care.jpg`}
					alt="Care You Can See campaign in an independent opticians storefront"
				/>
				<div className="hero__overlay" />
				<div className="wrap hero__content">
					<p className="eyebrow eyebrow--light reveal">
						Q3 Campaigns · Unlock Your Practice Potential
					</p>
					<h1 className="hero__title reveal">Care You Can See</h1>
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
							<p className="eyebrow">Core campaign 01</p>
							<h2 className="display intro__heading">Care you can see</h2>
							<p className="lead">
								A campaign focusing on what sets independent opticians apart;
								longer chair time, a more personal approach and advanced clinical
								equipment. With two visual routes available so you can choose the
								creative style that best fits your practice.
							</p>
						</div>
						<ul className="intro__points reveal">
							<li>
								Helps patients understand the value of a more thorough eye exam
							</li>
							<li>Positions your practice as clinical, trusted and personal</li>
							<li>Supports enhanced eye exam conversations</li>
							<li>Encourages bookings without relying on discounts or offers</li>
							<li>
								Differentiates independent opticians in a soft, non-comparative
								way
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
							src={`${ASSETS}/img/creative-card.jpg`}
							alt="Care You Can See creative shown in practice"
						/>
					</figure>
					<div className="glance__panel reveal">
						<div className="meta-block">
							<h3 className="meta-block__title">Best for practices who want to</h3>
							<p>
								Increase enhanced eye exam bookings, promote clinical expertise
								and remind patients why independent eye care is worth choosing.
							</p>
						</div>
						<div className="meta-block">
							<h3 className="meta-block__title">Core KPI</h3>
							<p className="pipes">
								Volume <span>|</span> Revenue
							</p>
						</div>
						<div className="meta-block">
							<h3 className="meta-block__title">Audience</h3>
							<p className="pipes">
								Existing patients <span>|</span> Lapsed patients <span>|</span>{" "}
								New patients
							</p>
						</div>
						<div className="meta-block">
							<h3 className="meta-block__title">Best time to run</h3>
							<p className="pipes">
								Quieter diary periods <span>|</span> Increase in eye exam uptake
								needed
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* ============ STATS ============ */}
			<section className="section">
				<div className="wrap stats">
					<div className="stat reveal">
						<span className="stat__num display">
							90<span className="stat__unit">%</span>
						</span>
						<span className="stat__label">Supporting data point</span>
					</div>
					<div className="stat reveal">
						<span className="stat__num display">360</span>
						<span className="stat__label">Supporting data point</span>
					</div>
					<div className="stat reveal">
						<span className="stat__num display">2/5</span>
						<span className="stat__label">Supporting data point</span>
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
								Care You Can See comes in two visual routes. Select one to
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
								Clinical Lifestyle
							</button>
							<button
								type="button"
								className={`toggle__btn${opt === "b" ? " toggle__btn--active" : ""}`}
								role="tab"
								aria-selected={opt === "b"}
								onClick={() => setOpt("b")}
							>
								Playful Illustration
							</button>
						</div>
					</div>

					<div className="options" data-active={opt}>
						<article
							className={`option reveal ${opt === "a" ? "option--feature" : "option--muted"}`}
							role="button"
							tabIndex={0}
							aria-pressed={opt === "a"}
							aria-label="Select the Clinical Lifestyle route"
							onClick={() => setOpt("a")}
							onKeyDown={onKey("a")}
						>
							<figure className="option__media">
								<img
									src={`${ASSETS}/img/option-a.jpg`}
									alt="Clinical lifestyle creative route"
								/>
								<span className="option__check" aria-hidden="true">
									✓
								</span>
							</figure>
							<div className="option__body">
								<span className="tag">Option A · Photography</span>
								<h3 className="option__title">Clinical Lifestyle</h3>
								<p>
									A polished, reassuring route with premium photography of real
									people and a calm clinical feel.
								</p>
								<span className="option__status" aria-hidden="true" />
							</div>
						</article>
						<article
							className={`option reveal ${opt === "b" ? "option--feature" : "option--muted"}`}
							role="button"
							tabIndex={0}
							aria-pressed={opt === "b"}
							aria-label="Select the Playful Illustration route"
							onClick={() => setOpt("b")}
							onKeyDown={onKey("b")}
						>
							<figure className="option__media">
								<img
									src={`${ASSETS}/img/option-b.jpg`}
									alt="Playful illustration creative route"
								/>
								<span className="option__check" aria-hidden="true">
									✓
								</span>
							</figure>
							<div className="option__body">
								<span className="tag">Option B · Illustration</span>
								<h3 className="option__title">Playful Illustration</h3>
								<p>
									A character-led route that makes clinical eye care feel
									friendly, approachable and easy to engage with.
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
							This campaign helped us talk about clinical care in a way that felt
							simple, reassuring and really easy for patients to understand.
						</p>
						<footer className="quote__by">— Chris Tannorella</footer>
					</blockquote>
				</div>
			</section>

			{/* ============ BRINGING TO LIFE ============ */}
			<section className="section">
				<div className="wrap split">
					<figure className="split__media reveal">
						<img
							src={`${ASSETS}/img/storefront.jpg`}
							alt="Independent opticians storefront"
						/>
					</figure>
					<div className="split__body reveal">
						<h2 className="display split__title">
							Bringing this campaign to life
						</h2>
						<p className="lead">
							Use this campaign across physical and digital touchpoints to keep
							the message consistent and visible.
						</p>
						<p>
							Run in-practice POS, email, social and digital screen assets
							together to support awareness and encourage patients to book a more
							thorough eye examination.
						</p>
						<p>
							Encourage teams to use the campaign as a conversation starter around
							enhanced testing, OCT, Optomap and wider clinical expertise.
						</p>
						<div className="services">
							<h3 className="meta-block__title">Services to include</h3>
							<ul>
								<li>Enhanced eye examinations</li>
								<li>OCT / Optomap</li>
								<li>Additional clinical testing available</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* ============ HOW TO GET INVOLVED ============ */}
			<section className="section section--tint">
				<div className="wrap split split--reverse">
					<div className="split__body reveal">
						<h2 className="display split__title">How to get involved</h2>
						<p className="lead">
							The best and easiest way to receive HG Campaigns is adding them to
							your online Marketing Planner.
						</p>
						<p>
							All you need is your Hakim OneDrive login to access your
							practice(s) portal. We’ll send out artwork and print choices
							shortly after you choose your campaign.
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

					<figure className="email-card reveal">
						<img
							className="email-card__img"
							src={`${ASSETS}/img/email-portrait.jpg`}
							alt="Patient recall email creative"
						/>
						<figcaption className="email-card__body">
							<p className="email-card__from">
								<strong>Care you can see</strong>
								<br />
								<span>to me · 3:00 PM</span>
							</p>
							<p>Dear [Patient]</p>
							<p>
								At your eye examination, we do more than check your prescription.
							</p>
							<p>
								We take the time to understand your eyes, your concerns, and what
								matters to you.
							</p>
							<p>
								With in-depth testing, specialist imaging and expert care, we
								build a clearer picture of your eye health.
							</p>
							<p className="email-card__cta">
								<strong>Book your eye examination today.</strong>
							</p>
							<p>
								We’d love to hear from you,
								<br />
								Your Opticians
							</p>
							<p className="email-card__meta">
								The opticians address · www.theopticians.co.uk · 012 345 678 90
							</p>
						</figcaption>
					</figure>
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
