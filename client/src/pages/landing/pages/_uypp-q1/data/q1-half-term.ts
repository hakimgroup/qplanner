/**
 * Q1 2027 Focus Toolkit — February half term.
 *
 * Myopia management and the family voucher, as tabs on one page. The brief
 * writes each to be paired with the other — "Pair with the family voucher to
 * bring the whole family in", "Pair with the myopia management campaign for
 * children who need it" — so they are presented as the pair they are.
 *
 * Both run on evergreen assets that already exist. They are not on this site
 * yet, so the tiles are placeholders that say what is coming; the family voucher
 * set is linked as the SharePoint folder the brief points to.
 */
import {
	BESPOKE_MYOPIA_OFFER,
	FAMILY_VOUCHER_ASSETS,
	Q1_ORDER,
} from "../../_uypp-q4/links";
import type { Campaign } from "../../_uypp-q4/types";
import type { RouteDetail } from "../RouteDetails";

export const Q1_HALF_TERM: Campaign = {
	orderLabel: "Open your Marketing Planner",
	routes: [
		{
			id: "myopia",
			name: "Myopia Management",
			accent: "#1F5A5E",
			body: `<p>Half term is one of the easiest times for parents to book children&rsquo;s eye exams, with no school day to work around. It&rsquo;s the ideal moment to start conversations about myopia management and position your practice as the local expert in children&rsquo;s eye health.</p>
				<p>Myopia management is more affordable than ever. Remember to bespoke your myopia offer so it reflects your practice&rsquo;s pricing and the options you provide, then lead with it in your half term messaging.</p>
				<p>Our evergreen half term assets make it simple to promote.</p>`,
			note: `<p><strong>Bespoke your offer first.</strong> Speak to your Marketing Executive about bespoking your myopia offer, and agree it with your team before the campaign goes live.</p>`,
			order: {
				label: "Open your planner",
				href: Q1_ORDER.myopia,
			},
			action: {
				label: "Ask about a bespoke offer",
				href: BESPOKE_MYOPIA_OFFER,
			},
			placements: [
				{
					key: "aboard",
					label: "A-board",
					items: [{ ph: true, cap: "Evergreen half term A-board — image to come" }],
				},
				{
					key: "window",
					label: "Window",
					items: [{ ph: true, cap: "Evergreen half term window poster — image to come" }],
				},
				{
					key: "social",
					label: "Social",
					items: [{ ph: true, cap: "Evergreen half term social post — image to come" }],
				},
			],
		},
		{
			id: "family-voucher",
			name: "Family Voucher",
			accent: "#B8651B",
			body: `<p>February half term is a great time to bring whole families into practice. The family voucher gives parents a simple reason to book eye exams for everyone in one visit, driving exam volume in a traditionally quieter month.</p>
				<p>The campaign uses our evergreen family voucher assets, so it&rsquo;s ready to go and can be repeated at other half terms through the year.</p>`,
			note: `<p><strong>Redeeming it.</strong> Make sure your team know how to redeem the voucher in Optix. The code is still to be confirmed.</p>`,
			order: {
				label: "Open your planner",
				href: Q1_ORDER.familyVoucher,
			},
			action: {
				label: "Download the voucher assets",
				href: FAMILY_VOUCHER_ASSETS,
			},
			placements: [
				{
					key: "aboard",
					label: "A-board",
					items: [{ ph: true, cap: "Family voucher A-board — image to come" }],
				},
				{
					key: "window",
					label: "Window",
					items: [{ ph: true, cap: "Family voucher window poster — image to come" }],
				},
				{
					key: "social",
					label: "Social",
					items: [{ ph: true, cap: "Family voucher social post — image to come" }],
				},
				{
					key: "email",
					label: "Email and SMS",
					items: [{ ph: true, cap: "The voucher, as sent to patients — image to come" }],
				},
			],
		},
	],
};

/** "Bringing it to life", by campaign. */
export const HALF_TERM_DETAILS: Record<string, RouteDetail> = {
	myopia: {
		kpi: "Volume and conversion",
		period: "February half term",
		steps: [
			"Bespoke your myopia offer and agree it with your team before the campaign goes live.",
			"Use the evergreen half term assets on A-boards, in your window and on social media in the two weeks before half term.",
			"Send a recall email or SMS to families with children due an eye exam.",
			"Make sure optoms and dispensers are briefed on the myopia management options and pricing.",
			"Pair with the family voucher to bring the whole family in.",
		],
		products: [
			"Your practice's myopia management options, such as myopia control spectacle lenses and contact lenses",
			"Children's frame ranges",
		],
		audience: [
			"Parents and carers of school-age children",
			"Existing patients with children due an eye exam",
			"Families with a history of short-sightedness",
			"Local schools and community groups",
		],
		support:
			"February half term dates vary by local authority. Check yours before setting campaign dates.",
	},
	"family-voucher": {
		kpi: "Volume",
		period: "February half term",
		steps: [
			"Display the family voucher assets on A-boards, in your window and across social media.",
			"Send the voucher by email or SMS to existing patients with families before half term.",
			"Offer back-to-back appointment slots so families can be seen together.",
			"Pair with the myopia management campaign for children who need it.",
			"Make sure your team know how to redeem the voucher in Optix (code to be confirmed).",
		],
		products: [
			"Children's and adult frame ranges",
			"Multi pair offers to support family purchases",
		],
		audience: [
			"Families with school-age children",
			"Existing patients due a recall",
			"Local communities and parent groups",
		],
		support:
			"The family voucher is an evergreen asset. Add it to other school holidays in your 2027 Marketing Planner.",
	},
};
