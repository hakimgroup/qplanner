import type { LandingPageMeta } from "../../../registry";
import { ToolkitSubPage } from "../../_uypp-q4/FestivePage";
import { MARKETING_LINK } from "../../_uypp-q4/links";
import {
	PLATFORM_B_EVIDENCE,
	PLATFORM_CARRIES,
	Q1_SEASONAL,
	SEASONAL_DETAILS,
} from "../data/q1-seasonal";
import { RouteDetails } from "../RouteDetails";
import { Q1_HERO, Q1_TOOLKIT } from "../q1";

export const meta: LandingPageMeta = {
	slug: "q1-seasonal-campaigns",
	title: "Seasonal Q1 Campaigns — Q1 2027 Focus Toolkit",
	description:
		"Two platforms, one promise. Clinical care and self-expression: both say what independents do that the high street can't, which is treat every patient personally.",
	publishedAt: "2026-11-23",
	thumbnail: Q1_HERO,
	hidden: true,
};

export default function Q1SeasonalCampaigns() {
	return (
		<ToolkitSubPage
			toolkit={Q1_TOOLKIT}
			id="q1-seasonal-campaigns"
			slug={meta.slug}
			docTitle={meta.title}
			campaign={Q1_SEASONAL}
			heroTitle={
				<>
					Seasonal Q1
					<br />
					Campaigns
				</>
			}
			heroImage={Q1_HERO}
			pills={["January – March", "Two platforms", "Artwork to follow"]}
			hook="Two platforms, one promise."
			standfirst="Both say what independents do that the high street can't: treat every patient personally."
			body="Our seasonal campaigns run each quarter and give you a ready-made reason to talk to patients at the right moment. For Q1 they are built on two platforms, one for clinical care and one for self-expression, with the same promise behind both."
			pointsTitle="What the platforms do"
			points={[
				"A ready-made reason to talk to patients at the right moment",
				"Platform A grows eye exam volume, myopia management, dry eye and lens upgrades",
				"Platform B drives conversion and ADV with premium and independent ranges",
				"Care the supermarket and the multiples can't match: more time, expertise and attention",
				"Curation and guidance: being chosen for, not choosing alone",
				"Pairs with half term myopia management and your independent eyewear brands",
			]}
			creativeTitle="The two platforms"
			creativeLead="One for clinical care, one for look and feel. Artwork and full campaign information to follow."
			artworkLead="Nothing to show yet. Artwork and full campaign information are to follow, and will appear here when they do."
			orderTitle="Add a platform to your plan"
			orderNote="Add the campaign to your Marketing Planner. The buttons open your planner; if you cannot find a platform there yet, your Marketing Executive can add it to your plan."
			orderFootText="Artwork and full campaign information will follow. Questions in the meantime go to the HG Marketing team."
		>
			{/* Side by side rather than behind the tabs: what each platform carries is
			    how a practice works out which of its own activity belongs under
			    which, and that is a comparison. */}
			<section className="section">
				<div className="wrap">
					<div className="section-head reveal">
						<div>
							<h2 className="display section-head__title">What each platform carries</h2>
							<p className="lead">
								Between them they hold most of what a practice talks about in a
								quarter. This is which conversation sits under which.
							</p>
						</div>
					</div>
					<div className="whofor">
						{PLATFORM_CARRIES.map((p) => (
							<div className="whofor__panel reveal" key={p.title}>
								<h3 className="whofor__title">{p.title}</h3>
								<p className="whofor__claim">&ldquo;{p.claim}&rdquo;</p>
								<ul className="whofor__list">
									{p.items.map((i) => (
										<li key={i}>{i}</li>
									))}
								</ul>
							</div>
						))}
					</div>
					<div className="panel panel--flag panel--wide panel--after reveal">
						<h3 className="panel__title">
							Being chosen for, not choosing alone
						</h3>
						<p>
							<strong>Why Platform B claims curation and guidance.</strong>{" "}
							{PLATFORM_B_EVIDENCE}
						</p>
					</div>
					<p className="fineprint reveal">
						Questions? <a href={MARKETING_LINK}>marketing@hakimgroup.co.uk</a>
					</p>
				</div>
			</section>

			<RouteDetails
				details={SEASONAL_DETAILS}
				tint
				lead="What each platform asks of the practice, before any artwork arrives."
			/>
		</ToolkitSubPage>
	);
}
