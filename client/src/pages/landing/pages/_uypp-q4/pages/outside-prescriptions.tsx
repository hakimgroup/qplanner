import type { LandingPageMeta } from "../../../registry";
import { img } from "../uypp-q4";
import { MARKETING_LINK } from "../links";
import { CampaignShell, HUB } from "../CampaignShell";
import { FeedbackSection } from "../FeedbackSection";
import { CreativeSection } from "../CreativeSection";
import { ArtworkSection } from "../ArtworkSection";
import { SupplierSection } from "../SupplierSection";
import { OrderSection } from "../OrderSection";
import { OUTSIDE_RX } from "../data/outside-prescriptions";
import { Link } from "react-router-dom";

export const meta: LandingPageMeta = {
	slug: "outside-prescriptions",
	title: "Outside Prescriptions \u2014 Hakim Group Q4 Assets",
	description: "Always-on assets. Your prescription, our frames \u2014 captures dispensing revenue from patients who had their eyes tested elsewhere.",
	publishedAt: "2026-08-26",
	thumbnail: img("evergreen-outside-rx-aboard-situ.jpg"),
	// Campaign pages render at their URL but stay off the /landing index — the Q4
	// hub is the way in, exactly as Q3 does it.
	hidden: true,
};

export default function OutsidePrescriptions() {
	return (
		<CampaignShell id="outside-prescriptions" title={meta.title} campaign={OUTSIDE_RX}>
			{/* ============ HERO ============ */}

			<section className="hero">
				<img className="hero__img" src={img("evergreen-outside-rx-aboard-situ.jpg")} alt="Outside prescriptions welcome A-board and poster" />
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
						Outside
						<br />
						Prescriptions
					</h1>
					<div className="hero__meta reveal">
						<span className="hero__pill">
							Always on
						</span>
						<span className="hero__pill hero__pill--ghost">
							Core KPI · Conversion
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
							Your prescription. Our frames.
						</h2>
						<p className="hook__standfirst reveal">
							Plenty of people assume that wherever they had their eyes tested is where they have to buy their glasses.
						</p>
						<p className="hook__body reveal">
							They don’t, and most have never been told otherwise. This says so plainly, from the pavement, and captures dispensing revenue from patients who were never going to walk in on their own. No discount, no time limit.
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
							Captures dispensing revenue from patients tested elsewhere
						</li>
						<li>
							Removes a barrier most people don't know isn't there
						</li>
						<li>
							Puts your frame range in front of a new audience
						</li>
						<li>
							Works without a discount or a time limit
						</li>
						<li>
							Sits alongside your featured campaign instead of replacing it
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

			<section className="section section--imagebg" style={{ "--section-img": `url(${img("festive-storytelling.jpg")})` } as React.CSSProperties}>
				<div className="wrap">
					<div className="section-head reveal">
						<div>
							<h2 className="display section-head__title">
								What's included
							</h2>
						</div>
					</div>
					<p className="included__lead reveal">
						These sit alongside your chosen featured campaign rather than replacing it, useful in quieter dispensing weeks or wherever you have spare window space.
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
						<Link className="crosslink reveal" to="/landing/eye-exams-available">
							<span className="crosslink__media">
								<img src={img("evergreen-eye-exams-aboard-situ.jpg")} alt="Eye exams available A-board, festive edition" loading="lazy" />
							</span>
							<span className="crosslink__month">
								Always on
							</span>
							<h3 className="crosslink__title">
								Eye Exams Available
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
					</div>
				</div>
			</section>

			{/* ============ FOOTER CTA ============ */}

			<FeedbackSection />
		</CampaignShell>
	);
}
