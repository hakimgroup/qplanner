import { Box, Group, SimpleGrid, Text } from "@mantine/core";
import {
	IconCalendarStats,
	IconRocket,
	IconUsersGroup,
} from "@tabler/icons-react";
import {
	Card,
	CTA,
	Hero,
	LandingPageShell,
	Quote,
	Section,
	Split,
	Stats,
} from "../shell";
import type { LandingPageMeta } from "../registry";

export const meta: LandingPageMeta = {
	slug: "welcome-to-summer",
	title: "Welcome to the Summer Campaign",
	description:
		"Practice-facing announcement for the 2026 summer push — what's launching, when, and how to opt in.",
	publishedAt: "2026-06-14",
};

export default function WelcomeToSummer() {
	return (
		<LandingPageShell title={meta.title}>
			<Hero
				eyebrow="Summer 2026"
				headline="Summer is on."
				subheadline="Three flagship campaigns, a refreshed asset pack, and dates locked in. Pick what fits your practice and we'll handle the rest."
			>
				<Group justify="center" gap={6}>
					<Text size="xs" c="gray.6" fw={600}>
						Launches 1 July · ends 31 August
					</Text>
				</Group>
			</Hero>

			<Section
				eyebrow="What's in the pack"
				title="Three campaigns to choose from"
				subtitle="Mix and match — you can add as many as you like to your plan."
			>
				<SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
					<Card title="Sunshine Eye Health" icon={<IconRocket size={20} />}>
						The flagship summer brand campaign — refreshed creatives, printed
						pack, and social tiles ready to go.
					</Card>
					<Card
						title="Kids Back-to-School"
						icon={<IconUsersGroup size={20} />}
						accent="blue"
					>
						Family-focused push leading into the September return, with bundle
						pricing on frames and lenses.
					</Card>
					<Card
						title="Summer Lens Bundle"
						icon={<IconCalendarStats size={20} />}
						accent="teal"
					>
						Two-week activation around your busiest week. Practice picks the
						week, we handle artwork.
					</Card>
				</SimpleGrid>
			</Section>

			<Stats
				items={[
					{ value: "200+", label: "Practices", hint: "Across the group" },
					{ value: "3", label: "Campaigns", hint: "Mix as you like" },
					{ value: "12", label: "Weeks", hint: "July → September" },
					{ value: "1", label: "Click", hint: "To add to your plan" },
				]}
			/>

			<Split
				image="https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=1200&q=80"
				imageAlt="Optician fitting glasses for a patient"
				imageSide="left"
			>
				<Text size="xs" fw={700} c="violet.7" tt="uppercase" lts={0.6}>
					Sunshine Eye Health
				</Text>
				<Text size="xl" fw={700} c="gray.9">
					The flagship summer push
				</Text>
				<Text size="sm" c="gray.7">
					Refreshed creatives across print, social, and in-practice. Designed
					to land in early July when foot traffic peaks. Choose from the
					curated asset pack or let the design team tailor it for your
					practice.
				</Text>
			</Split>

			<Split
				image="https://images.unsplash.com/photo-1543269664-7eef42226a21?auto=format&fit=crop&w=1200&q=80"
				imageAlt="Children trying on glasses at an optician"
				imageSide="right"
			>
				<Text size="xs" fw={700} c="violet.7" tt="uppercase" lts={0.6}>
					Kids Back-to-School
				</Text>
				<Text size="xl" fw={700} c="gray.9">
					The family-focused follow-up
				</Text>
				<Text size="sm" c="gray.7">
					Picks up where summer ends. Aimed at parents booking eye tests
					before the September return. Bundle pricing on frames and lenses
					built in.
				</Text>
			</Split>

			<Quote attribution="Sophie Gaul" role="Marketing — Hakim Group">
				The 2025 summer campaign drove a 22% lift in eye tests across
				participating practices. We're doubling down for 2026.
			</Quote>

			<Section
				eyebrow="What you need to do"
				title="Three steps, ten minutes"
			>
				<Box>
					<Text component="ol" size="sm" c="gray.7" style={{ paddingLeft: 18 }}>
						<li style={{ marginBottom: 8 }}>
							Open your plan in the planner and review the three campaigns under
							"Browse".
						</li>
						<li style={{ marginBottom: 8 }}>
							Add the ones you want. Pick a creative and the assets you need —
							the design team takes it from there.
						</li>
						<li>
							Approve the artwork when it lands in your inbox. Go live on your
							chosen date.
						</li>
					</Text>
				</Box>
			</Section>

			<CTA
				href="/dashboard"
				secondary={{
					href: "/notifications-center",
					label: "See pending requests",
				}}
				caption="You'll land back in the planner you already use."
			>
				Open my plan
			</CTA>
		</LandingPageShell>
	);
}
