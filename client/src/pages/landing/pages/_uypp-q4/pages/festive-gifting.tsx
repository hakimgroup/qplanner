import type { LandingPageMeta } from "../../../registry";
import { FestivePage } from "../FestivePage";
import { SupplierSection } from "../SupplierSection";
import { BRAND_ACTIVATIONS, MARKETING_LINK } from "../links";
import { FESTIVE_GIFTING } from "../data/festive-gifting";

export const meta: LandingPageMeta = {
	slug: "festive-gifting",
	title: "Gifting & Brand Support — Festive Focus Toolkit",
	description:
		"Supplier-funded gifts with purchase on BOSS, Oakley, Ted Baker and Design Eyewear, plus the brand activations behind them.",
	publishedAt: "2026-09-29",
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
			pills={["December", "Core KPI · Volume and conversion", "4 gifts, 4 activations"]}
			hook="One less present to go and buy."
			standfirst="December is the only month of the year when eyewear is bought for someone else."
			body="A gift with purchase works twice over: it is either a treat for the customer, or — far more persuasively — a gift they now do not have to go out and find for somebody else. Four suppliers are funding gifts this season. Each is capped, each is first come first served, and each needs a form."
			pointsTitle="Why it converts"
			points={[
				"Secures the dispense at the moment the decision is being made",
				"Lifts a lower-spend dispense into a more premium range",
				"Costs the practice nothing — the supplier funds the gift",
				"Gives the team something specific to say rather than a discount",
				"Works hardest at an event, where there is already a reason to buy",
				"COTI chains and Theia cloths gift well with no sign-up at all",
			]}
			creativeTitle="How gifting fits"
			creativeLead="An add-on rather than a campaign. It attaches to whatever else you are already running this December."
			artworkLead="Point-of-sale artwork is still in production. Most suppliers provide their own."
			orderTitle="Take up an activation"
			orderNote="Each supplier collects practice details itself, so these are taken up on the supplier's form rather than through the planner. Open a brand above to see what it includes and how to opt in."
			orderFootText="Gifting sits on top of a campaign, it does not replace one. Order the campaign in your planner, then opt in alongside it."
		>
			{/* Supplier rows first, then the caveats. The rows are why anyone opened
			    this page; the allocation rules only matter once a brand has been
			    chosen. */}
			<SupplierSection lead="Four gifts with purchase and four brand activations. The gifts are finite and allocated first come first served against a qualifying order, so the deadline is real. The activations are training and product support from the rep, with nothing to run out of." />

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
