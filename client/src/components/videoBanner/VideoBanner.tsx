import {
	ActionIcon,
	Button,
	Card,
	Flex,
	Group,
	Text,
	useMantineTheme,
} from "@mantine/core";
import { IconPlayerPlay, IconX } from "@tabler/icons-react";
import cl from "./videoBanner.module.scss";

const VideoBanner = () => {
	const T = useMantineTheme();
	return (
		<Card radius={10} className={cl["video-banner"]}>
			<Group align="center" justify="space-between">
				<Flex align="center" justify="space-between" gap={10}>
					<IconPlayerPlay size={18} color={T.colors.blue[4]} />
					<Text size="sm">
						<Text span fw={600}>
							New Planner
						</Text>{" "}
						- watch a 60-second walkthrough to get started
					</Text>
				</Flex>

				<Flex align="center" justify="space-between" gap={5}>
					<Button color="blue.3" radius={10}>
						Watch Tutorial
					</Button>

					<ActionIcon
						variant="subtle"
						size="lg"
						radius={10}
						color="violet"
						onClick={() => {}}
					>
						<IconX size={14} />
					</ActionIcon>
				</Flex>
			</Group>
		</Card>
	);
};

export default VideoBanner;
