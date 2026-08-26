import { useRef } from "react";
import { Link } from "react-router-dom";
import type { LandingPageMeta } from "../../../registry";
import {
	ASSETS,
	img,
	useDocTitle,
	useReveal,
	useScrollSpy,
	useSmoothScroll,
	useStickyHeader,
	useTypography,
} from "../uypp-q4";
import { CardCycle, CpdSession } from "../HomeBits";
import { PLANNER_HOME } from "../links";
import "../uypp-q4-home.scss";

export const meta: LandingPageMeta = {
	slug: "q4-campaigns",
	title: "Unlock Your Practice Potential — Q4 Campaigns",
	description:
		"Hakim Group Q4 2026 campaign hub. Featured campaigns, evergreen assets, supplier-funded brand add-ons and related CPD sessions, with the artwork for each.",
	publishedAt: "2026-08-26",
	thumbnail: `${ASSETS}/img/pres-adapt-posters-situ.jpg`,
};

/** Sections with a nav chip. Add to both this list and the chip's data-spy, or
 *  the chip never lights up. #cpd is here without a chip on purpose: it stops the
 *  Brand assets chip staying lit once you scroll past it. */
const SPY_IDS = ["featured", "evergreen", "brand-assets", "cpd"];

export default function Q4Campaigns() {
	const root = useRef<HTMLDivElement>(null);
	const stuck = useStickyHeader();
	const active = useScrollSpy(SPY_IDS);
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
					<nav className="topnav" aria-label="Campaign types">
						<a href="#featured" className={chip("featured")} data-spy="featured">
							Featured<span className="chip__suffix"> campaigns</span>
						</a>
						<a href="#evergreen" className={chip("evergreen")} data-spy="evergreen">
							Evergreen<span className="chip__suffix"> assets</span>
						</a>
						<a href="#brand-assets" className={chip("brand-assets")} data-spy="brand-assets">
							Brand<span className="chip__suffix"> assets</span>
						</a>
					</nav>
				</div>
			</header>

			<main>
			{/* ============ HERO ============ */}

			<section className="hero">
				<img className="hero__img is-active" src={img("pres-adapt-posters-situ.jpg")} alt="" aria-hidden="true" />
				<div className="hero__overlay">
				</div>
				<div className="wrap hero__content">
					<p className="eyebrow eyebrow--light reveal">
						Q4 2026 Campaigns · October to December
					</p>
					<h1 className="hero__title reveal">
						Unlock Your
						<br />
						Practice Potential
					</h1>
					<p className="hero__sub reveal">
						Discover campaigns designed to help your practice connect, engage and grow.
					</p>
					{/* Same three destinations and the same wording as the nav bar, so the header and
					    the nav agree. Outlined-on-dark, which fills HG pink on hover. */}
					<div className="hero__cta reveal">
						<a href="#featured" className="btn btn--ghost-light">
							Featured
							<span className="chip__suffix">
								{" "}
								campaigns
							</span>
						</a>
						<a href="#evergreen" className="btn btn--ghost-light">
							Evergreen
							<span className="chip__suffix">
								{" "}
								assets
							</span>
						</a>
						<a href="#brand-assets" className="btn btn--ghost-light">
							Brand
							<span className="chip__suffix">
								{" "}
								assets
							</span>
						</a>
					</div>
				</div>
				{/* Scroll cue. Full screen, the section below the hero is a pale band, so there was
				    nothing to say the page continued. A real link rather than decoration, so it works
				    by keyboard and does something if you click it. */}
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
						Unlock Your Practice Potential is your all-in-one toolkit, designed to help your practice achieve its core KPIs. Inside you'll find our campaigns for Q4, along with the supporting brand activations, each one showing exactly how it drives core KPIs and what tools, tips and support are available to help you put it into action with confidence.
					</p>
					<div className="quicklinks">
						<a href="#featured" className="quicklink reveal">
							<span className="quicklink__label">
								Featured campaigns
							</span>
							<span className="quicklink__arrow" aria-hidden="true">
								→
							</span>
						</a>
						<a href="#evergreen" className="quicklink reveal">
							<span className="quicklink__label">
								Evergreen assets
							</span>
							<span className="quicklink__arrow" aria-hidden="true">
								→
							</span>
						</a>
						<a href="#brand-assets" className="quicklink reveal">
							<span className="quicklink__label">
								Brand assets
							</span>
							<span className="quicklink__arrow" aria-hidden="true">
								→
							</span>
						</a>
					</div>
				</div>
			</section>

			{/* ============ CAMPAIGNS ============ */}

			<section className="section" id="featured">
				<div className="wrap">
					<div className="section-head reveal">
						<h2 className="display section-head__title">
							Featured campaigns
						</h2>
						<p className="lead lead--narrow">
							Featured Hakim Group campaigns, ready to activate across print, digital and in-practice touchpoints.
							{" "}
							<strong>
								Choose one a month
							</strong>
							{" "}
							as your main local marketing focus.
						</p>
					</div>
					<div className="cards">
						<Link className="card card--feature reveal" to="/landing/presbyopia">
							<div className="card__tab">
								<span className="card__month">
									October
								</span>
							</div>
							<CardCycle images={[{ src: img("pres-adapt-posters.jpg"), alt: "Presbyopia campaign posters" }, { src: img("pres-type-posters.jpg"), alt: "" }, { src: img("pres-bigger-keyvisual.jpg"), alt: "" }]} delayMs={0} />
							<div className="card__body">
								<h3 className="card__title">
									Presbyopia
								</h3>
								<p>
									Many people don’t realise their close-up vision is changing, they simply adapt. Three creative routes highlight the everyday signs of presbyopia to build awareness and encourage action.
								</p>
								<p className="card__meta">
									<span>
										3 creative routes
									</span>
								</p>
								<span className="card__cta">
									View campaign
									{" "}
									<span aria-hidden="true">
										→
									</span>
								</span>
							</div>
						</Link>
						<Link className="card reveal" to="/landing/dry-eye-menopause">
							<div className="card__tab">
								<span className="card__month">
									October
								</span>
							</div>
							<CardCycle images={[{ src: img("meno-prickly-posters.jpg"), alt: "Dry Eye and Menopause campaign posters" }, { src: img("meno-ripple-keyvisual.jpg"), alt: "" }]} delayMs={900} />
							<div className="card__body">
								<h3 className="card__title">
									Dry Eye & Menopause
								</h3>
								<p>
									Dry eye is a common but often overlooked symptom of menopause. Two creative routes use distinctive illustration and relatable lifestyle imagery to raise awareness of the link.
								</p>
								<p className="card__meta">
									<span>
										2 creative routes
									</span>
								</p>
								<span className="card__cta">
									View campaign
									{" "}
									<span aria-hidden="true">
										→
									</span>
								</span>
							</div>
						</Link>
						<Link className="card reveal" to="/landing/black-friday">
							<div className="card__tab">
								<span className="card__month">
									November
								</span>
							</div>
							<CardCycle images={[{ src: img("bf-strip-window-situ.jpg"), alt: "Black Friday window poster in a practice" }, { src: img("bf-arrow-window-situ.jpg"), alt: "" }, { src: img("bf-block-window-situ.jpg"), alt: "" }]} delayMs={1800} />
							<div className="card__body">
								<h3 className="card__title">
									Black Friday
								</h3>
								<p>
									Proven assets with amendable discounts and offers depending on the practice. Pick a treatment, drop your own offer in.
								</p>
								<p className="card__meta">
									<span>
										3 poster treatments
									</span>
								</p>
								<span className="card__cta">
									View campaign
									{" "}
									<span aria-hidden="true">
										→
									</span>
								</span>
							</div>
						</Link>
						<Link className="card reveal" to="/landing/festive-windows">
							<div className="card__tab">
								<span className="card__month">
									December
								</span>
							</div>
							<CardCycle images={[{ src: img("festive-easy-1.jpg"), alt: "Festive window display inspiration" }, { src: img("festive-spark.jpg"), alt: "" }]} delayMs={2700} />
							<div className="card__body">
								<h3 className="card__title">
									Festive Windows, Christmas gifting and party season
								</h3>
								<p>
									A step, jump, leap approach, from simple off-the-shelf decor through to a fully bespoke installation.
								</p>
								<p className="card__meta">
									<span>
										3 creative routes
									</span>
								</p>
								<span className="card__cta">
									View campaign
									{" "}
									<span aria-hidden="true">
										→
									</span>
								</span>
							</div>
						</Link>
					</div>
				</div>
			</section>

			{/* ============ ALWAYS ON ============ */}

			<section className="section section--tint-deep" id="evergreen">
				<div className="wrap">
					<div className="section-head reveal">
						<h2 className="display section-head__title">
							Evergreen assets
						</h2>
						{/* Deliberately does not open with "Always-on assets" or "Evergreen assets": the
						    heading directly above is now "Evergreen assets", so either would repeat it. */}
						<p className="lead lead--narrow">
							Available to order
							{" "}
							<strong>
								in addition to
							</strong>
							{" "}
							your featured campaign. No campaign window to work to, so you can run them whenever you need them.
						</p>
					</div>
					<div className="cards">
						<Link className="card reveal" to="/landing/outside-prescriptions">
							<div className="card__tab">
								<span className="card__month">
									Festive edition
								</span>
							</div>
							<div className="card__media">
								<img src={img("evergreen-outside-rx-assets.jpg")} alt="Outside prescriptions welcome A-board and poster" />
							</div>
							<div className="card__body">
								<h3 className="card__title">
									Outside Prescriptions
								</h3>
								<p>
									Your prescription, our frames. Captures dispensing revenue from patients who had their eyes tested somewhere else.
								</p>
								<span className="card__cta">
									View assets
									{" "}
									<span aria-hidden="true">
										→
									</span>
								</span>
							</div>
						</Link>
						<Link className="card reveal" to="/landing/eye-exams-available">
							<div className="card__tab">
								<span className="card__month">
									Festive edition
								</span>
							</div>
							<div className="card__media">
								<img src={img("evergreen-eye-exams-assets.jpg")} alt="Eye exams available A-board and poster, festive edition" />
							</div>
							<div className="card__body">
								<h3 className="card__title">
									Eye Exams Available
								</h3>
								<p>
									The simplest message a practice can put on the pavement. Fills quiet diary slots without discounting.
								</p>
								<span className="card__cta">
									View assets
									{" "}
									<span aria-hidden="true">
										→
									</span>
								</span>
							</div>
						</Link>
						<a className="card reveal" href="#" data-placeholder-link="">
							<div className="card__tab">
								<span className="card__badge card__badge--soon">
									Coming soon
								</span>
							</div>
							<div className="card__media">
								<div className="ph-block">
									<span>
										More to come
									</span>
								</div>
							</div>
							<div className="card__body">
								<h3 className="card__title">
									More always-on assets
								</h3>
								<p>
									Further evergreen assets are available to order in addition to those shown here. Categorisation is still being confirmed.
								</p>
								<span className="card__cta">
									Coming soon
									{" "}
									<span aria-hidden="true">
										→
									</span>
								</span>
							</div>
						</a>
					</div>
				</div>
			</section>

			<section className="section" id="brand-assets">
				<div className="wrap">
					<div className="section-head reveal">
						<h2 className="display section-head__title">
							Brand assets
						</h2>
						<p className="lead lead--narrow">
							Supplier-funded
							{" "}
							<strong>
								add-ons
							</strong>
							, not a campaign in their own right. Pair them with a featured campaign or an evergreen asset and the supplier provides the artwork, training and offer, to help elevate a category or product range in practice. Every one this quarter attaches to a featured campaign — select a supplier to see what it includes and how to take it up.
						</p>
					</div>
					{/* A static index, not a gallery. Every logo links to that supplier's block on the
					    campaign it supports, which opens on arrival — so this section's job is to say
					    what exists and hand you to the detail, not to hold the detail itself.
					    It used to cycle one logo at a time per column. That was fine while the logos
					    were decoration; it is wrong now they are links, because the target moves under
					    the cursor every 2.8 seconds and is worse again for anyone tabbing through.
					    The line-up follows each brand's OWN slide in the Q4 brief. Note that slide 3's
					    summary grid disagrees with those slides — it puts Boss, ProDesign and Oakley in
					    November, while their own pages put them in December under Festive Windows. Worth
					    settling with marketing; November is a single entry until it is. */}
					<div className="partners reveal">
						<div className="partners__grid">
							<div className="partners__col">
								<p className="partners__month">
									October
								</p>
								<ul className="brandindex">
									<li>
										<Link className="brandindex__item" to="/landing/presbyopia#brand-hoya">
											<span className="brandindex__logo">
												<img src={img("logo-hoya.png")} alt="HOYA" loading="lazy" />
											</span>
											<span className="brandindex__with">
												with Presbyopia
											</span>
										</Link>
									</li>
									<li>
										<Link className="brandindex__item" to="/landing/presbyopia#brand-coopervision">
											<span className="brandindex__logo">
												<img src={img("logo-coopervision.png")} alt="CooperVision" loading="lazy" />
											</span>
											<span className="brandindex__with">
												with Presbyopia
											</span>
										</Link>
									</li>
									<li>
										<Link className="brandindex__item" to="/landing/presbyopia#brand-bausch-lomb">
											<span className="brandindex__logo">
												<img src={img("logo-bausch-lomb.png")} alt="Bausch + Lomb" loading="lazy" />
											</span>
											<span className="brandindex__with">
												with Presbyopia
											</span>
										</Link>
									</li>
									<li>
										<Link className="brandindex__item" to="/landing/dry-eye-menopause#brand-thea">
											<span className="brandindex__logo">
												<img src={img("logo-thea.png")} alt="Thea" loading="lazy" />
											</span>
											<span className="brandindex__with">
												with Dry Eye & Menopause
											</span>
										</Link>
									</li>
									<li>
										<Link className="brandindex__item" to="/landing/dry-eye-menopause#brand-body-doctor">
											<span className="brandindex__logo">
												<img src={img("logo-body-doctor.png")} alt="The Body Doctor" loading="lazy" />
											</span>
											<span className="brandindex__with">
												with Dry Eye & Menopause
											</span>
										</Link>
									</li>
								</ul>
							</div>
							<div className="partners__col">
								<p className="partners__month">
									November
								</p>
								<ul className="brandindex">
									<li>
										<Link className="brandindex__item" to="/landing/black-friday#brand-scope">
											<span className="brandindex__logo">
												<img src={img("logo-scope.png")} alt="Scope" loading="lazy" />
											</span>
											<span className="brandindex__with">
												with Black Friday
												<span className="brandindex__tbc">
													TBC
												</span>
											</span>
										</Link>
									</li>
								</ul>
							</div>
							<div className="partners__col">
								<p className="partners__month">
									December
								</p>
								<ul className="brandindex">
									<li>
										<Link className="brandindex__item" to="/landing/festive-windows#brand-boss">
											<span className="brandindex__logo">
												<img src={img("logo-boss.png")} alt="BOSS" loading="lazy" />
											</span>
											<span className="brandindex__with">
												with Festive Windows
											</span>
										</Link>
									</li>
									<li>
										<Link className="brandindex__item" to="/landing/festive-windows#brand-oakley">
											<span className="brandindex__logo">
												<img src={img("logo-oakley.png")} alt="Oakley" loading="lazy" />
											</span>
											<span className="brandindex__with">
												with Festive Windows
											</span>
										</Link>
									</li>
									<li>
										<Link className="brandindex__item" to="/landing/festive-windows#brand-ted-baker">
											<span className="brandindex__logo">
												<img src={img("logo-ted-baker.png")} alt="Ted Baker" loading="lazy" />
											</span>
											<span className="brandindex__with">
												with Festive Windows
												<span className="brandindex__tbc">
													TBC
												</span>
											</span>
										</Link>
									</li>
									<li>
										<Link className="brandindex__item" to="/landing/festive-windows#brand-design-eyewear">
											<span className="brandindex__logo">
												<img src={img("logo-prodesign.png")} alt="Design Eyewear Group" loading="lazy" />
											</span>
											<span className="brandindex__with">
												with Festive Windows
											</span>
										</Link>
									</li>
									<li>
										<Link className="brandindex__item" to="/landing/festive-windows#brand-thea">
											<span className="brandindex__logo">
												<img src={img("logo-thea.png")} alt="Thea" loading="lazy" />
											</span>
											<span className="brandindex__with">
												with Festive Windows
											</span>
										</Link>
									</li>
									<li>
										<Link className="brandindex__item" to="/landing/festive-windows#brand-silhouette">
											<span className="brandindex__logo">
												<img src={img("logo-silhouette.png")} alt="Silhouette" loading="lazy" />
											</span>
											<span className="brandindex__with">
												with Festive Windows
												<span className="brandindex__tbc">
													TBC
												</span>
											</span>
										</Link>
									</li>
									<li>
										<Link className="brandindex__item" to="/landing/festive-windows#brand-alcon">
											<span className="brandindex__logo">
												<img src={img("logo-alcon.png")} alt="Alcon" loading="lazy" />
											</span>
											<span className="brandindex__with">
												with Festive Windows
												<span className="brandindex__tbc">
													TBC
												</span>
											</span>
										</Link>
									</li>
									<li>
										<Link className="brandindex__item" to="/landing/festive-windows#brand-bausch-lomb">
											<span className="brandindex__logo">
												<img src={img("logo-bausch-lomb.png")} alt="Bausch + Lomb" loading="lazy" />
											</span>
											<span className="brandindex__with">
												with Festive Windows
												<span className="brandindex__tbc">
													TBC
												</span>
											</span>
										</Link>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Added 26 August 2026 at David's request. Note this reverses the long-standing rule
			    "never re-add CPD | Education" — that referred to a CPD block removed from the campaign
			    series in July. These are two specific, dated sessions tied to Q4 campaign subjects, not
			    the old catch-all section. The rule has been updated in README.md and CLAUDE.md so the
			    section is not stripped back out by someone following the old note.
			    Same shape as Brand assets above it: section heading, a lead saying what these are and
			    how they relate, then the content. Registration links are external event pages rather
			    than planner destinations, so they sit in the markup — campaign-links.js is the single
			    source of truth for planner and supplier destinations specifically. */}

			<section className="section section--tint" id="cpd">
				<div className="wrap">
					<div className="section-head reveal">
						<h2 className="display section-head__title">
							Related CPD sessions
						</h2>
						<p className="lead lead--narrow">
							Sessions that sit alongside this quarter's campaigns, so the team is ready for the conversations the artwork starts. Book directly with the organiser — these are not ordered through the Marketing Planner.
						</p>
					</div>
					{/* Collapsed to title, presenter and CPD points; the rest opens on click. Same
					    control as the Supplier support rows on the campaign pages, rebuilt here because
					    the hub has no detail.js — the toggle lives in app.js. */}
					<div className="cpdlist">
											<CpdSession
						id="forever-young"
						name="Forever young: because adventures don't stop at 45"
						by="CooperVision"
						points="1 CPD point"
					>
						<p className="cpd__meta">
							<span>
								Interactive lecture
							</span>
							<span>
								Thu 29 October · 18:30–20:00
							</span>
						</p>
						<p className="cpd__standfirst">
							Multifocal contact lenses for the modern presbyope.
						</p>
						<p>
							This session covers the latest research-driven definition of presbyopia and its relevance to both emerging and established presbyopes, with a focus on the psychological and physiological impact on patients. Featuring real patient video testimonials and peer-to-peer insight from an experienced ECP, delegates will take away practical fitting tips for maximising success with MyDay multifocal and clariti 1 day multifocal.
						</p>
						<p className="cpd__note">
							Please note: BDMs may follow up with practices after this session to offer support and discuss any relevant opportunities.
						</p>
						<a className="btn btn--sm" href="https://events.coopervision.com/213A45" target="_blank" rel="noopener">
							Register
						</a>
					</CpdSession>
											<CpdSession
						id="patient-journey"
						name="Embracing technology to supercharge your patient journey"
						by="Richard Spencer BSc Hons FBDO"
						points="1 CPD point"
					>
						<p className="cpd__meta">
							<span>
								Lecture
							</span>
							<span>
								1 hour
							</span>
							<span>
								Optometrists & dispensing opticians
							</span>
						</p>
						<p className="cpd__standfirst">
							Communication sits at the heart of patient complaints, as OCCS reports consistently show.
						</p>
						<p>
							Built around four themes — understanding your practice and patients, reviewing the patient journey, communicating to build trust, and follow up — this lecture walks through real communication touchpoints, from practice management software to website, educational video and email. Generic in scope, with no product or company recommendations: the aim is to shift how practitioners think about communicating with the patients in front of them.
						</p>
						<dl className="cpd__spec">
							<dt>
								Domain
							</dt>
							<dd>
								Communication
							</dd>
							<dt>
								Learning outcome
							</dt>
							<dd>
								By evaluating your patient journey you will better understand how to modify communication to your patients, whether verbal, written or virtual (s.2).
							</dd>
						</dl>
						<p className="cpd__note">
							Richard Spencer is director at David Burghardt Vision Care, Optician Magazine's Dispensing Optician of the Year 2022 and a current CLiP programme pre-reg optometry student.
						</p>
						<a className="btn btn--sm" href="https://events.teams.microsoft.com/event/a1b98272-f443-410d-b15e-6baafd97f919@b5e2b151-f5b3-403f-a7a2-25f5664f2157" target="_blank" rel="noopener">
							Register on Teams
						</a>
					</CpdSession>
					</div>
				</div>
			</section>

			{/* ============ FOOTER CTA ============ */}

			<section className="cta">
				<div className="wrap cta__inner reveal">
					<h2 className="display cta__title">
						Ready to activate?
					</h2>
					<p>
						Add campaigns to your Marketing Planner with your Hakim Microsoft login.
						<br />
						We'll send artwork and print choices shortly after you choose.
					</p>
					<a className="btn" data-cta="planner-home" target="_blank" rel="noopener">
						Open the Marketing Planner
					</a>
					<p className="cta__fine">
						Any feedback? Email the marketing team at
						<a href="mailto:marketing@hakimgroup.co.uk">
							marketing@hakimgroup.co.uk
						</a>
					</p>
				</div>
			</section>
			</main>

			<footer className="foot">
				<div className="wrap foot__inner">
					<img
						className="brand__logo brand__logo--foot"
						src={img("hg-logo-white.png")}
						alt="Hakim Group"
					/>
					<span>Unlock Your Practice Potential · Q4 2026</span>
				</div>
			</footer>
		</div>
	);
}
