import { Box, Stack, Text, Title } from "@mantine/core";
import { type ReactNode } from "react";

interface SectionProps {
	eyebrow?: string;
	title?: string;
	subtitle?: string;
	children: ReactNode;
	background?: string;
	tightTop?: boolean;
}

/**
 * Body-content block. Optional eyebrow + title + subtitle header, then whatever
 * children pass through. Used between Hero and CTA on the standard shell.
 */
export default function Section({
	eyebrow,
	title,
	subtitle,
	children,
	background,
	tightTop = false,
}: SectionProps) {
	return (
		<Box
			py={tightTop ? 16 : 32}
			px={background ? "lg" : 0}
			mb={24}
			style={
				background
					? {
							background,
							borderRadius: 12,
						}
					: undefined
			}
		>
			<Stack gap={16}>
				{(eyebrow || title || subtitle) && (
					<Stack gap={6}>
						{eyebrow && (
							<Text
								size="xs"
								fw={700}
								c="violet.7"
								tt="uppercase"
								lts={0.6}
							>
								{eyebrow}
							</Text>
						)}
						{title && (
							<Title order={2} c="gray.9" style={{ fontSize: 26 }}>
								{title}
							</Title>
						)}
						{subtitle && (
							<Text size="sm" c="gray.7">
								{subtitle}
							</Text>
						)}
					</Stack>
				)}
				<Box>{children}</Box>
			</Stack>
		</Box>
	);
}
