import type { LandingPageMeta } from "../../../registry";
import { ToolkitSubPage } from "../../_uypp-q4/FestivePage";
import { Cta } from "../../_uypp-q4/Cta";
import { BOOK_MARKETING_CALL, MARKETING_LINK } from "../../_uypp-q4/links";
import {
	CALL_AGENDA,
	PLAN_AUDIENCE,
	PLAN_STEPS,
	Q1_GET_READY,
} from "../data/q1-get-ready";
import { Q1_HERO, Q1_TOOLKIT, q1img } from "../q1";

export const meta: LandingPageMeta = {
	slug: "q1-get-ready",
	title: "Get Ready for 2027 — Q1 2027 Focus Toolkit",
	description:
		"Setting up your 2027 marketing and your Marketing Planner, now live, including booking your marketing call.",
	publishedAt: "2026-11-23",
	thumbnail: q1img("q1-planner-view.jpg"),
	// Toolkit sub-pages render at their URL but stay off the /landing index — the
	// toolkit hub is the way in, as with the Q4 campaign pages and Festive.
	hidden: true,
};

export default function Q1GetReady() {
	return (
		<ToolkitSubPage
			toolkit={Q1_TOOLKIT}
			id="q1-get-ready"
			slug={meta.slug}
			docTitle={meta.title}
			campaign={Q1_GET_READY}
			heroTitle={
				<>
					Get Ready
					<br />
					for 2027
				</>
			}
			heroImage={Q1_HERO}
			pills={["Plan now · review quarterly", "Core KPI · Volume and conversion", "Planner now live"]}
			hook="Plan the year, then adapt."
			standfirst="Practices that map out their year in advance are ready when the quieter periods come."
			body="The alternative is scrambling for activity once volume has already dropped. Planning now means half terms, seasonal campaigns, brand activations and events are booked in, assets are ordered in time and your team knows what's coming."
			pointsTitle="Why plan now"
			points={[
				"Ready for the quieter periods before they arrive",
				"Half terms, seasonal campaigns, brand activations and events booked in",
				"Assets, print and brand opt-ins ordered in time",
				"Your team knows what is coming",
				"A plan you review each quarter, not one you are held to",
				"Popular campaigns are not missed for want of an early decision",
			]}
			creativeTitle="Where the plan lives"
			creativeLead="All campaigns, assets and event opportunities in one place, in a calendar view."
			orderTitle="Start your 2027 plan"
			orderNote="Your 2027 Marketing Planner is live. Open it and start adding campaigns, or book your marketing call and build the plan with your Marketing Executive."
			orderFootText="Would you rather talk it through first? Contact your Marketing Executive, or the HG Marketing team."
		>
			{/* The advice half of the brief. Six steps in the order the brief gives
			    them: its five, and the line that follows them — review it each
			    quarter — which is the step that makes the other five worth doing. */}
			<section className="section">
				<div className="wrap">
					<div className="section-head reveal">
						<div>
							<h2 className="display section-head__title">
								Setting up your 2027 marketing
							</h2>
							<p className="lead">
								Six steps, in order. The first five build the plan; the sixth is
								what keeps it useful.
							</p>
						</div>
					</div>
					<div className="panels">
						{PLAN_STEPS.map((s, i) => (
							<article className="panel reveal" key={s.title}>
								<span className="panel__no">Step {String(i + 1).padStart(2, "0")}</span>
								<h3 className="panel__title">{s.title}</h3>
								<p>{s.body}</p>
							</article>
						))}
						<article className="panel panel--flag reveal">
							<span className="panel__no">Step 06</span>
							<h3 className="panel__title">Review it each quarter</h3>
							<p>
								A plan isn&rsquo;t fixed. Review it each quarter with your Marketing
								Executive and adjust based on what&rsquo;s working.
							</p>
						</article>
					</div>
					<p className="fineprint reveal">
						Products to include are at practice discretion. Build your plan around
						your core KPIs.
					</p>
				</div>
			</section>

			<section className="section section--tint">
				<div className="wrap">
					<div className="section-head reveal">
						<div>
							<h2 className="display section-head__title">Book your marketing call</h2>
							<p className="lead">
								Your Marketing Executive will build the plan with you.
							</p>
						</div>
					</div>
					<div className="panels panels--four">
						<article className="panel reveal">
							<h3 className="panel__title">In your call</h3>
							<ul className="intro__points">
								{CALL_AGENDA.map((a) => (
									<li key={a}>{a}</li>
								))}
							</ul>
							<div className="panel__actions">
								<Cta href={BOOK_MARKETING_CALL}>Book your marketing call</Cta>
							</div>
						</article>
						<article className="panel panel--flag reveal">
							<h3 className="panel__title">Why early matters</h3>
							<p>
								Last year, several practices that chose 12 Days of Christmas
								didn&rsquo;t go ahead because the daily offers weren&rsquo;t
								committed in time. Planning early avoids missing out on popular
								campaigns.
							</p>
							<h3 className="panel__title panel__title--sub">Who this is for</h3>
							<ul className="intro__points">
								{PLAN_AUDIENCE.map((a) => (
									<li key={a}>{a}</li>
								))}
							</ul>
						</article>
					</div>
					<p className="fineprint reveal">
						A booking link for the call is still to come. Until then the button
						opens a message to the HG Marketing team:{" "}
						<a href={MARKETING_LINK}>marketing@hakimgroup.co.uk</a>
					</p>
				</div>
			</section>
		</ToolkitSubPage>
	);
}
