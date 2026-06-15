import { useRef } from "react";
import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import type { LandingPageMeta } from "../registry";
import {
	ASSETS,
	useDocTitle,
	useReveal,
	useScrollSpy,
	useSmoothScroll,
	useStickyHeader,
} from "./_uypp/uypp";
import "./_uypp/uypp-home.scss";

export const meta: LandingPageMeta = {
	slug: "q3-campaigns",
	title: "Unlock Your Practice Potential — Q3 Campaigns",
	description:
		"Hakim Group Q3 2026 campaign hub. Explore core campaigns, brand campaigns and CPD | Education, with a first look at next quarter's artwork.",
	publishedAt: "2026-06-15",
	thumbnail: `${ASSETS}/img/creative-card.jpg`,
};

const SPY_IDS = ["core", "brand", "cpd"];

const BRAND_CARDS = [
	{ no: "Brand 01", title: "Brand campaign one" },
	{ no: "Brand 02", title: "Brand campaign two" },
	{ no: "Brand 03", title: "Brand campaign three" },
];

const CPD_CARDS = [
	{
		no: "CPD module 01",
		title: "Placeholder module",
		body: "Placeholder copy — outline of an accredited CPD module, learning outcomes and estimated time to complete.",
		cta: "Start learning",
	},
	{
		no: "CPD module 02",
		title: "Placeholder module",
		body: "Placeholder copy — outline of an accredited CPD module, learning outcomes and estimated time to complete.",
		cta: "Start learning",
	},
	{
		no: "Resource",
		title: "Placeholder resource",
		body: "Placeholder copy — team toolkit, guide or webinar to support clinical conversations in practice.",
		cta: "Explore",
	},
];

const GALLERY = [
	{ src: "hero-care.jpg", alt: "Care You Can See storefront creative", cap: "Care you can see" },
	{ src: "student-a-posters.jpg", alt: "Equal student offer poster", cap: "Equal student offer" },
	{ src: "dual-posters.jpg", alt: "Dual Wear poster", cap: "Dual wear" },
	{ src: "creative-card.jpg", alt: "Care You Can See creative", cap: "Care you can see" },
	{ src: "student-b-posters.jpg", alt: "Equal student graphic route", cap: "Equal student offer" },
	{ src: "dual-aboard.jpg", alt: "Dual Wear pavement A-board", cap: "Dual wear" },
	{ src: "option-b.jpg", alt: "Care You Can See playful illustration route", cap: "Care you can see" },
	{ src: "student-a-social.jpg", alt: "Equal student offer social posts", cap: "Equal student offer" },
	{ src: "dual-strut.jpg", alt: "Dual Wear strut card", cap: "Dual wear" },
];

