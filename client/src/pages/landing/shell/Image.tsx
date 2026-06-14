import { Box, Image as MantineImage, Stack, Text, useMantineTheme } from "@mantine/core";

interface LandingImageProps {
	src: string;
	alt: string;
	caption?: string;
	rounded?: "none" | "sm" | "md" | "lg";
	shadow?: boolean;
	maxWidth?: number;
	align?: "left" | "center" | "right";
	fit?: "cover" | "contain";
	height?: number | string;
}

const radiusMap = { none: 0, sm: 8, md: 12, lg: 18 };

/**
 * Inline image block with optional caption. Use for body imagery between
 * sections. For backgrounds inside Hero, pass the `image` prop on Hero instead.
 */
export default function LandingImage({
	src,
	alt,
	caption,
	rounded = "md",
	shadow = true,
	maxWidth,
	align = "center",
	fit = "cover",
	height,
}: LandingImageProps) {
	const T = useMantineTheme().colors;
	const margin =
		align === "center"
			? { marginLeft: "auto", marginRight: "auto" }
			: align === "right"
				? { marginLeft: "auto" }
				: { marginRight: "auto" };

	return (
		<Stack
			gap={8}
			my={24}
			style={{
				maxWidth,
				...margin,
			}}
		>
			<Box
				style={{
					borderRadius: radiusMap[rounded],
					overflow: "hidden",
					boxShadow: shadow
						? "0 10px 30px rgba(45, 25, 95, 0.10), 0 2px 6px rgba(45, 25, 95, 0.04)"
						: "none",
					border: `1px solid ${T.gray[1]}`,
				}}
			>
				<MantineImage
					src={src}
					alt={alt}
					fit={fit}
					h={height}
					radius={0}
				/>
			</Box>
			{caption && (
				<Text size="xs" c="gray.6" ta={align} fs="italic">
					{caption}
				</Text>
			)}
		</Stack>
	);
}
