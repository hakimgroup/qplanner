import { Box, Button, Stack, Text, Title, useMantineTheme } from "@mantine/core";
import { IconArrowRight, IconSparkles } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import type { LandingPageMeta } from "../registry";

/**
 * This page intentionally does NOT use the shell. It's a freeform escape hatch
 * for when marketing needs a fully bespoke layout (microsites, takeover hero,
 * etc.). Anything Mantine + React supports is fair game.
 */
export const meta: LandingPageMeta = {
	slug: "custom-example",
	title: "Custom Example — Freeform Page",
	description:
		"Reference for a fully-custom landing page that bypasses the shell. Use this pattern when marketing needs a one-off bespoke layout.",
	publishedAt: "2026-06-14",
	// Kept in the registry as a code reference for marketing/dev, but hidden
	// from the public-facing /landing index.
	hidden: true,
};

export default function CustomExample() {
	const T = useMantineTheme().colors;
	return (
		<Box
			mih="100vh"
			style={{
				background: `radial-gradient(circle at 20% 0%, ${T.violet[1]} 0%, transparent 45%),
				             radial-gradient(circle at 100% 100%, ${T.blue[1]} 0%, transparent 55%),
				             ${T.gray[0]}`,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: 32,
			}}
		>
			<Stack
				align="center"
				gap="lg"
				maw={640}
				ta="center"
				p="xl"
				style={{
					background: "white",
					borderRadius: 16,
					border: `1px solid ${T.violet[1]}`,
					boxShadow: "0 8px 32px rgba(123, 46, 218, 0.08)",
				}}
			>
				<Box
					style={{
						background: T.violet[0],
						borderRadius: 999,
						padding: 14,
						color: T.violet[6],
					}}
				>
					<IconSparkles size={32} />
				</Box>

				<Stack gap={8}>
					<Title order={1} c="gray.9" style={{ fontSize: 32, lineHeight: 1.2 }}>
						This page rolls its own layout.
					</Title>
					<Text size="md" c="gray.6">
						No shell, no hero component — just plain React and Mantine. Use
						this pattern when marketing needs a fully bespoke design that
						doesn't fit the standard template.
					</Text>
				</Stack>

				<Button
					component={Link}
					to="/landing"
					size="md"
					radius={10}
					color="violet"
					rightSection={<IconArrowRight size={16} />}
				>
					Back to landing pages
				</Button>

				<Text size="xs" c="gray.5" mt="sm">
					Logged-in via the planner's Microsoft sign-in · planner.hakimgroup.co.uk
				</Text>
			</Stack>
		</Box>
	);
}