export default function Q3Campaigns() {
	const root = useRef<HTMLDivElement>(null);
	const stuck = useStickyHeader();
	const active = useScrollSpy(SPY_IDS);
	useReveal(root);
	useSmoothScroll();
	useDocTitle(meta.title);

	const chip = (id: string) => `chip${active === id ? " is-active" : ""}`;
	const noJump = (e: MouseEvent<HTMLAnchorElement>) => e.preventDefault();

	return (
		<div className="uypp-home" id="top" ref={root}>
			{/* ============ TOP BAR ============ */}
			<header className={`topbar${stuck ? " is-stuck" : ""}`}>
				<div className="wrap topbar__inner">
					<a className="brand" href="#top">
						<img
							className="brand__mark"
							src={`${ASSETS}/img/hakim-circle.svg`}
							alt=""
							aria-hidden="true"
						/>
						<span className="brand__divider" aria-hidden="true" />
						<img
							className="brand__wordmark"
							src={`${ASSETS}/img/hakim-wordmark.svg`}
							alt="Hakim Group"
						/>
					</a>
					<nav className="topnav" aria-label="Campaign types">
						<a href="#core" className={chip("core")}>
							Core campaigns
						</a>
						<a href="#brand" className={chip("brand")}>
							Brand campaigns
						</a>
						<a href="#cpd" className={chip("cpd")}>
							CPD | Education
						</a>
					</nav>
				</div>
			</header>

			{/* ============ HERO ============ */}
			<section className="hero">
				<div className="hero__ph" aria-hidden="true">
					<span className="hero__ph-label">Header image · placeholder</span>
				</div>
				<div className="hero__overlay" />
				<div className="wrap hero__content">
					<p className="eyebrow eyebrow--light reveal">Q3 Campaigns</p>
					<h1 className="hero__title reveal">
						Unlock Your
						<br />
						Practice Potential
					</h1>
					<p className="hero__sub reveal">
						Discover campaigns designed to help your practice connect, engage
						and grow.
					</p>
					<div className="hero__cta reveal">
						<a href="#core" className="btn">
							Explore campaigns
						</a>
						<a href="#artwork" className="btn btn--ghost btn--ghost-light">
							See the artwork
						</a>
					</div>
				</div>
				<div className="hero__scroll" aria-hidden="true">
					<span>Scroll</span>
					<span className="hero__scroll-line" />
				</div>
			</section>

			{/* ============ INTRO ============ */}
			<section className="section section--intro">
				<div className="wrap">
					<p className="lead reveal">
						Explore ready-to-use campaign ideas, creative assets and practical
						guidance to support your marketing throughout the year. From
						seasonal retail opportunities to clinical awareness campaigns, each
						collection brings together the tools, messaging and inspiration you
						need to activate with confidence.
					</p>
					<div className="quicklinks">
						<a href="#core" className="quicklink reveal">
							<span className="quicklink__no">01</span>
							<span className="quicklink__label">Core campaigns</span>
							<span className="quicklink__arrow" aria-hidden="true">
								→
							</span>
						</a>
						<a href="#brand" className="quicklink reveal">
							<span className="quicklink__no">02</span>
							<span className="quicklink__label">Brand campaigns</span>
							<span className="quicklink__arrow" aria-hidden="true">
								→
							</span>
						</a>
						<a href="#cpd" className="quicklink reveal">
							<span className="quicklink__no">03</span>
							<span className="quicklink__label">CPD | Education</span>
							<span className="quicklink__arrow" aria-hidden="true">
								→
							</span>
						</a>
					</div>
				</div>
			</section>

			{/* ============ CORE CAMPAIGNS ============ */}
			<section className="section" id="core">
				<div className="wrap">
					<div className="section-head reveal">
						<span className="section-head__kicker">01 — Live now</span>
						<h2 className="display section-head__title">Core campaigns</h2>
						<p className="lead lead--narrow">
							Practice-building campaigns ready to activate across print,
							digital and in-practice touchpoints.
						</p>
					</div>

					<div className="cards">
						<Link className="card card--feature reveal" to="/landing/care-you-can-see">
							<div className="card__media">
								<img
									src={`${ASSETS}/img/creative-card.jpg`}
									alt="Care You Can See campaign creative"
								/>
								<span className="card__badge">Ready to use</span>
							</div>
							<div className="card__body">
								<span className="card__no">Campaign 01</span>
								<h3 className="card__title">Care you can see</h3>
								<p>
									A campaign focusing on what sets independent opticians apart;
									longer chair time, a more personal approach and advanced
									clinical equipment.
								</p>
								<span className="card__cta">
									View campaign <span aria-hidden="true">→</span>
								</span>
							</div>
						</Link>

						<Link className="card reveal" to="/landing/equal-student-offer">
							<div className="card__media">
								<img
									src={`${ASSETS}/img/student-a-posters.jpg`}
									alt="Equal student offer campaign creative"
								/>
								<span className="card__badge">Ready to use</span>
							</div>
							<div className="card__body">
								<span className="card__no">Campaign 02</span>
								<h3 className="card__title">Equal student offer</h3>
								<p>
									A bold, duotone campaign that plays on the Equal brand name to
									drive frame sales and build loyalty with younger, student
									patients.
								</p>
								<span className="card__cta">
									View campaign <span aria-hidden="true">→</span>
								</span>
							</div>
						</Link>

						<Link className="card reveal" to="/landing/dual-wear">
							<div className="card__media">
								<img
									src={`${ASSETS}/img/dual-posters.jpg`}
									alt="Dual Wear campaign creative"
								/>
								<span className="card__badge">Ready to use</span>
							</div>
							<div className="card__body">
								<span className="card__no">Campaign 03</span>
								<h3 className="card__title">Dual Wear</h3>
								<p>
									This campaign targets consumers travelling outside of the peak
									summer season, encouraging a second pair for sun and everyday
									wear.
								</p>
								<span className="card__cta">
									View campaign <span aria-hidden="true">→</span>
								</span>
							</div>
						</Link>
					</div>
				</div>
			</section>

			{/* ============ BRAND CAMPAIGNS ============ */}
			<section className="section section--tint" id="brand">
				<div className="wrap">
					<div className="section-head reveal">
						<span className="section-head__kicker">02 — In production</span>
						<h2 className="display section-head__title">Brand campaigns</h2>
						<p className="lead lead--narrow">
							Bring leading eyewear brands to life in your practice with
							co-branded creative and retail-ready assets.
						</p>
					</div>

					<div className="cards">
						{BRAND_CARDS.map((c) => (
							<a
								key={c.no}
								className="card reveal"
								href="#"
								onClick={noJump}
							>
								<div className="card__media">
									<div className="ph ph--brand">
										<span>Placeholder image</span>
									</div>
									<span className="card__badge card__badge--soon">
										Coming soon
									</span>
								</div>
								<div className="card__body">
									<span className="card__no">{c.no}</span>
									<h3 className="card__title">{c.title}</h3>
									<p>
										Placeholder copy — a short description of the brand campaign,
										its core message and the retail opportunity it unlocks for
										your practice.
									</p>
									<span className="card__cta">
										View campaign <span aria-hidden="true">→</span>
									</span>
								</div>
							</a>
						))}
					</div>
				</div>
			</section>

			{/* ============ CPD | EDUCATION ============ */}
			<section className="section" id="cpd">
				<div className="wrap">
					<div className="section-head reveal">
						<span className="section-head__kicker">03 — Learning</span>
						<h2 className="display section-head__title">CPD | Education</h2>
						<p className="lead lead--narrow">
							Accredited learning and team resources to grow clinical confidence
							and keep your practice ahead.
						</p>
					</div>

					<div className="cards cards--cpd">
						{CPD_CARDS.map((c) => (
							<a
								key={c.no}
								className="card card--cpd reveal"
								href="#"
								onClick={noJump}
							>
								<div className="card__body">
									<span className="card__no">{c.no}</span>
									<h3 className="card__title">{c.title}</h3>
									<p>{c.body}</p>
									<span className="card__cta">
										{c.cta} <span aria-hidden="true">→</span>
									</span>
								</div>
							</a>
						))}
					</div>
				</div>
			</section>

			{/* ============ ARTWORK / PLACEMENTS EXPLORER ============ */}
			<section className="section section--dark" id="artwork">
				<div className="wrap">
					<div className="section-head section-head--light reveal">
						<span className="section-head__kicker">Sneak peek</span>
						<h2 className="display section-head__title">
							Artwork highlights from next quarter
						</h2>
						<p className="lead lead--narrow">
							A first look at the creative landing across our upcoming
							campaigns — a taste of what’s coming to your practice.
						</p>
					</div>

					<div className="gallery">
						{GALLERY.map((g, i) => (
							<figure key={`${g.src}-${i}`} className="gallery__item reveal">
								<img
									src={`${ASSETS}/img/${g.src}`}
									alt={g.alt}
									loading="lazy"
								/>
								<figcaption className="gallery__cap">{g.cap}</figcaption>
							</figure>
						))}
					</div>
				</div>
			</section>

			{/* ============ FOOTER CTA ============ */}
			<section className="cta">
				<div className="wrap cta__inner reveal">
					<h2 className="display cta__title">Ready to activate?</h2>
					<p>
						Add campaigns to your Marketing Planner with your Hakim OneDrive
						login — we’ll send artwork and print choices shortly after you
						choose.
					</p>
					<Link className="btn" to="/dashboard">
						Open the Marketing Planner
					</Link>
				</div>
			</section>

			<footer className="foot">
				<div className="wrap foot__inner">
					<img
						className="brand__wordmark"
						src={`${ASSETS}/img/hakim-wordmark-light.svg`}
						alt="Hakim Group"
					/>
					<span>Unlock Your Practice Potential</span>
				</div>
			</footer>
		</div>
	);
}
