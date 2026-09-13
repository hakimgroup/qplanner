import type { LandingPageMeta } from "../../../registry";
import { FestivePage } from "../FestivePage";
import { MARKETING_LINK } from "../links";
import {
	FESTIVE_LOCAL_PR,
	PHOTO_TIPS,
	PR_DEADLINE,
} from "../data/festive-local-pr";

export const meta: LandingPageMeta = {
	slug: "festive-local-pr",
	title: "Local PR — Festive Focus Toolkit",
	description:
		"Give the Gift of Sight. HQ writes and places a story with your local press, free of charge — you send a form and a photograph.",
	publishedAt: "2026-09-29",
	hidden: true,
};

export default function FestiveLocalPr() {
	return (
		<FestivePage
			id="festive-local-pr"
			slug={meta.slug}
			docTitle={meta.title}
			campaign={FESTIVE_LOCAL_PR}
			heroTitle={
				<>
					Local
					<br />
					PR
				</>
			}
			pills={[`Deadline · ${PR_DEADLINE}`, "Core KPI · Volume and conversion", "Free of charge"]}
			hook="Coverage you do not have to write, pay for, or chase."
			standfirst="The PR team at HQ is running Give the Gift of Sight with your local press, on your behalf."
			body="They write the story, place it with media in your area and follow it up. Your part is a form and a photograph. There is no cost, and the only thing that can go wrong is missing the deadline — which is the end of day on 11 December."
			pointsTitle="What it does for the practice"
			points={[
				"Reaches people who have no reason to be thinking about you",
				"Raises awareness of why eyes need checking regularly",
				"Highlights the services, products and clinical expertise you offer",
				"Reinforces the practice as the trusted local expert",
				"Completely free — there is no media spend behind it",
				"Written and placed by HQ, so it costs the team an hour at most",
			]}
			creativeTitle="The campaign"
			creativeLead="One campaign, one form, one deadline."
			artworkLead="There is no artwork to order. What matters is the photograph you send — see below."
			orderTitle="Get involved"
			orderNote={`The form explains how the campaign works in full and collects everything the PR team needs. It closes at ${PR_DEADLINE}.`}
			orderFootText="Nothing else is required from the practice once the form is in."
		>
			{/* The substance of this page. Practices that get no coverage have almost
			    always sent a photograph of a shopfront, so this is deliberately
			    specific about what does not work rather than generally encouraging. */}
			<section className="section">
				<div className="wrap">
					<div className="section-head reveal">
						<div>
							<h2 className="display section-head__title">Not seeing coverage?</h2>
							<p className="lead">
								It is nearly always the photograph. These are the PR team's own
								rules for one that gets picked up.
							</p>
						</div>
					</div>
					<div className="panels">
						{PHOTO_TIPS.map((t) => (
							<article className="panel panel--flag reveal" key={t.tip}>
								<h3 className="panel__title">{t.tip}</h3>
								<p>{t.why}</p>
							</article>
						))}
					</div>
					<p className="fineprint reveal">
						Questions about the campaign?{" "}
						<a href={MARKETING_LINK}>marketing@hakimgroup.co.uk</a>
					</p>
				</div>
			</section>
		</FestivePage>
	);
}
