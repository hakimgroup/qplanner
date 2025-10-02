import {
	Badge,
	BadgeVariant,
	Flex,
	Stack,
	Text,
	Tooltip,
	useMantineTheme,
} from "@mantine/core";
import { startCase } from "lodash";

interface BadgeListProps {
	items: string[];
	firstBadgeColor?: string;
	firstBadgeTextColor?: string;
	firstBadgeVariant?: BadgeVariant;
	moreTextColor?: string;
	moreBadgeBorderColor?: string;
	moreBadgeBgColor?: string;
	maxDisplay?: number;
}

export const BadgeList: React.FC<BadgeListProps> = ({
	items,
	firstBadgeColor = "red.4",
	firstBadgeVariant = "filled",
	firstBadgeTextColor = "white",
	moreTextColor = "blue.3",
	moreBadgeBgColor = "blue.0",
	maxDisplay = 1,
}) => {
	// If no items, render a hyphen
	if (!Array.isArray(items) || items.length === 0) {
		return <Text size="xs">-</Text>;
	}

	const C = useMantineTheme().colors;

	// Show up to maxDisplay badges
	const visible = items.slice(0, maxDisplay);
	const remaining = items.slice(maxDisplay);

	return (
		<Flex gap={5} wrap="wrap" align="center">
			{visible.map((item) => (
				<Badge
					key={item}
					color={firstBadgeColor}
					variant={firstBadgeVariant}
				>
					<Text size="xs" fw={500} c={firstBadgeTextColor}>
						{startCase(item)}
					</Text>
				</Badge>
			))}

			{remaining.length > 0 && (
				<Tooltip
					style={{ border: `1px solid ${C.blue[1]}` }}
					bg={moreBadgeBgColor}
					label={
						<Stack gap={2}>
							{remaining.map((item) => (
								<Text key={item} size="xs" fw={500} c="gray.9">
									{startCase(item)}
								</Text>
							))}
						</Stack>
					}
					withArrow
				>
					<Text
						size="xs"
						fw={600}
						c={moreTextColor}
						style={{ cursor: "pointer" }}
					>
						+{remaining.length} more
					</Text>
				</Tooltip>
			)}
		</Flex>
	);
};
