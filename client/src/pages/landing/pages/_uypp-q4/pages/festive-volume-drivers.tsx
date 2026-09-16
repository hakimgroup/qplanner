import type { LandingPageMeta } from "../../../registry";
import { FestivePage } from "../FestivePage";
import { img } from "../uypp-q4";
import { MARKETING_LINK } from "../links";
import { FESTIVE_VOLUME_DRIVERS } from "../data/festive-volume-drivers";

export const meta: LandingPageMeta = {
	slug: "festive-volume-drivers",
	title: "Volume Drivers — Festive Focus Toolkit",
	description:
		"Festive editions of the posters that fill a quiet diary: eye exams available, outside prescriptions welcome, and multi pair.",
	publishedAt: "2026-09-29",
	thumbnail: img("festive-easy-2.jpg"),
	// Toolkit sub-pages render at their URL but stay off the /landing index — the
	// toolkit hub is the way in, exactly as the Q4 campaign pages do it.
	hidden: true,
};

export default function FestiveVolumeDrivers() {
	return (
		<FestivePage
			id="festive-volume-drivers"
			slug={meta.slug}
			docTitle={meta.title}
			campaign={FESTIVE_VOLUME_DRIVERS}
			heroTitle={
				<>
					Volume
					<br />
					Drivers
				</>
			}
			heroImage={img("festive-easy-2.jpg")}
			heroAlt="Festive practice window carrying an eye exams available poster"
			pills={["December – January", "Core KPI · Volume and conversion", "3 assets"]}
			hook="The diary is quiet. The high street is not."
			standfirst="December and January are the two months when footfall and appointments move in opposite directions."
			body="These three posters exist to close that gap. They carry no offer and no clinical language — they simply tell the people already walking past that they can be seen here, that a prescription from elsewhere is welcome, and that a second pair is worth having. The cheapest volume in the toolkit, and the first thing to put up."
			points={[
				"Fills quiet diary slots without discounting",
				"Works on the pavement, where December footfall already is",
				"Nothing to plan, brief or schedule — they go straight up",
				"Two are new festive editions of assets you already know",
				"Runs alongside an event or an offer rather than competing with it",
				"Catches visiting family, who have no practice of their own nearby",
			]}
			creativeTitle="Three assets"
			creativeLead="Not alternatives. Put all three up — they answer three different reasons someone has for not coming in."
			artworkLead="The festive window treatments are shown below. A-board and multi-pair artwork is still in production."
			orderTitle="Order the posters"
			orderNote="Eye exams available and outside prescriptions welcome are already in your Marketing Planner as festive editions. Multi pair is still being set up — the button opens your planner."
			orderFootText="Two of the three order directly from the planner. If you cannot find multi pair yet, speak to your marketing executive."
		>
			<section className="section">
				<div className="wrap">
					<div className="section-head reveal">
						<div>
							<h2 className="display section-head__title">Where to put them</h2>
						</div>
					</div>
					<div className="panels">
						<article className="panel reveal">
							<h3 className="panel__title">On the pavement</h3>
							<p>
								The A-board does most of the work. It is the only asset here that
								reaches someone who was not looking at your practice, which is the
								entire point in a month when the high street is full of people
								going somewhere else.
							</p>
						</article>
						<article className="panel reveal">
							<h3 className="panel__title">In the window</h3>
							<p>
								Alongside the festive display rather than instead of it. The
								window stops people; the poster tells them what they can do about
								it. Keep the two from fighting for the same glass.
							</p>
						</article>
						<article className="panel reveal">
							<h3 className="panel__title">At the dispensing table</h3>
							<p>
								Multi pair belongs inside, where the conversation is already
								happening. A second pair is an easier ask in December than at any
								other point in the year, because one of them can be a gift.
							</p>
						</article>
					</div>
					<p className="fineprint reveal">
						Questions? <a href={MARKETING_LINK}>marketing@hakimgroup.co.uk</a>
					</p>
				</div>
			</section>
		</FestivePage>
	);
}
