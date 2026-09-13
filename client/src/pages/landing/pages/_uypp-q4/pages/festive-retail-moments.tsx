import type { LandingPageMeta } from "../../../registry";
import { Link } from "react-router-dom";
import { FestivePage } from "../FestivePage";
import { MARKETING_LINK } from "../links";
import { FESTIVE_RETAIL_MOMENTS } from "../data/festive-retail-moments";

export const meta: LandingPageMeta = {
	slug: "festive-retail-moments",
	title: "Retail Moments — Festive Focus Toolkit",
	description:
		"Black Friday and the December sale. The same mechanic four weeks apart, and both are yours to set locally.",
	publishedAt: "2026-09-29",
	hidden: true,
};

export default function FestiveRetailMoments() {
	return (
		<FestivePage
			id="festive-retail-moments"
			slug={meta.slug}
			docTitle={meta.title}
			campaign={FESTIVE_RETAIL_MOMENTS}
			heroTitle={
				<>
					Retail
					<br />
					Moments
				</>
			}
			pills={["November – December", "Core KPI · Volume and conversion", "2 moments"]}
			hook="One lever, pulled twice."
			standfirst="Black Friday and the December sale are the same mechanic four weeks apart: a reason to buy now rather than in January."
			body="Neither dictates what the offer is. Discontinued frames to clear, a multi-pair deal, a lens upgrade — the moment is the lever, the promotion is a local decision. Treat them as one plan rather than two, because the practice that runs Black Friday well is the one best placed to run December."
			points={[
				"Patients are already looking for value, so no demand to create",
				"Time-limited messaging does the persuading for you",
				"The best month of the year to show frames, sunglasses and upgrades",
				"Brings back lapsed patients who ignore everything else",
				"The sale period now runs on well past Black Friday itself",
				"Pairs naturally with later opening and an in-practice event",
			]}
			creativeTitle="Two moments"
			creativeLead="Four weeks apart, and stronger together than either is alone."
			artworkLead="Black Friday artwork already exists as a Q4 campaign. December sale artwork is still in production."
			orderTitle="Add a moment to your plan"
			orderNote="Black Friday orders straight from the planner. The December sale is still being set up — the button opens your planner."
			orderFootText="Decide the promotion before you order the artwork: the assets carry your offer, not ours."
		>
			<section className="section">
				<div className="wrap">
					<div className="section-head reveal">
						<div>
							<h2 className="display section-head__title">Before you run it</h2>
						</div>
					</div>
					<div className="panel panel--flag panel--wide reveal">
						<h3 className="panel__title">Use the right discount code</h3>
						<p>
							When processing sales on any Black Friday promotion, use the{" "}
							<strong>BLK Friday</strong> discount code in Optix.
						</p>
						<p>
							In Optix 1, do <strong>not</strong> use the &ldquo;discount to
							amount&rdquo; option. It erases the primary discount code and defaults
							to no code, which means the promotion stops being reportable and the
							result cannot be attributed back to the campaign.
						</p>
					</div>
					<p className="included__brandlead reveal">
						Black Friday has a full campaign page of its own this quarter, with three
						poster treatments and the artwork ready to order. See{" "}
						<Link to="/landing/black-friday">Black Friday</Link> for the creative.
					</p>
					<p className="fineprint reveal">
						Questions? <a href={MARKETING_LINK}>marketing@hakimgroup.co.uk</a>
					</p>
				</div>
			</section>
		</FestivePage>
	);
}
