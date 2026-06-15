import { Link } from "react-router-dom";
import type { LandingPageMeta } from "../registry";
import { ASSETS } from "./_uypp/uypp";
import { DetailShell, HUB } from "./_uypp/DetailShell";
import { ArtExplorer } from "./_uypp/explorer";
import type { ArtSet, Tile } from "./_uypp/explorer";

export const meta: LandingPageMeta = {
	slug: "dual-wear",
	title: "Dual Wear — Hakim Group Campaign",
	description:
		"Core campaign 03. Targets consumers travelling outside the peak summer season, encouraging a second pair for sun and everyday wear.",
	publishedAt: "2026-06-15",
	thumbnail: `${ASSETS}/img/dual-posters.jpg`,
	hidden: true,
};

const img = (file: string, cap: string): Tile => ({
	img: `${ASSETS}/img/${file}`,
	cap,
});
const ph: Tile = { ph: true };

const ART: ArtSet = {
	posters: [img("dual-posters.jpg", "Window posters"), ph, ph, ph],
	strut: [img("dual-strut.jpg", "Desk strut card"), ph, ph, ph],
	aboard: [img("dual-aboard.jpg", "Pavement A-board"), ph, ph, ph],
	iptv: [ph, ph, ph, ph],
	recall: [ph, ph, ph, ph],
	email: [ph, ph, ph],
	social: [ph, ph, ph, ph],
};

export default function DualWear() {
	return (
		<DetailShell title={meta.title}>
			{/* ============ HERO ============ */}
			<section className="hero">
				<img
					className="hero__img"
					src={`${ASSETS}/img/dual-hero.jpg`}
					alt="Dual Wear campaign posters in an independent opticians window"
				/>
				<div className="hero__overlay" />
				<div className="wrap hero__content">
					<p className="eyebrow eyebrow--light reveal">
						Q3 Campaigns · Unlock Your Practice Potential
					</p>
					<h1 className="hero__title reveal">Dual Wear</h1>
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
							<p className="eyebrow">Core campaign 03</p>
							<h2 className="display intro__heading">Dual wear | Autumn sun</h2>
							<p className="lead">
								A campaign for patients travelling outside the peak summer season
								— those with the freedom to travel wherever and whenever they
								choose, while still looking stylish on the move. The imagery and
								typography build on the previous quarter’s Dual Wear campaign,
								keeping it consistent with your existing creative.
							</p>
						</div>
						<ul className="intro__points reveal">
							<li>
								Targets autumn and winter travellers without children in school
							</li>
							<li>Pairs contact lenses with a discount on plano sunglasses</li>
							<li>
								Drives recurring revenue through contact lens plan sign-ups
							</li>
							<li>
								Encourages additional pairs and non-prescription sunglasses
							</li>
							<li>A natural prompt for enhanced dispensing conversations</li>
						</ul>
					</div>
				</div>
			</section>

			{/* ============ AT-A-GLANCE ============ */}
			<section className="section section--tint">
				<div className="wrap glance">
					<figure className="glance__media reveal">
						<img
							src={`${ASSETS}/img/dual-aboard.jpg`}
							alt="Dual Wear A-board outside an opticians"
						/>
					</figure>
					<div className="glance__panel reveal">
						<div className="meta-block">
							<h3 className="meta-block__title">Best for practices who want to</h3>
							<p>
								Grow recurring contact lens revenue, sell additional pairs and
								reach patients who travel in the autumn and winter season.
							</p>
						</div>
						<div className="meta-block">
							<h3 className="meta-block__title">Core KPI</h3>
							<p className="pipes">
								Recurring revenue <span>|</span> Additional pairs &amp; revenue
							</p>
						</div>
						<div className="meta-block">
							<h3 className="meta-block__title">Audience</h3>
							<p className="pipes">
								Existing patients <span>|</span> Travellers <span>|</span> New
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
						<span className="stat__num display">
							2<span className="stat__unit">mo</span>
						</span>
						<span className="stat__label">Live across August &amp; September</span>
					</div>
					<div className="stat reveal">
						<span className="stat__num display">365</span>
						<span className="stat__label">
							An all-year-round sunglasses message
						</span>
					</div>
					<div className="stat reveal">
						<span className="stat__num display">+1</span>
						<span className="stat__label">Designed to drive additional pairs</span>
					</div>
				</div>
			</section>

			{/* ============ PLACEMENTS ============ */}
			<section className="section section--dark" id="artwork">
				<div className="wrap">
					<div className="section-head reveal">
						<div>
							<p className="eyebrow">The placements</p>
							<h2 className="display section-head__title">
								See it across your practice
							</h2>
							<p className="lead lead--narrow">
								Built on the <strong className="route-name">Chase the Sun</strong>{" "}
								creative. Choose an asset type to scroll through how it comes to
								life.
							</p>
						</div>
					</div>

					<ArtExplorer data={ART} />
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
							Dual Wear gave us a really natural way to talk about sunglasses and
							contact lenses together — and it kept the conversation going long
							after summer.
						</p>
						<footer className="quote__by">— Practice dispensing team</footer>
					</blockquote>
				</div>
			</section>

			{/* ============ BRINGING TO LIFE ============ */}
			<section className="section">
				<div className="wrap split">
					<figure className="split__media reveal">
						<img
							src={`${ASSETS}/img/dual-strut.jpg`}
							alt="Dual Wear strut card on a dispensing desk"
						/>
					</figure>
					<div className="split__body reveal">
						<h2 className="display split__title">
							Bringing this campaign to life
						</h2>
						<p className="lead">
							For maximum visibility, add the campaign to an A-board or your
							window so it catches the eye of passers-by.
						</p>
						<p>
							As the campaign helps drive additional pairs, include internal POS
							within the practice — wall posters and strut cards in your
							dispensing area work well.
						</p>
						<p>
							Running a paid media campaign on your socials is also recommended:
							it can reach new patients looking for sunglasses or contact lenses,
							and prompt them to book an eye exam.
						</p>
						<div className="services">
							<h3 className="meta-block__title">Products to include</h3>
							<ul>
								<li>Contact lenses on a direct debit plan</li>
								<li>Discount on plano (non-prescription) sunglasses</li>
								<li>Sunglasses range and discount at your local discretion</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* ============ SUPPLIER SUPPORT ============ */}
			<section className="section section--tint">
				<div className="wrap split split--reverse">
					<div className="split__body reveal">
						<h2 className="display split__title">Supplier support</h2>
						<p className="lead">
							There’s extra support available from suppliers to help your team
							have confident Dual Wear conversations.
						</p>
						<p>
							<strong>Bausch + Lomb</strong> have Ultra One Day cleaning cloths
							with the slogan “Don’t let your glasses hold you back” — a great
							prompt at collection to talk about the benefits of Dual Wear. These
							can be ordered via the Bausch Image Bank.
						</p>
						<p>
							<strong>Alcon</strong> can arrange a team training session through
							your BDM, and offer a conversation-starter desktop flip-chart — one
							side patient-facing, one side staff-facing — ideal to use
							throughout the patient journey, especially at the dispense.
						</p>
					</div>
					<figure className="split__media reveal">
						<img
							src={`${ASSETS}/img/dual-posters.jpg`}
							alt="Dual Wear window posters"
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
