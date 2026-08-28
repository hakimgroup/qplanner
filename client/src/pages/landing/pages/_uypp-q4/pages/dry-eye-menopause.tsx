import type { LandingPageMeta } from "../../../registry";
import { img } from "../uypp-q4";
import { MARKETING_LINK } from "../links";
import { CampaignShell, HUB } from "../CampaignShell";
import { FeedbackSection } from "../FeedbackSection";
import { CreativeSection } from "../CreativeSection";
import { ArtworkSection } from "../ArtworkSection";
import { SupplierSection } from "../SupplierSection";
import { OrderSection } from "../OrderSection";
import { DRY_EYE } from "../data/menopause-dry-eye";
import { Link } from "react-router-dom";

export const meta: LandingPageMeta = {
	slug: "dry-eye-menopause",
	title: "Dry Eye & Menopause \u2014 Hakim Group Q4 Campaign",
	description: "October campaign. Two creative routes connecting menopause with dry eye, a common but often overlooked symptom.",
	publishedAt: "2026-08-26",
	thumbnail: img("meno-prickly-posters.jpg"),
	// Campaign pages render at their URL but stay off the /landing index — the Q4
	// hub is the way in, exactly as Q3 does it.
	hidden: true,
};

export default function DryEyeMenopause() {
	return (
		<CampaignShell id="menopause-dry-eye" title={meta.title} campaign={DRY_EYE}>
			{/* ============ HERO ============ */}

			<section className="hero">
				<img className="hero__img" src={img("meno-prickly-posters-situ.jpg")} alt="Dry Eye and Menopause floral posters in a practice window" />
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
						Dry Eye &
						<br />
						Menopause
					</h1>
					<div className="hero__meta reveal">
						<span className="hero__pill">
							October
						</span>
						<span className="hero__pill hero__pill--ghost">
							Core KPI · Volume
						</span>
						<span className="hero__pill hero__pill--ghost">
							2 creative routes
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
							Dry eye is a common but often overlooked symptom of menopause
						</h2>
						<p className="hook__standfirst reveal">
							Many women never connect the two. Fewer still realise there is anything that can be done about it.
						</p>
						<p className="hook__body reveal">
							This campaign uses Menopause Awareness Month to start the conversation, linking a symptom most patients have never associated with their hormones to something you can genuinely help with. It positions the practice as a source of support at a life stage that rarely gets discussed in an optician’s.
						</p>
					</div>
				</div>
			</section>

			<CreativeSection
				title="Two creative directions"
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
									Women aged 40+
								</li>
								<li>
									Those experiencing perimenopause or menopause, whether diagnosed or not
								</li>
								<li>
									Individuals noticing symptoms such as dry, irritated or uncomfortable eyes
								</li>
								<li>
									Patients who may not be aware of the link between hormonal changes and eye health
								</li>
								<li>
									Existing and lapsed patients who would benefit from support and guidance during this life stage
								</li>
							</ul>
						</div>
						<div className="whofor__panel whofor__panel--practice reveal">
							<h3 className="whofor__title">
								Practices
							</h3>
							<ul className="whofor__list">
								<li>
									Connect menopause and perimenopause to a common symptom: dry eye
								</li>
								<li>
									Raise awareness of a link many patients do not know exists
								</li>
								<li>
									Position the practice as a trusted source of support
								</li>
								<li>
									Reinforce opticians as key healthcare providers, not just vision correction
								</li>
								<li>
									Encourage patients to book an eye health check and seek support
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

			<section className="section section--imagebg" style={{ "--section-img": `url(${img("meno-prickly-event-situ.jpg")})` } as React.CSSProperties}>
				<div className="wrap">
					<div className="section-head reveal">
						<div>
							<h2 className="display section-head__title">
								What's included
							</h2>
						</div>
					</div>
					<p className="included__lead reveal">
						There is no promotion attached to this campaign and no price on the poster, it is all about awareness. Two suppliers back it directly, with an offer, product and training — see Supplier support below.
					</p>
					<p className="fineprint reveal">
						To make sure you don’t miss out next year, let your marketing executive know and add it to your 2027 Marketing Planner, we’ll be in touch. Questions?
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

			<FeedbackSection />
		</CampaignShell>
	);
}
