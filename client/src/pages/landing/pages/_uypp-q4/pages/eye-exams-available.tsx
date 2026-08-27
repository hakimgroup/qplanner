import type { LandingPageMeta } from "../../../registry";
import { img } from "../uypp-q4";
import { MARKETING_LINK } from "../links";
import { CampaignShell, HUB } from "../CampaignShell";
import { CreativeSection } from "../CreativeSection";
import { ArtworkSection } from "../ArtworkSection";
import { SupplierSection } from "../SupplierSection";
import { OrderSection } from "../OrderSection";
import { EYE_EXAMS } from "../data/eye-exams-available";
import { Link } from "react-router-dom";

export const meta: LandingPageMeta = {
	slug: "eye-exams-available",
	title: "Eye Exams Available \u2014 Hakim Group Q4 Assets",
	description: "Always-on assets. The simplest message a practice can put on the pavement \u2014 fills quiet diary slots without discounting.",
	publishedAt: "2026-08-26",
	thumbnail: img("evergreen-eye-exams-aboard-situ.jpg"),
	// Campaign pages render at their URL but stay off the /landing index — the Q4
	// hub is the way in, exactly as Q3 does it.
	hidden: true,
};

export default function EyeExamsAvailable() {
	return (
		<CampaignShell id="eye-exams-available" title={meta.title} campaign={EYE_EXAMS}>
			{/* ============ HERO ============ */}

			<section className="hero">
				<img className="hero__img" src={img("evergreen-eye-exams-aboard-situ.jpg")} alt="Eye exams available A-board and poster, festive edition" />
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
						Eye Exams
						<br />
						Available
					</h1>
					<div className="hero__meta reveal">
						<span className="hero__pill">
							Always on
						</span>
						<span className="hero__pill hero__pill--ghost">
							Core KPI · Volume
						</span>
						<span className="hero__pill hero__pill--ghost">
							Festive edition
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
							Eye exams available here
						</h2>
						<p className="hook__standfirst reveal">
							The simplest message a practice can put on the pavement, and one of the most effective.
						</p>
						<p className="hook__body reveal">
							Dot-matrix type on the A-board, a calm poster inside. No offer, no clinical language, just an open door and appointments available today. It fills quiet diary slots without ever reaching for a discount.
						</p>
					</div>
				</div>
			</section>

			{/* These points used to sit beside the intro copy. The featured campaigns moved theirs into the
			    Practices panel of "Who this campaign speaks to", but the evergreen pages have no such
			    section, so they keep their own. */}

			<section className="section">
				<div className="wrap">
					<div className="section-head reveal">
						<div>
							<h2 className="display section-head__title">
								Why it works
							</h2>
						</div>
					</div>
					<ul className="intro__points points--two reveal">
						<li>
							Fills quiet diary slots without discounting
						</li>
						<li>
							Tells passers-by you have appointments available today
						</li>
						<li>
							Works hardest in a quiet week or a new location
						</li>
						<li>
							No campaign window to work to, so nothing to plan around
						</li>
						<li>
							Sits comfortably alongside any featured campaign
						</li>
					</ul>
				</div>
			</section>

			<ArtworkSection />

			{/* One section, not two, and no boxes. This used to be three panels — typically
			    "Products to include", "Supplier support" and "Supporting information" — followed by a
			    separate strip of small supplier logos, which meant the same idea stated three times
			    with the brands as an afterthought at the bottom.
			    Now: a bold standfirst, then any genuinely campaign-specific detail in ONE full-width
			    panel, then the suppliers shown large on white cards. Pages with nothing specific to
			    say go straight to the brands. See the note in styles.css. */}

			<section className="section section--imagebg" style={{ "--section-img": `url(${img("festive-easy-2.jpg")})` } as React.CSSProperties}>
				<div className="wrap">
					<div className="section-head reveal">
						<div>
							<h2 className="display section-head__title">
								What's included
							</h2>
						</div>
					</div>
					<p className="included__lead reveal">
						These sit alongside your chosen featured campaign rather than replacing it, and are particularly useful when the diary is looking light.
					</p>
					<div className="panel panel--flag panel--wide reveal">
						<h3 className="panel__title">
							Good to know
						</h3>
						<p>
							Two formats: an
							{" "}
							<strong>
								A-board
							</strong>
							{" "}
							and a
							{" "}
							<strong>
								window or in-practice poster
							</strong>
							.
						</p>
						<p>
							Every asset in this Q4 pack is the festive edition, so in practice it runs in November and December. Whether a non-seasonal version exists for the rest of the year is still to be confirmed, as is the final categorisation of this campaign.
						</p>
					</div>
					<p className="included__brandlead reveal">
						<strong>
							Brand assets
						</strong>
						{" "}
						are a further add-on, on top of whichever featured campaign you are running. See
						{" "}
						<Link to={`${HUB}#brand-assets`}>
							Brand assets
						</Link>
						{" "}
						on the overview for what suppliers are backing this quarter.
					</p>
					<p className="fineprint reveal">
						Questions?
						{" "}
						<a href={MARKETING_LINK}>
							marketing@hakimgroup.co.uk
						</a>
					</p>
				</div>
			</section>

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
						<Link className="crosslink reveal" to="/landing/outside-prescriptions">
							<span className="crosslink__media">
								<img src={img("evergreen-outside-rx-aboard-situ.jpg")} alt="Outside prescriptions A-board" loading="lazy" />
							</span>
							<span className="crosslink__month">
								Always on
							</span>
							<h3 className="crosslink__title">
								Outside Prescriptions
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
