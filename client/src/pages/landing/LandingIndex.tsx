import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Card,
	Container,
	Flex,
	Group,
	SimpleGrid,
	Stack,
	Text,
	Title,
	Tooltip,
	useMantineTheme,
} from "@mantine/core";
import { IconArrowRight, IconCopy, IconLink } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { format } from "date-fns";
import { listLandingPages, type LandingPageEntry } from "./registry";
import GradientDivider from "@/components/gradientDivider/GradientDivider";
import Logo from "@/components/logo/Logo";
import { toast } from "sonner";

export default function LandingIndex() {
	const T = useMantineTheme().colors;
	const pages = useMemo(() => listLandingPages(), []);
	const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

	const copyLink = async (slug: string) => {
		const url = `${baseUrl}/landing/${slug}`;
		try {
			await navigator.clipboard.writeText(url);
			toast.success("Link copied to clipboard");
		} catch {
			toast.error("Could not copy link");
		}
	};

	return (
		<Box
			mih="calc(100vh - 80px)"
			style={{
				background: `radial-gradient(circle at 0% 0%, ${T.violet[0]} 0%, transparent 35%),
				             radial-gradient(circle at 100% 0%, ${T.blue[0]} 0%, transparent 30%),
				             #fbfafe`,
			}}
		>
			<Container size={1180} py={48} px="lg">
				<Stack gap={36}>
					{/* Brand-aware header */}
					<Stack align="center" gap={16} ta="center">
						<Logo />
						<Stack gap={6} maw={620}>
							<Title
								order={1}
								c="gray.9"
								style={{ fontSize: 38, lineHeight: 1.15, letterSpacing: -0.5 }}
							>
								Landing Pages
							</Title>
							<Text size="md" c="gray.6">
								Shareable, branded pages that sit behind your sign-in.
								Drop a link into a campaign email and the recipient
								lands here ready to act.
							</Text>
						</Stack>
					</Stack>

					<GradientDivider />

					{/* Pages grid */}
					<SimpleGrid
						cols={{ base: 1, sm: 2, md: 3 }}
						spacing="lg"
						verticalSpacing="lg"
					>
						{pages.map((entry) => (
							<LandingPageCard
								key={entry.meta.slug}
								meta={entry.meta}
								thumbnail={entry.thumbnail}
								onCopy={() => copyLink(entry.meta.slug)}
							/>
						))}
					</SimpleGrid>
				</Stack>
			</Container>
		</Box>
	);
}

interface LandingPageCardProps {
	meta: LandingPageEntry["meta"];
	thumbnail: string | null;
	onCopy: () => void;
}

function LandingPageCard({ meta, thumbnail, onCopy }: LandingPageCardProps) {
	const T = useMantineTheme().colors;

	const headerHeight = 140;
	const gradientHeader = (
		<>
			<Box
				style={{
					position: "absolute",
					inset: 0,
					background: `linear-gradient(135deg, ${T.violet[5]} 0%, ${T.blue[5]} 100%)`,
				}}
			/>
			<Box
				style={{
					position: "absolute",
					inset: 0,
					background: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.18) 0%, transparent 60%),
					             radial-gradient(circle at 80% 50%, rgba(255,255,255,0.12) 0%, transparent 60%)`,
				}}
			/>
		</>
	);

	const imageHeader = thumbnail && (
		<>
			<Box
				style={{
					position: "absolute",
					inset: 0,
					backgroundImage: `url(${thumbnail})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			/>
			{/* Bottom-up scrim keeps the date badge readable on any image. */}
			<Box
				style={{
					position: "absolute",
					inset: 0,
					background:
						"linear-gradient(180deg, rgba(0,0,0,0.0) 35%, rgba(0,0,0,0.35) 100%)",
				}}
			/>
		</>
	);

	return (
		<Card
			radius={16}
			p={0}
			shadow="sm"
			style={{
				border: `1px solid ${T.violet[1]}`,
				background: "#fff",
				display: "flex",
				flexDirection: "column",
				overflow: "hidden",
				transition: "transform 140ms ease, box-shadow 140ms ease",
			}}
		>
			{/* Card header: thumbnail if the page has one, otherwise gradient. */}
			<Box
				style={{
					height: headerHeight,
					position: "relative",
				}}
			>
				{thumbnail ? imageHeader : gradientHeader}
				{meta.publishedAt && (
					<Badge
						variant="white"
						color="violet"
						radius="sm"
						size="sm"
						style={{
							position: "absolute",
							top: 12,
							right: 12,
							boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
						}}
					>
						{format(new Date(meta.publishedAt), "d MMM yyyy")}
					</Badge>
				)}
			</Box>

			<Stack gap={12} p="lg" style={{ flex: 1 }}>
				<Stack gap={6}>
					<Title order={3} c="gray.9" style={{ fontSize: 18, lineHeight: 1.3 }}>
						{meta.title}
					</Title>
					<Text size="sm" c="gray.6" lineClamp={3}>
						{meta.description}
					</Text>
				</Stack>

				<Group
					gap={6}
					align="center"
					mt={4}
					style={{
						color: T.violet[7],
						fontSize: 12,
						fontWeight: 600,
					}}
				>
					<IconLink size={12} />
					<Text size="xs" c="violet.7" fw={600} truncate>
						/landing/{meta.slug}
					</Text>
				</Group>
			</Stack>

			<Flex
				gap={8}
				px="lg"
				py="md"
				style={{ borderTop: `1px solid ${T.gray[1]}`, background: T.gray[0] }}
				justify="space-between"
				align="center"
			>
				<Tooltip label="Copy link" withArrow>
					<ActionIcon
						variant="subtle"
						color="violet"
						radius={10}
						size="lg"
						onClick={onCopy}
						aria-label="Copy link"
					>
						<IconCopy size={16} />
					</ActionIcon>
				</Tooltip>
				<Button
					component={Link}
					to={`/landing/${meta.slug}`}
					size="sm"
					radius={10}
					color="violet"
					rightSection={<IconArrowRight size={14} />}
				>
					Open page
				</Button>
			</Flex>
		</Card>
	);
}
