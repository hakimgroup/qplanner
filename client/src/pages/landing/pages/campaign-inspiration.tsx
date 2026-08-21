/**
 * Campaign Inspiration — a scrollable gallery of past campaigns, each opening
 * into a case study covering how it performed.
 *
 * All content lives in `_inspiration/data.ts`. To add a campaign you edit that
 * file and nothing else — this page derives the filter chips, the grid and the
 * case-study overlay from the data.
 *
 * The open case study is mirrored into the URL as `?campaign=<id>`, so a single
 * case study can be linked directly:
 *   /landing/campaign-inspiration?campaign=care-you-can-see
 */
import { useMemo, useState } from "react";
import { Button, Center, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { useSearchParams } from "react-router-dom";
import { CTA, Hero, LandingPageShell, Section } from "../shell";
import type { LandingPageMeta } from "../registry";
import CampaignCard from "./_inspiration/CampaignCard";
import CaseStudyModal from "./_inspiration/CaseStudyModal";
import { CAMPAIGNS, CATEGORIES, MARKETING_EMAIL } from "./_inspiration/data";
import "./_inspiration/inspiration.scss";

export const meta: LandingPageMeta = {
	slug: "campaign-inspiration",
	title: "Campaign Inspiration",
	description:
		"A gallery of campaigns we've run — what they looked like, how they performed, and who to talk to about running one.",
	publishedAt: "2026-08-21",
	// Set explicitly: this page is data-driven, so there's no literal image URL
	// in the source for the index's auto-thumbnail scanner to find.
	thumbnail: "/landing-assets/uypp/img/creative-card.jpg",
};

/** "All" plus only those categories that actually have campaigns behind them. */
const ACTIVE_CATEGORIES = [
	"All",
	...CATEGORIES.filter((category) =>
		CAMPAIGNS.some((campaign) => campaign.category === category),
	),
] as const;

export default function CampaignInspiration() {
	const [filter, setFilter] = useState<string>("All");
	const [searchParams, setSearchParams] = useSearchParams();

	// The open case study is read straight from the URL, which keeps deep links,
	// the Back button and the modal in agreement without a second source of truth.
	const openId = searchParams.get("campaign");
	const openCampaign = useMemo(
		() => CAMPAIGNS.find((campaign) => campaign.id === openId) ?? null,
		[openId],
	);

	const visible = useMemo(
		() =>
			filter === "All"
				? CAMPAIGNS
				: CAMPAIGNS.filter((campaign) => campaign.category === filter),
		[filter],
	);

	/**
	 * Open/close drive local state first, then mirror into the URL so a single
	 * case study stays linkable. Any other query params are preserved, in case
	 * the page is ever linked with campaign tracking tags on it.
	 */
	const openCase = (id: string) => {
		const next = new URLSearchParams(searchParams);
		next.set("campaign", id);
		setSearchParams(next);
	};

	const closeCase = () => {
		const next = new URLSearchParams(searchParams);
		next.delete("campaign");
		setSearchParams(next, { replace: true });
	};

	return (
		<LandingPageShell title={meta.title} maxWidth={1180}>
			<Hero
				eyebrow="Inspiration"
				headline="Campaigns worth stealing from."
				subheadline="Everything we've run, in one place — the artwork, the numbers behind it, and a straight line to the team who built it."
			>
				<Text size="xs" c="gray.6" fw={600}>
					{CAMPAIGNS.length} campaigns · updated{" "}
					{new Date(meta.publishedAt!).toLocaleDateString("en-GB", {
						month: "long",
						year: "numeric",
					})}
				</Text>
			</Hero>

			<Section
				eyebrow="Browse"
				title="Pick a campaign"
				subtitle="Filter by type, then open any card for the full case study."
			>
				<Stack gap={24}>
					{/* ── Filter chips ─────────────────────────────────────────────── */}
					<Group gap={8}>
						{ACTIVE_CATEGORIES.map((category) => {
							const active = filter === category;
							return (
								<Button
									key={category}
									size="xs"
									radius={999}
									variant={active ? "filled" : "default"}
									color="violet"
									onClick={() => setFilter(category)}
									aria-pressed={active}
								>
									{category}
								</Button>
							);
						})}
					</Group>

					{/* ── The grid ─────────────────────────────────────────────────── */}
					{visible.length > 0 ? (
						<div className="insp">
							<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
								{visible.map((campaign) => (
									<CampaignCard
										key={campaign.id}
										campaign={campaign}
										onOpen={openCase}
									/>
								))}
							</SimpleGrid>
						</div>
					) : (
						<Center py={48}>
							<Text size="sm" c="gray.6">
								Nothing in this category yet.
							</Text>
						</Center>
					)}
				</Stack>
			</Section>

			<CTA
				href={`mailto:${MARKETING_EMAIL}?subject=Campaign%20enquiry`}
				secondary={{ href: "/dashboard", label: "Open my plan" }}
				caption="Seen something you'd like to run? Tell us which practice and we'll take it from there."
			>
				Talk to the marketing team
			</CTA>

			{/* Lives outside the grid so it isn't affected by the filter. */}
			<div className="insp">
				<CaseStudyModal campaign={openCampaign} onClose={closeCase} />
			</div>
		</LandingPageShell>
	);
}
