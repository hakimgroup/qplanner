import {
	ActionIcon,
	Badge,
	Card,
	Divider,
	Flex,
	Indicator,
	Menu,
	Modal,
	Stack,
	Text,
	useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBell, IconCircleCheck, IconFileText } from "@tabler/icons-react";
import SingleNotification from "./SingleNotification";
import StyledButton from "../styledButton/StyledButton";
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "@/shared/shared.models";

const Notification = () => {
	const T = useMantineTheme();
	const navigate = useNavigate();
	const [opened, { open, close }] = useDisclosure(false);

	const notifications = [
		{
			name: "Spring Frame Launch Campaign",
			requested: [
				"Social media graphics",
				"Email templates",
				"In-store displays",
			],
			from: "john.doe@practice.com",
		},
		{
			name: "Children's Eye Health Awareness",
			requested: [
				"Parent information leaflets",
				"School presentation materials",
				"Social media graphics",
			],
			from: "sarah.smith@practice.com",
		},
	];

	return (
		<>
			<Indicator
				inline
				label="5"
				size={19}
				color="red"
				offset={5}
				disabled
			>
				<ActionIcon
					variant="subtle"
					size="lg"
					radius={10}
					color="violet"
					onClick={() => navigate(AppRoutes.NotificationsCenter)}
				>
					<IconBell color={T.colors.gray[9]} size={18} />
				</ActionIcon>
			</Indicator>

			{/* <Menu shadow="md" width={320} position="bottom-end">
				<Menu.Target>
					<Indicator
						inline
						label="5"
						size={19}
						color="red"
						offset={5}
					>
						<ActionIcon
							variant="subtle"
							size="lg"
							radius={10}
							color="violet"
						>
							<IconBell color={T.colors.gray[9]} size={18} />
						</ActionIcon>
					</Indicator>
				</Menu.Target>

				<Menu.Dropdown>
					<Menu.Label>
						<Flex
							align={"center"}
							justify={"space-between"}
							pt={5}
							pb={10}
						>
							<Text fw={700} size="md" c={"gray.9"}>
								Notifications
							</Text>
							<Badge color="red.4">5 new</Badge>
						</Flex>
					</Menu.Label>

					{notifications.map((n, i) => (
						<Menu.Item key={i} onClick={open}>
							<Card bg={"transparent"} p={10} w={"inherit"}>
								<Flex gap={8}>
									<IconFileText
										size={18}
										color={T.colors.blue[3]}
									/>

									<Stack w={"100%"} gap={5}>
										<Flex
											justify={"space-between"}
											w={"100%"}
										>
											<Text
												size="sm"
												fw={500}
												maw={150}
												mt={-3}
											>
												{n.name}
											</Text>
											<Badge color="red.6">
												<Text size="xs" fw={600} mt={2}>
													New
												</Text>
											</Badge>
										</Flex>

										<Text size="xs" c={"gray.7"}>
											Requested:{" "}
											{n.requested.map((r) => {
												return `${r}, `;
											})}
										</Text>

										<Text size="xs" c={"gray.7"}>
											By: {n.from}
										</Text>
									</Stack>
								</Flex>
							</Card>
						</Menu.Item>
					))}

					<Stack gap={8} mb={10} pl={15} pr={15}>
						<Divider size={"xs"} color="gray.1" mt={20} />
						<StyledButton fw={500} size="sm" fullWidth>
							View all notifications
						</StyledButton>
					</Stack>

					<Menu.Item mb={10} onClick={() => {}}>
						<Card bg={"transparent"} pt={2} pl={10} pb={2} pr={10}>
							<Flex gap={8} align={"center"}>
								<IconCircleCheck
									size={18}
									color={T.colors.gray[9]}
								/>

								<Text size="xs" fw={500}>
									Mark all as read
								</Text>
							</Flex>
						</Card>
					</Menu.Item>
				</Menu.Dropdown>
			</Menu> */}

			{/* Single Notification Pop-Up */}
			{/* <Modal
				opened={opened}
				onClose={close}
				title={
					<Text fz={"h4"} fw={600}>
						Acknowledge This Campaign Request
					</Text>
				}
				centered
				radius={10}
				size={"73rem"}
				overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
			>
				<SingleNotification />
			</Modal> */}
		</>
	);
};

export default Notification;
