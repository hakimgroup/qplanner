/**
 * The shape of a Festive Focus Toolkit sub-page.
 *
 * Six pages that are genuinely the same page with different content: hero, the
 * hook that states what the group is for, why it works, the activities in it, the
 * artwork, anything specific to say, how to order, the rest of the toolkit,
 * feedback. Q4 wrote that run out by hand on six pages and it drifted — the
 * closing section ended up different on every one, and the day one of them needed
 * fixing, all six did.
 *
 * So the run lives here once and each page supplies only what differs. `children`
 * is the bespoke middle, between the artwork and the ordering block, which is
 * where the pages genuinely diverge — one has supplier rows, one has photography
 * guidance, the rest have a panel of practical detail.
 *
 * Band tones alternate down the page and no two neighbours may share one:
 * dark, indigo, page, tint, dark, page, indigo, tint, indigo. Inserting a section
 * means re-checking the run — see the note in uypp-q4-detail.scss.
 */
import type { ReactNode } from "react";
import { CampaignShell } from "./CampaignShell";
import { CreativeSection } from "./CreativeSection";
import { ArtworkSection } from "./ArtworkSection";
import { OrderSection } from "./OrderSection";
import { FeedbackSection } from "./FeedbackSection";
import { ToolkitCrosslinks, ToolkitHero } from "./FestiveBits";
import { TOOLKIT_FOOT, TOOLKIT_HUB, TOOLKIT_NAV } from "./festive";
import type { Campaign } from "./types";
import type { CampaignId } from "./links";

export function FestivePage({
	id,
	slug,
	docTitle,
	campaign,
	heroTitle,
	pills,
	heroImage,
	heroAlt,
	hook,
	standfirst,
	body,
	pointsTitle = "Why it works",
	points,
	afterPoints,
	creativeTitle,
	creativeLead,
	artworkTitle = "See it across your practice",
	artworkLead,
	orderTitle,
	orderNote,
	orderFootText,
	children,
}: {
	id: CampaignId;
	slug: string;
	docTitle: string;
	campaign: Campaign;
	heroTitle: ReactNode;
	pills: string[];
	heroImage?: string;
	heroAlt?: string;
	hook: string;
	standfirst: string;
	body: string;
	pointsTitle?: string;
	points: string[];
	/**
	 * A section between the bullets and the creative block, for the one thing a
	 * page needs to say before anything else on it.
	 *
	 * `children` lands after the artwork, which is the right place for detail a
	 * reader wants once they have decided. It is the wrong place for something
	 * they should see whether or not they read that far — accessories on the
	 * gifting page being the case that forced this. Note the band immediately
	 * below is tinted, so anything here must not be.
	 */
	afterPoints?: ReactNode;
	creativeTitle: string;
	creativeLead?: ReactNode;
	artworkTitle?: string;
	artworkLead?: ReactNode;
	orderTitle?: string;
	orderNote?: ReactNode;
	orderFootText?: ReactNode;
	children?: ReactNode;
}) {
	return (
		<CampaignShell
			id={id}
			title={docTitle}
			campaign={campaign}
			hub={TOOLKIT_HUB}
			nav={TOOLKIT_NAV}
			footNote={TOOLKIT_FOOT}
		>
			<ToolkitHero title={heroTitle} pills={pills} image={heroImage} alt={heroAlt} />

			{/* The hook: the problem in display type, the turn in bold, then what this
			    group of the toolkit does about it. Three levels of type, centred, no
			    more than four lines each — see .section--hook. */}
			<section className="section section--deck section--hook">
				<div className="wrap hook">
					<div className="hook__text">
						<h2 className="display hook__title reveal">{hook}</h2>
						<p className="hook__standfirst reveal">{standfirst}</p>
						<p className="hook__body reveal">{body}</p>
					</div>
				</div>
			</section>

			<section className="section">
				<div className="wrap">
					<div className="section-head reveal">
						<div>
							<h2 className="display section-head__title">{pointsTitle}</h2>
						</div>
					</div>
					<ul className="intro__points points--two reveal">
						{points.map((p) => (
							<li key={p}>{p}</li>
						))}
					</ul>
				</div>
			</section>

			{afterPoints}

			<CreativeSection title={creativeTitle} lead={creativeLead} />

			<ArtworkSection title={artworkTitle} lead={artworkLead} />

			{children}

			<OrderSection
				title={orderTitle}
				note={orderNote}
				footText={orderFootText}
			/>

			<ToolkitCrosslinks exclude={slug} />

			<FeedbackSection />
		</CampaignShell>
	);
}
