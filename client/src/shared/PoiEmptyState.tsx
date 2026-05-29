import { Button, Card, Stack, Text, useMantineTheme } from "@mantine/core";
import { IconStar } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { AppRoutes } from "@/shared/shared.models";

/**
 * Shown on admin screens when the global view mode is set to "My Practices of
 * Interest" but the user hasn't added any practices yet.
 */
export default function PoiEmptyState() {
	const T = useMantineTheme().colors;
	return (
		<Card
			p="xl"
			radius={10}
			style={{
				border: `1px solid ${T.violet[1]}`,
				background: `linear-gradient(135deg, ${T.blue[0]}, ${T.violet[0]})`,
				textAlign: "center",
			}}
			shadow="xs"
		>
			<Stack align="center" gap={12}>
				<IconStar size={36} color={T.violet[5]} stroke={1.5} />
				<Stack gap={2} maw={420}>
					<Text fw={700} size="md" c="violet.7">
						No Practices of Interest yet
					</Text>
					<Text size="sm" c="gray.7">
						You're viewing in "Mine" mode but haven't selected any practices.
						Add the ones you manage to start seeing scoped data here.
					</Text>
				</Stack>
				<Button
					component={Link}
					to={`${AppRoutes.Admin}/${AppRoutes.PracticesOfInterest}`}
					color="violet"
					radius={10}
					leftSection={<IconStar size={14} />}
				>
					Manage Practices of Interest
				</Button>
			</Stack>
		</Card>
	);
}
