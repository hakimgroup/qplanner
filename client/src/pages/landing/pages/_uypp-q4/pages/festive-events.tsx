import type { LandingPageMeta } from "../../../registry";
import { Link } from "react-router-dom";
import { FestivePage } from "../FestivePage";
import { SupplierSection } from "../SupplierSection";
import { MARKETING_LINK } from "../links";
import { FESTIVE_EVENTS } from "../data/festive-events";

export const meta: LandingPageMeta = {
	slug: "festive-events",
	title: "Events — Festive Focus Toolkit",
	description:
		"A reason to come on a particular day. 12 Days of Christmas across the month, or a single Late Night Shopping evening.",
	publishedAt: "2026-09-29",
	hidden: true,
};

export default function FestiveEvents() {
	return (
		<FestivePage
			id="festive-events"
			slug={meta.slug}
			docTitle={meta.title}
			campaign={FESTIVE_EVENTS}
			heroTitle={
				<>
					Festive
					<br />
					Events
				</>
			}
			pills={["December", "Core KPI · Conversion", "2 formats"]}
			hook="A poster says you are open. An event says come on Thursday."
			standfirst="Practices running a targeted festive event often report record days and record weeks."
			body="The difference is a date. Everything else in this toolkit tells people they could come in; an event tells them when, and gives them a reason that expires. Both formats below do the same job — one spreads it across twelve days, the other concentrates it into a single evening."
			points={[
				"Appointments around an event convert more strongly",
				"Average dispense value runs higher on the night",
				"Gives you a legitimate reason to contact lapsed patients",
				"A brand gift with purchase gives the team something to hand over",
				"A styling follow-up converts the people who did not buy",
				"December shoppers already expect late openings elsewhere",
			]}
			creativeTitle="Two formats"
			creativeLead="Twelve days of small reasons, or one evening of a big one. Pick the one your team can actually staff."
			artworkLead="Shown as two practices ran them last year: Norville Opticians' 12 Days and Broadhurst's Late Night Shopping. Your practice name, dates and offers go into the same templates."
			orderTitle="Add an event to your plan"
			orderNote="Both formats are in your Marketing Planner, and each button opens the right one."
			orderFootText="Events need a date before they need artwork. Pick the date first, then order."
		>
			{/* The running order sits after the artwork rather than in the route copy:
			    it is identical for both formats, and repeating it inside each route
			    would be the third time the same six lines appeared on one page. */}
			<section className="section section--tint">
				<div className="wrap">
					<div className="section-head reveal">
						<div>
							<h2 className="display section-head__title">Running it</h2>
							<p className="lead">
								The same sequence whichever format you choose. Most of it happens
								before the day.
							</p>
						</div>
					</div>
					<div className="panels">
						<article className="panel panel--flag reveal">
							<span className="panel__no">Before</span>
							<h3 className="panel__title">Date and audience</h3>
							<p>
								Set a date and decide who it is for — VIPs, lapsed patients,
								partners. Then two invitations and one reminder, by email or SMS.
							</p>
						</article>
						<article className="panel panel--flag reveal">
							<span className="panel__no">On the night</span>
							<h3 className="panel__title">A bookings desk</h3>
							<p>
								A styling rota, light refreshments, point of sale up, and a simple
								offer that exists only that evening. Someone on the door whose job
								is booking the next appointment.
							</p>
						</article>
						<article className="panel panel--flag reveal">
							<span className="panel__no">Afterwards</span>
							<h3 className="panel__title">The follow-up</h3>
							<p>
								Thank everyone who came, reserve the frames people liked, and book
								the styling revisits. This is where most of the conversion
								actually lands.
							</p>
						</article>
					</div>
					<p className="fineprint reveal">
						Planning one and want a hand?{" "}
						<a href={MARKETING_LINK}>marketing@hakimgroup.co.uk</a>
					</p>
				</div>
			</section>

			{/* The brands, at the foot. An event is where a gift with purchase works
			    hardest — there is already a reason to buy in the room — so the forms
			    are reachable from the page a practice is planning on, rather than
			    only from the gifting page. */}
			<SupplierSection
				lead="Every format above works better with something to hand over on the day, and four suppliers are funding gifts this December. Opt in here and pair one with your event — the full qualifying criteria are on the gifting page."
				foot="A supplier gift does not replace the event, it gives it something to hand over. Get the date in your plan first, then opt in alongside it."
			/>

			<section className="section section--tint">
				<div className="wrap">
					<div className="panel panel--flag panel--wide reveal">
						<h3 className="panel__title">More gifting for the night</h3>
						<p>
							Accessories do the same job without a form or an allocation. COTI
							chains, Theia cloths and multi-frame cases all gift well, and an
							event is the easiest evening of the year to put them front and
							centre with a prompt about stocking fillers.
						</p>
						<Link className="btn btn--ghost" to="/landing/festive-gifting">
							Gifting &amp; brand support
						</Link>
					</div>
				</div>
			</section>
		</FestivePage>
	);
}
