import {
	ActionIcon,
	Box,
	Container,
	Flex,
	Group,
	Stack,
	Text,
	Tooltip,
	useMantineTheme,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { type ReactNode, useEffect } from "react";
import Logo from "@/components/logo/Logo";
import GradientDivider from "@/components/gradientDivider/GradientDivider";

interface LandingPageShellProps {
	title: string;
	maxWidth?: number;
	background?: string;
	children: ReactNode;
}

/**
 * Outer wrapper for landing pages. No planner nav — full canvas with a refined
 * brochure-style header: floating back arrow on the left, the HG logo + wordmark
 * centered, and a violet gradient divider below. Sets the browser tab title
 * from the page's `meta.title` so marketing doesn't have to remember.
 */
export default function LandingPageShell({
	title,
	maxWidth = 960,
	background = "#fbfafe",
	children,
}: LandingPageShellProps) {
	const T = useMantineTheme().colors;

	useEffect(() => {
		if (title) document.title = `${title} · Hakim Group`;
	}, [title]);

	return (
		<Box
			mih="100vh"
			style={{
				background: `radial-gradient(circle at 0% 0%, ${T.violet[0]} 0%, transparent 35%),
				             radial-gradient(circle at 100% 0%, ${T.blue[0]} 0%, transparent 30%),
				             ${background}`,
			}}
		>
			{/* Refined sticky header — back affordance + brand mark + balance spacer */}
			<Box
				style={{
					position: "sticky",
					top: 0,
					zIndex: 10,
					backdropFilter: "blur(12px)",
					WebkitBackdropFilter: "blur(12px)",
					background: "rgba(255, 255, 255, 0.72)",
				}}
			>
				<Container size={1180} px="lg">
					<Flex justify="space-between" align="center" py={14}>
						{/* Left — back affordance */}
						<Box style={{ flex: 1 }}>
							<Tooltip
								label="Back to planner"
								withArrow
								position="bottom-start"
							>
								<ActionIcon
									component={Link}
									to="/dashboard"
									variant="subtle"
									color="violet"
									radius={10}
									size="lg"
									aria-label="Back to planner"
								>
									<IconArrowLeft size={18} />
								</ActionIcon>
							</Tooltip>
						</Box>

						{/* Center — wordmark + logo */}
						<Link
							to="/dashboard"
							style={{ textDecoration: "none", flex: "0 0 auto" }}
						>
							<Group gap={10} align="center">
								<Logo isSmall />
								<Stack gap={0} align="flex-start">
									<Text
										fw={800}
										size="sm"
										c="gray.9"
										style={{ lineHeight: 1.1 }}
									>
										Hakim Group
									</Text>
									<Text
										size="xs"
										c="violet.7"
										fw={700}
										tt="uppercase"
										style={{ letterSpacing: 1.2, lineHeight: 1.1 }}
									>
										Planner
									</Text>
								</Stack>
							</Group>
						</Link>

						{/* Right — balance spacer keeps the wordmark visually centered */}
						<Box style={{ flex: 1 }} />
					</Flex>
				</Container>

				<GradientDivider />
			</Box>

			<Container size={maxWidth} px="lg" py={56}>
				{children}
			</Container>
		</Box>
	);
}
