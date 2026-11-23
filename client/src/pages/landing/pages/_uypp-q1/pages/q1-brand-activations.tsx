import type { LandingPageMeta } from "../../../registry";
import { ToolkitSubPage } from "../../_uypp-q4/FestivePage";
import { SupplierSection } from "../../_uypp-q4/SupplierSection";
import { BRAND_DETAILS, Q1_BRANDS } from "../data/q1-brands";
import { RouteDetails } from "../RouteDetails";
import { Q1_HERO, Q1_TOOLKIT } from "../q1";

export const meta: LandingPageMeta = {
	slug: "q1-brand-activations",
	title: "Brand Activations — Q1 2027 Focus Toolkit",
	description:
		"Our independent eyewear brands, plus Q1 window campaigns with Gotti, Design Eyewear Group and Orgreen.",
	publishedAt: "2026-11-23",
	thumbnail: Q1_HERO,
	hidden: true,
};

export default function Q1BrandActivations() {
	return (
		<ToolkitSubPage
			toolkit={Q1_TOOLKIT}
			id="q1-brand-activations"
			slug={meta.slug}
			docTitle={meta.title}
			campaign={Q1_BRANDS}
			heroTitle={
				<>
					Brand
					<br />
					Activations
				</>
			}
			heroImage={Q1_HERO}
			pills={["January – March", "Core KPI · Conversion and ADV", "3 window campaigns"]}
			hook="Something the high street doesn't have."
			standfirst="Independent eyewear brands set your practice apart from the high street multiples."
			body="In the new year, when patients are looking for a fresh start and something different, they are a strong way to drive conversion and increase average dispense value. Three brand-led window campaigns sit alongside them this quarter, with Gotti, Design Eyewear Group and Orgreen."
			pointsTitle="Why it converts"
			points={[
				"Sets your practice apart from the high street multiples",
				"Drives conversion and increases average dispense value",
				"The perfect partner for Platform B, Self-Expression / Look & Feel",
				"Reinforces your position as a destination practice with curated collections",
				"A branded window gives patients an extra reason to step inside",
				"Helps drive dispenses into premium ranges",
			]}
			creativeTitle="The Q1 focus"
			creativeLead="Curated, distinctive frames chosen for the patient, not a wall of choice."
			artworkLead="Platform B artwork and full campaign information are to follow, and the in-practice materials with them."
			orderTitle="Add it to your plan"
			orderNote="Add the independent brands focus to your Marketing Planner. The three window campaigns are registered for separately, on each brand's form above."
			orderFootText="For brand-specific support, contact brand.activations@hakimgroup.co.uk"
		>
			<RouteDetails details={BRAND_DETAILS} tint />

			<SupplierSection
				title="Q1 window campaigns"
				lead="Three brand-led windows for Q1, with Gotti, Design Eyewear Group and Orgreen. Designs and timelines are still to be confirmed, so each one opens a form to register your interest rather than to order."
				foot="The windows sit alongside the independent brands focus and Platform B. Registering your interest commits you to nothing: it means you are first to hear when designs, timelines and any qualifying criteria are confirmed."
			/>
		</ToolkitSubPage>
	);
}
