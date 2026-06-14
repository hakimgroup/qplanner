import { Badge, Box, Image, Stack, Text, Title, useMantineTheme } from "@mantine/core";
import { type ReactNode } from "react";

interface HeroProps {
	eyebrow?: string;
	headline: string;
	subheadline?: string;
	image?: string;
	imageAlt?: string;
	children?: ReactNode;
	background?: string;
}

/**
 * Big top section for landing pages. Eyebrow → headline → subheadline → optional
 * CTA row → optional background image. Keeps the design floor consistent across
 * pages without forcing it — pages can skip the Hero entirely and roll their own.
 */
export default function Hero({
	eyebrow,
	headline,
	subheadline,
	image,
	imageAlt,
	children,
	background,
}: HeroProps) {
	const T = useMantineTheme().colors;
	const bg =
		background ??
		`linear-gradient(135deg, ${T.blue[0]} 0%, ${T.violet[0]} 100%)`;

	return (
		<Box
			py={56}
			px="xl"
			mb={32}
			style={{
				background: bg,
				border: `1px solid ${T.violet[1]}`,
				borderRadius: 16,
				textAlign: "center",
			}}
		>
			<Stack align="center" gap={16}>
				{eyebrow && (
					<Badge variant="filled" color="violet" radius="sm" tt="uppercase">
						{eyebrow}
					</Badge>
				)}
				<Title order={1} c="gray.9" style={{ fontSize: 40, lineHeight: 1.15 }}>
					{headline}
				</Title>
				{subheadline && (
					<Text size="lg" c="gray.7" maw={640}>
						{subheadline}
					</Text>
				)}
				{children && <Box mt={8}>{children}</Box>}
				{image && (
					<Box mt={24} style={{ maxWidth: 720, width: "100%" }}>
						<Image
							src={image}
							alt={imageAlt ?? headline}
							radius="md"
							fit="cover"
						/>
					</Box>
				)}
			</Stack>
		</Box>
	);
}
