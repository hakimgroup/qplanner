import { Box, useMantineTheme, Text, Group } from "@mantine/core";

interface Props {
	/** Optional centered label */
	label?: React.ReactNode;
	/** Top + bottom margin (horizontal) or left + right margin (vertical) */
	my?: number | string;
	mt?: number | string;
	mb?: number | string;
	/** Vertical orientation — use inside Flex/Group containers with a defined height */
	orientation?: "horizontal" | "vertical";
	/** Custom height for vertical orientation (default: "100%") */
	h?: number | string;
	/** Optional flex value when used inside flex containers */
	flex?: number | string;
}

/**
 * Faded violet gradient divider used app-wide.
 *
 * Horizontal: a 1px line that fades from transparent to violet[3] and back.
 * Vertical:   a 1px column that fades top-to-bottom.
 * With label: line — UPPERCASE LABEL — line, all in violet[7].
 */
export default function GradientDivider({
	label,
	my,
	mt,
	mb,
	orientation = "horizontal",
	h = "100%",
	flex,
}: Props) {
	const T = useMantineTheme().colors;

	if (orientation === "vertical") {
		return (
			<Box
				style={{
					width: 1,
					height: h,
					background: `linear-gradient(to bottom, transparent, ${T.violet[3]}, transparent)`,
					marginTop: mt,
					marginBottom: mb,
					flex,
				}}
			/>
		);
	}

	const line = (
		<Box
			style={{
				flex: 1,
				height: 1,
				background: `linear-gradient(to right, transparent, ${T.violet[3]}, transparent)`,
			}}
		/>
	);

	if (!label) {
		return (
			<Box
				style={{
					marginTop: mt ?? my,
					marginBottom: mb ?? my,
					flex,
				}}
			>
				<Box
					style={{
						height: 1,
						background: `linear-gradient(to right, transparent, ${T.violet[3]}, transparent)`,
					}}
				/>
			</Box>
		);
	}

	return (
		<Group
			gap="xs"
			align="center"
			wrap="nowrap"
			style={{
				marginTop: mt ?? my,
				marginBottom: mb ?? my,
			}}
		>
			{line}
			<Text
				size="xs"
				c="violet.7"
				fw={600}
				tt="uppercase"
				style={{ letterSpacing: 0.6 }}
			>
				{label}
			</Text>
			{line}
		</Group>
	);
}
