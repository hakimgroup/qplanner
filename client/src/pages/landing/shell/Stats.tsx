import { Box, SimpleGrid, Stack, Text, Title, useMantineTheme } from "@mantine/core";

interface StatItem {
	value: string;
	label: string;
	hint?: string;
}

interface StatsProps {
	items: StatItem[];
	background?: string;
}

/**
 * Row of proof-point numbers. Drop above the CTA for a "by the numbers" feel.
 * Keep to 2–4 items — more than that and the grid gets cramped.
 */
export default function Stats({ items, background }: StatsProps) {
	const T = useMantineTheme().colors;
	const bg =
		background ?? `linear-gradient(135deg, ${T.violet[0]} 0%, ${T.gray[0]} 100%)`;

	return (
		<Box
			py="xl"
			px="lg"
			my={32}
			style={{
				background: bg,
				border: `1px solid ${T.violet[1]}`,
				borderRadius: 16,
			}}
		>
			<SimpleGrid
				cols={{ base: 1, xs: 2, sm: items.length > 3 ? 4 : items.length }}
				spacing="xl"
			>
				{items.map((item, i) => (
					<Stack key={i} gap={4} align="center" ta="center">
						<Title
							order={2}
							c="violet.7"
							style={{ fontSize: 36, lineHeight: 1.05, letterSpacing: -0.5 }}
						>
							{item.value}
						</Title>
						<Text size="sm" fw={700} c="gray.9" tt="uppercase" lts={0.6}>
							{item.label}
						</Text>
						{item.hint && (
							<Text size="xs" c="gray.6">
								{item.hint}
							</Text>
						)}
					</Stack>
				))}
			</SimpleGrid>
		</Box>
	);
}
