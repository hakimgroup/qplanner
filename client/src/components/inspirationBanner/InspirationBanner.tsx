import {
	ActionIcon,
	Box,
	Card,
	Grid,
	Group,
	SimpleGrid,
	Stack,
	Text,
	useMantineTheme,
} from "@mantine/core";
import { IconArrowUpRight } from "@tabler/icons-react";

interface InspirationLink {
	title: string;
	description: string;
	/** In-app landing route (opened in a new tab). */
	href: string;
}

/**
 * Seasonal "inspiration" banner shown above the campaign tabs — surfaces the
 * current landing-page highlights. Always visible (not dismissible); it replaces
 * the dismissible tutorial video banner in that slot.
 *
 * To change what's featured, edit LINKS below (title/description/href).
 */
const HEADING = "Here's your Q4 Inspiration";

const LINKS: InspirationLink[] = [
	{
		title: "Festive toolkit",
		description:
			"Everything you need to make December work harder — and to carry that into a quiet January.",
		href: "/landing/festive-toolkit",
	},
	{
		title: "Unlock your practice potential",
		description:
			"Discover campaigns designed to help your practice connect, engage and grow.",
		href: "/landing/q4-campaigns",
	},
];

export default function InspirationBanner() {
	const T = useMantineTheme().colors;

	const openLink = (href: string) => {
		window.open(href, "_blank", "noopener,noreferrer");
	};

	return (
		<Card
			radius={10}
			p={25}
			mt={15}
			style={{
				background: `linear-gradient(135deg, ${T.violet[0]} 0%, ${T.blue[0]} 100%)`,
				border: `1px solid ${T.violet[1]}`,
			}}
		>
			<Grid gutter={24} align="center">
				<Grid.Col span={{ base: 12, md: 4 }}>
					<Text
						fz={{ base: "h3", md: "h2" }}
						fw={700}
						lh={1.2}
						c="gray.9"
					>
						{HEADING}
					</Text>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 8 }}>
					<SimpleGrid cols={{ base: 1, sm: 2 }} spacing={16}>
						{LINKS.map((link) => (
							<Card
								key={link.href}
								radius={10}
								p="md"
								withBorder
								onClick={() => openLink(link.href)}
								role="link"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") openLink(link.href);
								}}
								style={{
									cursor: "pointer",
									backgroundColor: "white",
									borderColor: T.gray[2],
									transition:
										"transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease",
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.transform = "translateY(-2px)";
									e.currentTarget.style.boxShadow =
										"0 4px 14px rgba(57,58,166,0.12)";
									e.currentTarget.style.borderColor = T.violet[3];
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.transform = "none";
									e.currentTarget.style.boxShadow = "none";
									e.currentTarget.style.borderColor = T.gray[2];
								}}
							>
								<Group justify="space-between" align="flex-start" wrap="nowrap" gap={10}>
									<Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
										<Text fw={700} size="sm" c="gray.9">
											{link.title}
										</Text>
										<Text size="xs" c="gray.6" lh={1.4}>
											{link.description}
										</Text>
									</Stack>
									<ActionIcon
										variant="light"
										color="violet"
										radius="xl"
										size="md"
										aria-label={`Open ${link.title}`}
										style={{ flexShrink: 0 }}
										onClick={(e) => {
											e.stopPropagation();
											openLink(link.href);
										}}
									>
										<IconArrowUpRight size={16} />
									</ActionIcon>
								</Group>
							</Card>
						))}
					</SimpleGrid>
				</Grid.Col>
			</Grid>
			<Box />
		</Card>
	);
}
