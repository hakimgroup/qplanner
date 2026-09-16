import type { LandingPageMeta } from "../../../registry";
import { FestivePage } from "../FestivePage";
import { SupplierSection } from "../SupplierSection";
import { img } from "../uypp-q4";
import { BRAND_ACTIVATIONS, MARKETING_LINK } from "../links";
import {
	ACCESSORIES,
	ACCESSORY_TACTICS,
	FESTIVE_GIFTING,
} from "../data/festive-gifting";

export const meta: LandingPageMeta = {
	slug: "festive-gifting",
	title: "Gifting & Brand Support — Festive Focus Toolkit",
	description:
		"Accessories and stocking fillers front and centre, plus supplier-funded gifts with purchase on BOSS, Oakley, Ted Baker and Design Eyewear.",
	publishedAt: "2026-09-29",
	thumbnail: img("festive-easy-3.jpg"),
	hidden: true,
};

export default function FestiveGifting() {
	return (
		<FestivePage
			id="festive-gifting"
			slug={meta.slug}
			docTitle={meta.title}
			campaign={FESTIVE_GIFTING}
			heroTitle={
				<>
					Gifting &amp;
					<br />
					Brand Support
				</>
			}
			heroImage={img("festive-easy-3.jpg")}
			heroAlt="Festive practice window with wrapped gifts and an eye exams available poster"
			pills={["December", "Core KPI · Volume and conversion", "Accessories + 8 brands"]}
			hook="Your patients are already shopping for someone else."
			standfirst="December is the only month of the year when eyewear and accessories are bought as gifts."
			body="Let's not miss the chance to help them tick a few things off the list while they are in the practice. Accessories are the impulse purchase and the easiest place to start; a supplier gift with purchase is what secures the dispense on top."
			pointsTitle="Why it converts"
			points={[
				"Patients arrive in a gifting mindset — the prompt does most of the work",
				"Accessories are an impulse buy, so they add value to a visit already happening",
				"A gift with purchase secures the dispense at the moment of decision",
				"It can lift a lower-spend dispense into a more premium range",
				"Supplier gifts cost the practice nothing — the brand funds them",
				"Works hardest at an event, where there is already a reason to buy",
			]}
			afterPoints={
				/* Accessories lead the page. They were the last bullet of a list in the
				   first cut, which buried the one thing every practice can act on today
				   under eight supplier programmes most of them cannot take up at all. */
				<section
					className="section section--imagebg"
					id="accessories"
					style={
						{ "--section-img": `url(${img("festive-easy-3.jpg")})` } as React.CSSProperties
					}
				>
					<div className="wrap">
						<div className="section-head reveal">
							<div>
								<p className="eyebrow">Start here</p>
								<h2 className="display section-head__title">
									Accessories &amp; stocking fillers
								</h2>
								<p className="lead">
									No form, no allocation and no deadline. The whole category needs a
									good position and a prompt — which makes it the fastest thing on
									this page to act on, and the only part that works for every
									practice.
								</p>
							</div>
						</div>

						<div className="panels panels--four">
							{ACCESSORIES.map((a) => (
								<article className="panel reveal" key={a.name}>
									<h3 className="panel__title">{a.name}</h3>
									{a.price ? <p className="panel__price">{a.price}</p> : null}
									<p>{a.body}</p>
								</article>
							))}
						</div>

						<div className="panel panel--flag panel--wide reveal">
							<h3 className="panel__title">Getting it right in the practice</h3>
							<ul className="gift-tactics">
								{ACCESSORY_TACTICS.map((t) => (
									<li key={t.title}>
										<strong>{t.title}.</strong> {t.body}
									</li>
								))}
							</ul>
						</div>

						<p className="fineprint reveal">
							Not sure what you can order?{" "}
							<a href={MARKETING_LINK}>marketing@hakimgroup.co.uk</a>
						</p>
					</div>
				</section>
			}
			creativeTitle="How gifting fits"
			creativeLead="An add-on rather than a campaign. It attaches to whatever else you are already running this December."
			artworkLead="Point-of-sale artwork is still in production. Most suppliers provide their own."
			orderTitle="Take up an activation"
			orderNote="Each supplier collects practice details itself, so these are taken up on the supplier's form rather than through the planner. Open a brand above to see what it includes and how to opt in."
			orderFootText="Gifting sits on top of a campaign, it does not replace one. Order the campaign in your planner, then opt in alongside it."
		>
			{/* Supplier rows, then the caveats. The rows are why anyone scrolled this
			    far; the allocation rules only matter once a brand has been chosen. */}
			<SupplierSection lead="Four gifts with purchase and four brand activations, on top of the accessories above. The gifts are finite and allocated first come first served against a qualifying order, so the deadline is real. The activations are training and product support from the rep, with nothing to run out of." />

			<section className="section section--tint">
				<div className="wrap">
					<div className="section-head reveal">
						<div>
							<h2 className="display section-head__title">Before you opt in</h2>
						</div>
					</div>
					<div className="panels">
						<article className="panel panel--flag reveal">
							<h3 className="panel__title">Allocations are capped</h3>
							<p>
								Every gift-with-purchase programme has a fixed number of sets and a
								qualifying order behind it. First come, first served, and once the
								allocation is gone it is gone for the season.
							</p>
						</article>
						<article className="panel panel--flag reveal">
							<h3 className="panel__title">Oakley is by invitation</h3>
							<p>
								Only selected practices can opt in. If yours is one, an email
								arrives from <strong>{BRAND_ACTIVATIONS}</strong>. Without it the
								form cannot be completed, so wait for the email rather than
								chasing the link.
							</p>
						</article>
						<article className="panel panel--flag reveal">
							<h3 className="panel__title">Brief the team</h3>
							<p>
								A gift nobody mentions converts nothing. Display it beside the
								relevant frames, and make sure the team knows to offer it — and to
								say out loud that it saves buying a present for someone.
							</p>
						</article>
					</div>
					<p className="fineprint reveal">
						Not sure which applies to you?{" "}
						<a href={MARKETING_LINK}>marketing@hakimgroup.co.uk</a>
					</p>
				</div>
			</section>
		</FestivePage>
	);
}
