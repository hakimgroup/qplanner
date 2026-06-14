import { Box, Stack, Text, Title, useMantineTheme } from "@mantine/core";
import { type ReactNode } from "react";

interface CardProps {
	title?: string;
	icon?: ReactNode;
	accent?: "violet" | "blue" | "teal" | "gray" | "red" | "green";
	children: ReactNode;
}

/**
 * Reusable info card for feature highlights, bullet groups, etc. Often used
 * inside a grid in a Section.
 */
export default function Card({
	title,
	icon,
	accent = "violet",
	children,
}: CardProps) {
	const T = useMantineTheme().colors;
	const palette = (T as any)[accent] ?? T.violet;

	return (
		<Box
			p="lg"
			style={{
				border: `1px solid ${palette[1]}`,
				background: palette[0],
				borderRadius: 12,
				height: "100%",
			}}
		>
			<Stack gap={10}>
				{(icon || title) && (
					<Stack gap={6}>
						{icon && <Box style={{ color: palette[6] }}>{icon}</Box>}
						{title && (
							<Title order={4} c="gray.9" style={{ fontSize: 16 }}>
								{title}
							</Title>
						)}
					</Stack>
				)}
				<Text size="sm" c="gray.7">
					{children}
				</Text>
			</Stack>
		</Box>
	);
}
