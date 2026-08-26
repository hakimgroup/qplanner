import type { LandingPageMeta } from "../../../registry";
import { img } from "../uypp-q4";
import { CampaignShell, HUB } from "../CampaignShell";
import { CreativeSection } from "../CreativeSection";
import { ArtworkSection } from "../ArtworkSection";
import { SupplierSection } from "../SupplierSection";
import { OrderSection } from "../OrderSection";
import { FESTIVE } from "../data/festive-windows";
import { Link } from "react-router-dom";

export const meta: LandingPageMeta = {
	slug: "festive-windows",
	title: "Festive Windows, Christmas gifting and party season \u2014 Hakim Group Q4 Campaign",
	description: "December campaign. A step, jump, leap approach to festive windows, plus the gift-with-purchase activations from four suppliers.",
	publishedAt: "2026-08-26",
	thumbnail: img("festive-easy-1.jpg"),
	// Campaign pages render at their URL but stay off the /landing index — the Q4
	// hub is the way in, exactly as Q3 does it.
	hidden: true,
};

export default function FestiveWindows() {
	return (
		<CampaignShell id="festive-windows" title={meta.title} campaign={FESTIVE}>
			{/* ============ HERO ============ */}

			<section className="hero">
				<img className="hero__img" src={img("festive-easy-1.jpg")} alt="Festive window display inspiration" />
				<div className="hero__overlay">
				</div>
				<div className="wrap hero__content">
					<Link to={`${HUB}#featured`} className="back-link back-link--hero reveal">
						← Back to campaign overview
					</Link>
					<p className="eyebrow eyebrow--light reveal">
						Q4 2026 · Unlock Your Practice Potential
					</p>
					<h1 className="hero__title reveal">
						Festive
						<br />
						Windows
					</h1>
					<p className="hero__subtitle reveal">
						Christmas gifting and party season
					</p>
					<div className="hero__meta reveal">
						<span className="hero__pill">
							December
						</span>
						<span className="hero__pill hero__pill--ghost">
							Core KPI · Volume & Conversion
						</span>
						<span className="hero__pill hero__pill--ghost">
							3 creative routes
						</span>
					</div>
				</div>
			</section>

			{/* One section, not two. This used to be an indigo "problem" strip and then a separate
			    intro with its own heading, which meant two headlines and two half-explanations before
			    you reached anything about the campaign, and a lot of empty space on a laptop.
			    Three levels of type carry it: the headline states the problem, the bold standfirst
			    turns it into something recognisable, and the body says what the campaign does about it.
			    Text only and centred, running the full container width — see .section--hook in
			    styles.css, and keep each block to three or four lines. */}

			<section className="section section--deck section--hook">
				<div className="wrap hook">
					<div className="hook__text">
						<h2 className="display hook__title reveal">
							A destination on the high street, not just an optician
						</h2>
						<p className="hook__standfirst reveal">
							December brings more people past your window than any other month. A strong festive presence gives them a reason to come in.
						</p>
						<p className="hook__body reveal">
							Step, jump or leap: start with simple off-the-shelf decor, or go as far as a bespoke installation by a local artist. Either way it puts the practice in the middle of the local Christmas experience, and in front of shoppers looking for gifts.
						</p>
					</div>
				</div>
			</section>

			<CreativeSection
				title="How far do you want to go?"
			/>

			{/* Audience and "best for" used to be two separate sections, which read as a wall of
			    copy stacked under the intro. One heading now, two panels: who the work speaks to
			    on the left, what it does for the practice on the right.
			    Plain background on this page only. Everywhere else this section is tinted, but the
			    dark placement carousel that used to sit above it has gone, which left two tinted
			    sections touching and the join disappeared. */}

			<section className="section">
				<div className="wrap">
					<div className="section-head reveal">
						<div>
							<h2 className="display section-head__title">
								Who this campaign speaks to
							</h2>
						</div>
					</div>
					<div className="whofor">
						<div className="whofor__panel whofor__panel--patient reveal">
							<h3 className="whofor__title">
								Patients
							</h3>
							<ul className="whofor__list">
								<li>
									Existing patients
								</li>
								<li>
									Local communities of all ages
								</li>
								<li>
									Families, couples and festive shoppers
								</li>
								<li>
									Passers-by influenced by window displays and in-practice activity
								</li>
								<li>
									Individuals engaging with local events and community initiatives during the festive period
								</li>
							</ul>
						</div>
						<div className="whofor__panel whofor__panel--practice reveal">
							<h3 className="whofor__title">
								Practices
							</h3>
							<ul className="whofor__list">
								<li>
									Put an impactful window display at the centre of December
								</li>
								<li>
									Make the practice part of the local Christmas experience
								</li>
								<li>
									Capitalise on the busiest retail period of the year
								</li>
								<li>
									Attract both new and existing patients off a busier high street
								</li>
								<li>
									Scale to whatever time and budget you have
								</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* One section, not two, and no boxes. This used to be three panels — typically
			    "Products to include", "Supplier support" and "Supporting information" — followed by a
			    separate strip of small supplier logos, which meant the same idea stated three times
			    with the brands as an afterthought at the bottom.
			    Now: a bold standfirst, then any genuinely campaign-specific detail in ONE full-width
			    panel, then the suppliers shown large on white cards. Pages with nothing specific to
			    say go straight to the brands. See the note in styles.css. */}

			<section className="section section--imagebg" style={{ "--section-img": `url(${img("festive-spark.jpg")})` } as React.CSSProperties}>
				<div className="wrap">
					<div className="section-head reveal">
						<div>
							<h2 className="display section-head__title">
								What's included
							</h2>
						</div>
					</div>
					<p className="included__lead reveal">
						Guidelines are provided to support merchandising and creating a strong festive window, so displays stay consistent across practices.
					</p>
					<div className="panel panel--flag panel--wide reveal">
						<h3 className="panel__title">
							Products to include
						</h3>
						<p>
							COTI chains and Theia cloths suit festive gifting well, alongside your frame and sunglass ranges.
						</p>
						<p>
							Four suppliers are running a
							{" "}
							<strong>
								gift with purchase
							</strong>
							{" "}
							this December, and others are supporting other categories such as lenses and contact lenses. They are all set out under Supplier support below.
						</p>
					</div>
					<p className="fineprint reveal">
						A wider
						{" "}
						<strong>
							Festive Focus Toolkit
						</strong>
						{" "}
						covering in-practice events is being developed separately, launching to support exam volume through December and January. It will be added here once the creative is ready. Questions?
						{" "}
						<a href="mailto:marketing@hakimgroup.co.uk">
							marketing@hakimgroup.co.uk
						</a>
					</p>
				</div>
			</section>

			<SupplierSection
				lead="Brand assets are an add-on to this campaign, funded by the supplier, who provides the artwork, the training and the offer itself. Open one to see what it includes and how to take it up."
			/>

			<OrderSection />

			{/* ============ OTHER CAMPAIGNS ============ */}

			<section className="section section--tint">
				<div className="wrap">
					<div className="section-head reveal">
						<div>
							<h2 className="display section-head__title">
								Other Q4 campaigns
							</h2>
						</div>
					</div>
					<div className="crosslinks">
						<Link className="crosslink reveal" to="/landing/black-friday">
							<span className="crosslink__media">
								<img src={img("bf-strip-window-situ.jpg")} alt="Black Friday window poster" loading="lazy" />
							</span>
							<span className="crosslink__month">
								November
							</span>
							<h3 className="crosslink__title">
								Black Friday
							</h3>
							<span className="crosslink__arrow" aria-hidden="true">
								→
							</span>
						</Link>
						<Link className="crosslink reveal" to="/landing/dry-eye-menopause">
							<span className="crosslink__media">
								<img src={img("meno-prickly-posters-situ.jpg")} alt="Dry Eye and Menopause posters in a practice window" loading="lazy" />
							</span>
							<span className="crosslink__month">
								October
							</span>
							<h3 className="crosslink__title">
								Dry Eye & Menopause
							</h3>
							<span className="crosslink__arrow" aria-hidden="true">
								→
							</span>
						</Link>
						<Link className="crosslink reveal" to="/landing/presbyopia">
							<span className="crosslink__media">
								<img src={img("pres-adapt-posters-situ.jpg")} alt="Presbyopia posters in a practice window" loading="lazy" />
							</span>
							<span className="crosslink__month">
								October
							</span>
							<h3 className="crosslink__title">
								Presbyopia
							</h3>
							<span className="crosslink__arrow" aria-hidden="true">
								→
							</span>
						</Link>
					</div>
				</div>
			</section>

			{/* ============ FOOTER CTA ============ */}

			<section className="cta">
				<div className="wrap cta__inner reveal">
					<h2 className="display cta__title">
						Tell us what you think
					</h2>
					<p>
						Please share your thoughts with us, we'd really appreciate your feedback.
					</p>
					<Link className="btn btn--ghost" to={`${HUB}#featured`}>
						Back to our campaign overview
					</Link>
				</div>
			</section>
		</CampaignShell>
	);
}
