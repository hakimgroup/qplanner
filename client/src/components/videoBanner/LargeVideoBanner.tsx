import {
	ActionIcon,
	AspectRatio,
	Box,
	Button,
	Card,
	Center,
	Flex,
	Grid,
	Stack,
	Text,
	useMantineTheme,
} from "@mantine/core";
import cl from "./videoBanner.module.scss";
import {
	IconPlayerPlay,
	IconPlayerPlayFilled,
	IconX,
} from "@tabler/icons-react";
import StyledButton from "../styledButton/StyledButton";
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "@/shared/shared.models";

const LargeVideoBanner = ({ closeBanner }) => {
	const C = useMantineTheme().colors;
	const navigate = useNavigate();

	return (
		<Card className={cl["large-video-banner"]} radius={10} p={25} mt={15}>
			<ActionIcon
				className={cl["close-icon"]}
				variant="subtle"
				size="lg"
				radius={10}
				color="violet"
				onClick={closeBanner}
			>
				<IconX size={18} stroke={3} />
			</ActionIcon>

			<Grid gutter={30} className={cl["video-grid"]}>
				<Grid.Col span={6}>
					<Stack gap={0}>
						<Text
							fz={"h2"}
							fw={700}
							variant="gradient"
							gradient={{ from: "blue.3", to: "red.4", deg: 180 }}
						>
							Welcome To Marketing Planner
						</Text>
						<Text size="md" c="blue.9" opacity={0.65}>
							We can see there isn't anything currently populated
							on your planner. Please watch the tutorial to learn
							how to add campaigns and complete the process — or,
							if you'd rather read, click through to{" "}
							<Text span fw={700}>
								FAQs and 'How to use the portal'.
							</Text>
						</Text>

						<Flex gap={10} align="center" mt={20}>
							<Button
								leftSection={<IconPlayerPlay size={14} />}
								fullWidth
							>
								Watch Tutorial
							</Button>

							<StyledButton
								fullWidth
								onClick={() => navigate(AppRoutes.FAQs)}
							>
								FAQs + User Guide
							</StyledButton>
						</Flex>
					</Stack>
				</Grid.Col>

				<Grid.Col span={6} className={cl["right-section"]}>
					<AspectRatio ratio={16 / 9} w="100%">
						<Box className={cl.thumbnail}>
							<Center className={cl.play}>
								<IconPlayerPlayFilled
									size={30}
									color={C.violet[9]}
								/>
							</Center>
						</Box>
					</AspectRatio>
				</Grid.Col>
			</Grid>
		</Card>
	);
};

export default LargeVideoBanner;
