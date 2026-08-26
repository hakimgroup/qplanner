import type { LandingPageMeta } from "../../../registry";
import { img } from "../uypp-q4";
import { CampaignShell, HUB } from "../CampaignShell";
import { CreativeSection } from "../CreativeSection";
import { ArtworkSection } from "../ArtworkSection";
import { SupplierSection } from "../SupplierSection";
import { OrderSection } from "../OrderSection";
import { CpdSession } from "../CpdSection";
import { PRESBYOPIA } from "../data/presbyopia";
import { Link } from "react-router-dom";

export const meta: LandingPageMeta = {
	slug: "presbyopia",
	title: "Presbyopia \u2014 Hakim Group Q4 Campaign",
	description: "October campaign. Three creative routes highlighting the everyday signs of presbyopia to build awareness and encourage action.",
	publishedAt: "2026-08-26",
	thumbnail: img("pres-adapt-posters.jpg"),
	// Campaign pages render at their URL but stay off the /landing index — the Q4
	// hub is the way in, exactly as Q3 does it.
	hidden: true,
};

export default function Presbyopia() {
	return (
		<CampaignShell id="presbyopia" title={meta.title} campaign={PRESBYOPIA}>
			{/* ============ HERO ============ */}

			<section className="hero">
				<img className="hero__img" src={img("pres-type-posters-situ.jpg")} alt="Presbyopia campaign key visual" />
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
						Presbyopia
					</h1>
					<div className="hero__meta reveal">
						<span className="hero__pill">
							October
						</span>
						<span className="hero__pill hero__pill--ghost">
							Core KPI · Volume & Revenue
						</span>
						<span className="hero__pill hero__pill--ghost">
							3 creative routes
						</span>
					</div>
				</div>
			</section>

			{/* One section, not two. This used to be an indigo "problem" strip and then a separate
			    intro with its own heading, which meant two headlines and two half-explanations before
			    you reached anything about the campaign — and a lot of empty space on a laptop.
			    It now runs problem -> turn -> answer in a single read, on the strength of three levels
			    of type: the headline states the problem, the bold standfirst turns it into something
			    recognisable, and the body copy says what the campaign does about it. Copy drawn from
			    the creative deck's problem framing and the brief's campaign rationale.
			    No image. It had a full-bleed A-board alongside, but once the copy became the hook the
			    picture was competing with it rather than supporting it — and the hero directly above is
			    already a photograph. Text only, centred, given the width to carry the section. */}

			<section className="section section--deck section--hook">
				<div className="wrap hook">
					<div className="hook__text">
						<h2 className="display hook__title reveal">
							People don’t always notice their close-up vision changing
						</h2>
						{/* The line breaks here are art direction, not accident: the copy is composed to break
						    at these points so the centred setting reads as intended. They are switched off
						    below 860px, where the column is too narrow to honour them and natural wrapping
						    does a better job. See .break-wide in styles.css. */}
						<p className="hook__standfirst reveal">
							They simply adapt. Holding the menu further away, turning up the light or making the text bigger,
							<br className="break-wide" />
							until those small adjustments become their new normal.
						</p>
						<p className="hook__body reveal">
							This campaign turns those familiar moments into a reason to act. Using relatable, everyday creative rather than clinical language,
							<br className="break-wide" />
							it helps people recognise the signs of age-related vision changes and encourages them to book an eye exam.
							<br className="break-wide" />
							In doing so, it positions your practice as a trusted partner in protecting their long-term eye health.
						</p>
					</div>
				</div>
			</section>

			<CreativeSection />

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
									Adults aged 40+
								</li>
								<li>
									Those beginning to notice subtle changes in their vision but who may not yet have taken action
								</li>
								<li>
									Busy, working individuals who may delay or deprioritise routine eye examinations
								</li>
								<li>
									Existing and lapsed patients who have not attended an eye exam recently
								</li>
								<li>
									Individuals experiencing early symptoms without recognising they may be age-related
								</li>
							</ul>
						</div>
						<div className="whofor__panel whofor__panel--practice reveal">
							<h3 className="whofor__title">
								Practices
							</h3>
							<ul className="whofor__list">
								<li>
									Reach a large, under-engaged patient group without relying on discounts
								</li>
								<li>
									Use everyday language instead of clinical terms like "presbyopia"
								</li>
								<li>
									Reframe the eye exam as an eye health check to encourage earlier engagement
								</li>
								<li>
									Position the practice as a partner in long-term eye health
								</li>
								<li>
									Turn awareness into booked appointments
								</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* One section, not two, and no boxes. "Products to include" and "Supplier support" were
			    saying the same thing as each other and as the logo strip that used to sit below, so
			    those three are now one bold standfirst and the suppliers shown large. See the note in
			    styles.css. Nothing was lost: the HelpHub line and the email address moved down to the
			    fineprint at the foot. */}

			<section className="section section--imagebg" style={{ "--section-img": `url(${img("pres-bigger-instore.jpg")})` } as React.CSSProperties}>
				<div className="wrap">
					<div className="section-head reveal">
						<div>
							<h2 className="display section-head__title">
								What's included
							</h2>
						</div>
					</div>
					<p className="included__lead reveal">
						This is not a discount campaign. There is no promotion attached and no price on the poster, it is all about awareness.
					</p>
					<p className="fineprint reveal">
						A HelpHub page for this campaign is being prepared, the link will be added here once it's live. Questions in the meantime?
						<a href="mailto:marketing@hakimgroup.co.uk">
							marketing@hakimgroup.co.uk
						</a>
					</p>
				</div>
			</section>

			<SupplierSection
				lead="Brand assets are an add-on to this campaign, funded by the supplier, who provides the artwork, the training and the offer itself. Open one to see what it includes and how to take it up."
			/>

			{/* Related CPD sessions. Moved here from the hub on David's request — these two
			    sessions are tied to presbyopia subjects, so they belong with the campaign
			    rather than on a quarter-wide index.

			    Note this reverses the long-standing rule "never re-add CPD | Education" —
			    that referred to a catch-all CPD block removed from the campaign series in
			    July. These are two specific, dated sessions. The rule is documented in
			    README.md and CLAUDE.md so the section is not stripped back out by someone
			    following the old note.

			    Sits under Supplier support and shares its control. Registration links are
			    external event pages rather than planner destinations, so they sit in the
			    markup — links.ts is the single source of truth for planner and supplier
			    destinations specifically. */}

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
