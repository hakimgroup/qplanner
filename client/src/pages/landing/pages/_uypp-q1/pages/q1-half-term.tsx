import type { LandingPageMeta } from "../../../registry";
import { ToolkitSubPage } from "../../_uypp-q4/FestivePage";
import { HALF_TERM_DETAILS, Q1_HALF_TERM } from "../data/q1-half-term";
import { RouteDetails } from "../RouteDetails";
import { Q1_HERO, Q1_TOOLKIT } from "../q1";

export const meta: LandingPageMeta = {
	slug: "q1-half-term",
	title: "Half Term — Q1 2027 Focus Toolkit",
	description:
		"February half term: myopia management and the family voucher. Two evergreen campaigns for a week when parents have no school day to work around.",
	publishedAt: "2026-11-23",
	thumbnail: Q1_HERO,
	hidden: true,
};

export default function Q1HalfTerm() {
	return (
		<ToolkitSubPage
			toolkit={Q1_TOOLKIT}
			id="q1-half-term"
			slug={meta.slug}
			docTitle={meta.title}
			campaign={Q1_HALF_TERM}
			heroTitle={
				<>
					Half
					<br />
					Term
				</>
			}
			heroImage={Q1_HERO}
			pills={["February half term", "Core KPI · Volume and conversion", "Evergreen assets"]}
			hook="No school day to work around."
			standfirst="Half term is one of the easiest times for parents to book children's eye exams."
			body="It is the ideal moment to start conversations about myopia management, and a great time to bring whole families into practice in a traditionally quieter month. Both campaigns run on evergreen assets, so they are ready to go and can be repeated at other half terms through the year."
			pointsTitle="Why half term works"
			points={[
				"Parents can book children's eye exams without working around school",
				"A natural moment to start the myopia management conversation",
				"Positions your practice as the local expert in children's eye health",
				"The voucher gives parents a simple reason to book everyone in one visit",
				"Drives exam volume in a traditionally quieter month",
				"Evergreen, so both can be repeated at other half terms",
			]}
			creativeTitle="Two campaigns"
			creativeLead="Written to be run together: the voucher brings the whole family in, and myopia management is there for the children who need it."
			artworkLead="Both campaigns use evergreen assets that already exist. Images of them are still to be added here; the family voucher set can be downloaded now."
			orderTitle="Add half term to your plan"
			orderNote="Add the campaigns to your Marketing Planner. Both are evergreen, so they can go into other school holidays in your 2027 plan as well."
			orderFootText="February half term dates vary by local authority. Check yours before setting campaign dates."
		>
			<RouteDetails
				details={HALF_TERM_DETAILS}
				lead="What to do, what to stock and who it is for, campaign by campaign."
			/>
		</ToolkitSubPage>
	);
}
