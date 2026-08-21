/**
 * The case-study overlay. Opens when a card is clicked, and is also what a
 * `?campaign=<id>` deep link lands on.
 *
 * Every block below is conditional on its data existing, so an entry with no
 * metrics, no gallery and no tags still renders as a clean, intentional page
 * rather than a set of empty headings.
 */
import { useEffect, useState } from "react";
import {
	Badge,
	Box,
	Button,
	Divider,
	Group,
	Modal,
	SimpleGrid,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { IconArrowRight, IconMail } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import type { CampaignEntry, CampaignLink } from "./data";

interface CaseStudyModalProps {
	campaign: CampaignEntry | null;
	onClose: () => void;
}

/**
 * Renders one CTA button, picking the right element for the href:
 *   "/…"      → react-router Link, stays inside the SPA
 *   "mailto:" → plain anchor, opens the mail client
 *   otherwise → anchor with target="_blank"
 */
function LinkButton({ link, primary }: { link: CampaignLink; primary: boolean }) {
	const isInternal = link.href.startsWith("/");
	const isMailto = link.href.startsWith("mailto:");

	const shared = {
		size: "md" as const,
		radius: 10,
		color: "violet",
		variant: primary ? ("filled" as const) : ("light" as const),
		rightSection: !isMailto ? <IconArrowRight size={16} /> : undefined,
		leftSection: isMailto ? <IconMail size={16} /> : undefined,
	};

	if (isInternal) {
		return (
			<Button component={Link} to={link.href} {...shared}>
				{link.label}
			</Button>
		);
	}

	return (
		<Button
			component="a"
			href={link.href}
			// mailto: must not open a blank tab — it would leave an empty window behind.
			target={isMailto ? undefined : "_blank"}
			rel={isMailto ? undefined : "noopener noreferrer"}
			{...shared}
		>
			{link.label}
		</Button>
	);
}

export default function CaseStudyModal({ campaign, onClose }: CaseStudyModalProps) {
	/**
	 * `campaign` goes null as soon as the URL param is cleared, but the modal
	 * still has a fade-out to play. Rendering `campaign` directly would blank the
	 * contents instantly, so you'd watch an empty white panel fade away. Holding
	 * the last opened campaign keeps the case study on screen until it unmounts.
	 */
	const [rendered, setRendered] = useState<CampaignEntry | null>(campaign);

	useEffect(() => {
		if (campaign) setRendered(campaign);
	}, [campaign]);

	return (
		<Modal
			opened={campaign !== null}
			onClose={onClose}
			size={880}
			radius={16}
			padding={0}
			centered
			overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}
			title={null}
			aria-label={rendered ? `${rendered.title} case study` : undefined}
		>
			{rendered && (
				<Box>
					{/* ── Banner ─────────────────────────────────────────────────── */}
					<img
						className="insp__banner"
						src={rendered.image}
						alt={rendered.imageAlt}
					/>

					<Box px={{ base: 20, sm: 32 }} py={28}>
						<Stack gap={20}>
							{/* ── Title block ──────────────────────────────────────── */}
							<Stack gap={10}>
								<Group gap={8}>
									<Badge
										variant="filled"
										color="violet"
										radius="sm"
										tt="uppercase"
									>
										{rendered.category}
									</Badge>
									<Text size="xs" fw={700} c="gray.6" tt="uppercase" lts={0.6}>
										{rendered.period}
									</Text>
								</Group>

								<Title
									order={2}
									c="gray.9"
									style={{ fontSize: 30, lineHeight: 1.15 }}
								>
									{rendered.title}
								</Title>

								<Text size="lg" c="gray.7" style={{ lineHeight: 1.55 }}>
									{rendered.summary}
								</Text>
							</Stack>

							{/* ── Metrics (optional) ───────────────────────────────── */}
							{rendered.metrics && rendered.metrics.length > 0 && (
								<Box
									py="lg"
									px="md"
									style={{
										background:
											"linear-gradient(135deg, var(--mantine-color-violet-0) 0%, var(--mantine-color-gray-0) 100%)",
										border: "1px solid var(--mantine-color-violet-1)",
										borderRadius: 14,
									}}
								>
									<SimpleGrid
										cols={{
											base: 1,
											xs: Math.min(rendered.metrics.length, 3),
										}}
										spacing="lg"
									>
										{rendered.metrics.map((metric) => (
											<Stack key={metric.label} gap={2} align="center" ta="center">
												<Title
													order={3}
													c="violet.7"
													style={{
														fontSize: 32,
														lineHeight: 1.05,
														letterSpacing: -0.5,
													}}
												>
													{metric.value}
												</Title>
												<Text
													size="xs"
													fw={700}
													c="gray.9"
													tt="uppercase"
													lts={0.6}
												>
													{metric.label}
												</Text>
												{metric.hint && (
													<Text size="xs" c="gray.6">
														{metric.hint}
													</Text>
												)}
											</Stack>
										))}
									</SimpleGrid>
								</Box>
							)}

							{/* ── Narrative ────────────────────────────────────────── */}
							<Stack gap={12}>
								{rendered.narrative.map((paragraph, i) => (
									<Text key={i} size="md" c="gray.8" style={{ lineHeight: 1.65 }}>
										{paragraph}
									</Text>
								))}
							</Stack>

							{/* ── Gallery strip (optional) ─────────────────────────── */}
							{rendered.gallery && rendered.gallery.length > 0 && (
								<Stack gap={10}>
									<Text size="xs" fw={700} c="violet.7" tt="uppercase" lts={0.6}>
										The work
									</Text>
									<div className="insp__strip" tabIndex={0}>
										{rendered.gallery.map((image) => (
											<figure key={image.src} className="insp__strip-item">
												<img
													className="insp__strip-img"
													src={image.src}
													alt={image.alt}
													loading="lazy"
												/>
												{image.caption && (
													<Text component="figcaption" size="xs" c="gray.6" mt={6}>
														{image.caption}
													</Text>
												)}
											</figure>
										))}
									</div>
								</Stack>
							)}

							{/* ── Tags (optional) ──────────────────────────────────── */}
							{rendered.tags && rendered.tags.length > 0 && (
								<Group gap={6}>
									{rendered.tags.map((tag) => (
										<Badge
											key={tag}
											variant="light"
											color="gray"
											radius="sm"
											tt="none"
										>
											{tag}
										</Badge>
									))}
								</Group>
							)}

							{/* ── Links (optional) ─────────────────────────────────── */}
							{rendered.links && rendered.links.length > 0 && (
								<>
									<Divider />
									<Group gap={10}>
										{rendered.links.map((link, i) => (
											<LinkButton key={link.href} link={link} primary={i === 0} />
										))}
									</Group>
								</>
							)}
						</Stack>
					</Box>
				</Box>
			)}
		</Modal>
	);
}
