import type { LandingPageMeta } from "../../../registry";
import { img } from "../uypp-q4";
import { MARKETING_LINK } from "../links";
import { CampaignShell, HUB } from "../CampaignShell";
import { CreativeSection } from "../CreativeSection";
import { ArtworkSection } from "../ArtworkSection";
import { SupplierSection } from "../SupplierSection";
import { OrderSection } from "../OrderSection";
import { BLACK_FRIDAY } from "../data/black-friday";
import { Link } from "react-router-dom";

export const meta: LandingPageMeta = {
	slug: "black-friday",
	title: "Black Friday \u2014 Hakim Group Q4 Campaign",
	description: "November campaign. Proven assets with amendable discounts and offers \u2014 pick a treatment and drop your own offer in.",
	publishedAt: "2026-08-26",
	thumbnail: img("bf-strip.jpg"),
	// Campaign pages render at their URL but stay off the /landing index — the Q4
	// hub is the way in, exactly as Q3 does it.
	hidden: true,
};

export default function BlackFriday() {
	return (
		<CampaignShell id="black-friday" title={meta.title} campaign={BLACK_FRIDAY}>
			{/* ============ HERO ============ */}

			<section className="hero">
				<img className="hero__img" src={img("bf-arrow-window-situ.jpg")} alt="Black Friday campaign poster" />
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
						Black Friday
					</h1>
					<div className="hero__meta reveal">
						<span className="hero__pill">
							November
						</span>
						<span className="hero__pill hero__pill--ghost">
							Core KPI · Volume & Conversion
						</span>
						<span className="hero__pill hero__pill--ghost">
							3 poster treatments
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
							The biggest retail moment of the year
						</h2>
						<p className="hook__standfirst reveal">
							Patients are already looking for value in November. This puts your practice in front of them while they are.
						</p>
						<p className="hook__body reveal">
							Black Friday is the mechanic and the promotion is yours. Clear discontinued stock, push a multi-pair offer, whatever suits the practice. Three poster treatments give it presence in the window, and clear, time-limited messaging turns interest into a booking.
						</p>
					</div>
				</div>
			</section>

			<CreativeSection
				title="Three poster treatments"
			/>

			<ArtworkSection />

			{/* Audience and "best for" used to be two separate sections, which read as a wall of
			    copy stacked under the intro. One heading now, two panels: who the work speaks to
			    on the left, what it does for the practice on the right. */}

			<section className="section section--tint">
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
									Price-conscious shoppers looking for seasonal offers and promotions
								</li>
								<li>
									Existing patients considering an additional purchase or upgrade
								</li>
								<li>
									New customers attracted by Black Friday deals and value-led messaging
								</li>
								<li>
									Style-conscious individuals seeking to update or refresh their eyewear
								</li>
								<li>
									Lapsed patients motivated by time-limited offers to re-engage with the practice
								</li>
							</ul>
						</div>
						<div className="whofor__panel whofor__panel--practice reveal">
							<h3 className="whofor__title">
								Practices
							</h3>
							<ul className="whofor__list">
								<li>
									Capture demand from patients actively looking for value
								</li>
								<li>
									Encourage new and existing patients to act now rather than delay
								</li>
								<li>
									Create urgency with clear, time-limited messaging
								</li>
								<li>
									Showcase frame ranges, sunglasses and lens upgrades
								</li>
								<li>
									Maximise average transaction value
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

			<section className="section section--imagebg" style={{ "--section-img": `url(${img("bf-strip-window-situ.jpg")})` } as React.CSSProperties}>
				<div className="wrap">
					<div className="section-head reveal">
						<div>
							<h2 className="display section-head__title">
								What's included
							</h2>
						</div>
					</div>
					<p className="included__lead reveal">
						Black Friday is the mechanic, the promotion is yours. Clear discontinued frames at a sale price or push a multi-pair offer, then use Black Friday to give it urgency. Frame ranges, sunglasses and lens upgrades all work well.
					</p>
					<div className="panel panel--flag panel--wide reveal">
						<h3 className="panel__title">
							Recording the sale
						</h3>
						<p>
							When processing sales for any Black Friday promotion, use the
							{" "}
							<strong>
								BLK Friday
							</strong>
							discount code in Optix.
						</p>
						<p>
							In Optix 1, do not use the "discount to amount" option, as it erases the primary discount code.
						</p>
					</div>
					<p className="fineprint reveal">
						Questions?
						{" "}
						<a href={MARKETING_LINK}>
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
						<Link className="crosslink reveal" to="/landing/festive-windows">
							<span className="crosslink__media">
								<img src={img("festive-easy-1.jpg")} alt="Festive window display" loading="lazy" />
							</span>
							<span className="crosslink__month">
								December
							</span>
							<h3 className="crosslink__title">
								Festive Windows
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
