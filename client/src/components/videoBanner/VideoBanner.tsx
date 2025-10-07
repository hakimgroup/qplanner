import {
	ActionIcon,
	Card,
	Flex,
	Group,
	Text,
	useMantineTheme,
} from "@mantine/core";
import { IconPlayerPlay, IconX } from "@tabler/icons-react";
import cl from "./videoBanner.module.scss";
import { VideoThumbnailModal } from "../videoPlayer/VideoThumbnailModal";

const VideoBanner = ({ onDismiss }) => {
	const T = useMantineTheme();

	return (
		<Card radius={10} className={cl["video-banner"]} mt={15}>
			<Group align="center" justify="space-between">
				<Flex align="center" justify="space-between" gap={5}>
					<IconPlayerPlay size={14} color={T.colors.blue[4]} />
					<Text size="sm">
						<Text
							span
							fw={700}
							variant="gradient"
							gradient={{ from: "blue.3", to: "red.4", deg: 180 }}
						>
							New Planner
						</Text>{" "}
						- watch a 60-second walkthrough to get started
					</Text>
				</Flex>

				<Flex align="center" justify="space-between" gap={5}>
					<VideoThumbnailModal useButton />

					<ActionIcon
						variant="subtle"
						size="lg"
						radius={10}
						color="violet"
						onClick={onDismiss}
					>
						<IconX size={14} />
					</ActionIcon>
				</Flex>
			</Group>
		</Card>
	);
};

export default VideoBanner;
