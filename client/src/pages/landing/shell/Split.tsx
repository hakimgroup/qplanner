import { Box, Image, SimpleGrid, Stack, useMantineTheme } from "@mantine/core";
import { type ReactNode } from "react";

interface SplitProps {
	image: string;
	imageAlt: string;
	imageSide?: "left" | "right";
	children: ReactNode;
	rounded?: "none" | "sm" | "md" | "lg";
	imageHeight?: number;
}

const radiusMap = { none: 0, sm: 8, md: 12, lg: 18 };

/**
 * Image + text side-by-side. Common landing-page pattern for narrative pages —
 * e.g. "Here's the campaign. Here's a photo of last year's run."
 *
 * On narrow viewports it collapses to a single column with the image on top.
 * Toggle `imageSide` to alternate left/right across the page.
 */
export default function Split({
	image,
	imageAlt,
	imageSide = "left",
	children,
	rounded = "md",
	imageHeight = 320,
}: SplitProps) {
	const T = useMantineTheme().colors;

	const imageBlock = (
		<Box
			style={{
				borderRadius: radiusMap[rounded],
				overflow: "hidden",
				boxShadow: "0 10px 30px rgba(45, 25, 95, 0.08)",
				border: `1px solid ${T.gray[1]}`,
			}}
		>
			<Image src={image} alt={imageAlt} fit="cover" h={imageHeight} radius={0} />
		</Box>
	);

	const textBlock = (
		<Stack gap={12} justify="center" style={{ height: "100%" }}>
			{children}
		</Stack>
	);

	const ordered =
		imageSide === "left"
			? [imageBlock, textBlock]
			: [textBlock, imageBlock];

	return (
		<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl" my={32} verticalSpacing="md">
			{ordered.map((node, i) => (
				<Box key={i}>{node}</Box>
			))}
		</SimpleGrid>
	);
}
