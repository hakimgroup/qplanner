import {
	ActionIcon,
	Badge,
	Button,
	Card,
	Center,
	Divider,
	Drawer,
	Flex,
	Paper,
	Stack,
	Text,
	Title,
	useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
	IconCircleCheck,
	IconClockHour1,
	IconHelp,
	IconPlayerPlay,
} from "@tabler/icons-react";
import cl from "./help.module.scss";
import StyledButton from "../styledButton/StyledButton";

const Help = () => {
	const T = useMantineTheme();
	const [opened, { open, close }] = useDisclosure(false);

	const topics = [
		"Navigating between Plan catalogue and My selections",
		"Using filters to find the right campaigns",
		"Adding campaigns with date selection",
		"Managing campaigns in the Gantt view",
		"Using Quick and Guided Populate",
		"Creating bespoke campaigns",
	];

	return (
		<>
			<Drawer
				opened={opened}
				onClose={close}
				title={
					<Flex align={"center"} gap={10}>
						<IconPlayerPlay color={T.colors.blue[3]} size={21} />
						<Title order={4} fw={600}>
							Marketing Planner Tutorial
						</Title>
					</Flex>
				}
				position="right"
				offset={8}
				radius={10}
				overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
			>
				<Text size="sm" c="gray.7">
					Get started with a quick 60-second walkthrough of the new
					planner.
				</Text>

				<Card radius={10} className={cl["help-video-card"]}>
					<Center h={"inherit"} className={cl.content}>
						<Stack gap={8} align="center">
							<ActionIcon
								variant="light"
								size="input-xl"
								radius={100}
								color="violet"
								onClick={open}
							>
								<IconPlayerPlay
									color={T.colors.blue[3]}
									size={35}
								/>
							</ActionIcon>

							<Text size="sm" fw={500}>
								Tutorial Video
							</Text>

							<Badge
								size="md"
								color="red.4"
								style={{ textTransform: "unset" }}
							>
								<Flex align={"center"} gap={5}>
									<IconClockHour1 size={15} color="white" />
									<Text size="xs" fw={500} c={"white"}>
										60 seconds
									</Text>
								</Flex>
							</Badge>
						</Stack>
					</Center>
				</Card>

				<Stack mt={"lg"} gap={10}>
					<Text fw={600} size="sm">
						What you'll learn:
					</Text>

					<Stack gap={8}>
						{topics.map((t, i) => (
							<Flex align={"center"} gap={5} key={i}>
								<IconCircleCheck
									size={18}
									color={T.colors.lime[9]}
								/>
								<Text size="sm">{t}</Text>
							</Flex>
						))}
					</Stack>
				</Stack>

				<Divider color="gray.1" mt={30} />

				<Stack gap={8} mt={20}>
					<Button
						radius={10}
						color={"blue.3"}
						leftSection={<IconPlayerPlay size={14} />}
					>
						Watch Tutorial
					</Button>
					<StyledButton>Skip for now</StyledButton>
				</Stack>

				<Text size="xs" ta={"center"} c={"dimmed"} mt={15}>
					You can access this tutorial anytime from the Help menu
				</Text>
			</Drawer>

			<ActionIcon
				variant="subtle"
				size="lg"
				radius={10}
				color="violet"
				onClick={open}
			>
				<IconHelp color={T.colors.gray[9]} size={18} />
			</ActionIcon>
		</>
	);
};

export default Help;
