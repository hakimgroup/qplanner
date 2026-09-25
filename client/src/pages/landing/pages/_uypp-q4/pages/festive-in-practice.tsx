import type { LandingPageMeta } from "../../../registry";
import { Link } from "react-router-dom";
import { FestivePage } from "../FestivePage";
import { img } from "../uypp-q4";
import { FESTIVE_INSPIRATION, MARKETING_LINK } from "../links";
import { FESTIVE_IN_PRACTICE } from "../data/festive-in-practice";

export const meta: LandingPageMeta = {
	slug: "festive-in-practice",
	title: "In The Practice — Festive Focus Toolkit",
	description:
		"What the practice looks and sounds like in December — the window display, and the Merry Christmas message from the team.",
	publishedAt: "2026-09-29",
	thumbnail: img("festive-easy-1.jpg"),
	hidden: true,
};

export default function FestiveInPractice() {
	return (
		<FestivePage
			id="festive-in-practice"
			slug={meta.slug}
			docTitle={meta.title}
			campaign={FESTIVE_IN_PRACTICE}
			heroTitle={
				<>
					In The
					<br />
					Practice
				</>
			}
			heroImage={img("festive-easy-1.jpg")}
			heroAlt="Festive practice window dressed with paper decorations and frames on plinths"
			pills={["December", "Core KPI · Volume and conversion", "2 activities"]}
			hook="Be part of the local Christmas, not just open during it."
			standfirst="Independent practices are a pillar of their communities. December is the month that is easiest to prove and easiest to waste."
			body="Two pieces do most of the work. The window is the loudest thing the practice owns on a busy high street, and it is what decides whether people notice you at all. The Merry Christmas email reaches the patients who are not walking past — the same message, sent by the people they actually see."
			points={[
				"A window display is the only asset that works on people not looking for you",
				"December footfall is the highest of the year on most high streets",
				"Positions the practice as somewhere to buy a gift, not only be tested",
				"Off-the-shelf decor gets you there in an afternoon",
				"A bespoke window, done with a local maker, gets you talked about",
				"The Christmas email is the one December message with nothing to sell",
			]}
			creativeTitle="Two activities"
			creativeLead="One outward-facing, one straight to the patients you already have. Neither takes the place of the other."
			artworkLead="Window photography and the Seeing is Believing posters are below. The Merry Christmas email artwork is still in production."
			orderTitle="Add these to your plan"
			orderNote="Festive posters order straight from the planner. The Merry Christmas HTML is still being set up — the button opens your planner."
			orderFootText="The window needs lead time and the decor needs ordering. Start this one first."
		>
			<section className="section">
				<div className="wrap">
					<div className="section-head reveal">
						<div>
							<h2 className="display section-head__title">Two ways to do the window</h2>
							<p className="lead">
								Both are legitimate. The difference is time and ambition, not
								budget.
							</p>
						</div>
					</div>
					<div className="tiers">
						<article className="tier reveal">
							<span className="tier__step">01</span>
							<div className="tier__body">
								<h3 className="tier__title">Off the shelf</h3>
								<p>
									Our creative team has put a premium window display together as a
									single shopping list, so the whole thing can be ordered in one
									go and dressed in an afternoon. This is the version that
									definitely happens.
								</p>
							</div>
							<figure className="tier__media">
								<img
									src={img("festive-easy-1.jpg")}
									alt="Off-the-shelf festive window display"
									loading="lazy"
								/>
							</figure>
						</article>
						<article className="tier reveal">
							<span className="tier__step">02</span>
							<div className="tier__body">
								<h3 className="tier__title">Bespoke, with a local maker</h3>
								<p>
									Approach a vendor in your area and commission something built for
									your window. More work and more lead time, and the only route
									that ends with the practice being the talk of the high street.
									Marketing can advise on briefing one.
								</p>
							</div>
							<figure className="tier__media">
								<img
									src={img("festive-storytelling.jpg")}
									alt="Hand-painted shopfront window and an oversized ribbon installation"
									loading="lazy"
								/>
							</figure>
						</article>
					</div>
					<p className="included__brandlead reveal">
						<strong>There is a group competition on this.</strong> Windows are judged
						across the estate, so photograph yours once it is up. The full creative
						routes, the poster set and the decor list live on{" "}
						<Link to="/landing/festive-windows">Festive Windows</Link>, and the
						shopping list itself is{" "}
						<a href={FESTIVE_INSPIRATION} target="_blank" rel="noopener noreferrer">
							here
						</a>
						.
					</p>
					<p className="fineprint reveal">
						Want advice on a custom window?{" "}
						<a href={MARKETING_LINK}>marketing@hakimgroup.co.uk</a>
					</p>
				</div>
			</section>
		</FestivePage>
	);
}
