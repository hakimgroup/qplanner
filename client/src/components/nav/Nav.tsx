import { useSignout } from "@/pages/auth/auth.hooks";
import { AppRoutes } from "@/shared/shared.models";
import {
	Avatar,
	Badge,
	Box,
	Button,
	Card,
	Divider,
	Flex,
	Group,
	Menu,
	Stack,
	Text,
	useMantineTheme,
} from "@mantine/core";
import {
	IconArrowLeft,
	IconDeviceFloppy,
	IconLogout,
	IconSettings,
	IconUser,
} from "@tabler/icons-react";
import cl from "./nav.module.scss";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/AuthProvider";
import Logo from "../logo/Logo";
import PracticeSelector from "../practiceSelector/PracticeSelector";
import Help from "../help/Help";
import Notification from "../notification/Notification";
import StyledButton from "../styledButton/StyledButton";
import { useNavPreset } from "@/shared/shared.hooks";

const Nav = () => {
	const T = useMantineTheme();
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { user, isAdmin } = useAuth();
	const name = `${user?.identities[0].identity_data.first_name} ${user?.identities[0].identity_data.last_name}`;

	//APIs
	const { mutate: signout } = useSignout();

	const { title, description } = useNavPreset();
	const notDashboard = pathname !== AppRoutes.Dashboard;

	return (
		<nav className={cl.nav}>
			<Flex justify={"space-between"} align={"center"}>
				<Flex align={"center"} gap={15}>
					{notDashboard && !isAdmin && (
						<>
							<StyledButton
								borderWidth={0}
								leftSection={<IconArrowLeft size={16} />}
								onClick={() => navigate(AppRoutes.Dashboard)}
							>
								Back to Planner
							</StyledButton>

							<Box h={"30px"}>
								<Divider
									size="xs"
									orientation="vertical"
									color="gray.1"
									h={"100%"}
								/>
							</Box>
						</>
					)}

					<Flex align={"center"} gap={12}>
						<Logo isSmall />
						<Box>
							<Text size="xl" fw={600} lh={"130%"}>
								{title}
							</Text>
							<Text size="xs" fw={500} c={"gray.7"} lh={"130%"}>
								{description}
							</Text>
						</Box>
					</Flex>

					{!notDashboard && (
						<>
							<Box h={"30px"}>
								<Divider
									size="xs"
									orientation="vertical"
									color="gray.1"
									h={"100%"}
								/>
							</Box>

							<PracticeSelector />
						</>
					)}
				</Flex>

				{!isAdmin && (
					<Flex align={"center"} gap={15}>
						<Badge
							variant="light"
							color="gray.6"
							size="lg"
							radius={10}
							p={17}
						>
							<Text size="xs" fw={600} c={"gray.9"}>
								{name}
							</Text>
						</Badge>

						{!notDashboard && (
							<>
								<Help />

								<StyledButton
									disabled
									leftSection={<IconDeviceFloppy size={18} />}
								>
									Save
								</StyledButton>
							</>
						)}

						<Button
							radius={10}
							variant="subtle"
							color="violet"
							c="gray.8"
							leftSection={<IconLogout size={18} />}
							onClick={() => signout()}
						>
							Logout
						</Button>
					</Flex>
				)}

				{isAdmin && (
					<Group gap={30}>
						<Notification />
						<Menu shadow="md" position="bottom-end">
							<Menu.Target>
								<Group gap={8} style={{ cursor: "pointer" }}>
									<Avatar
										name={name}
										size={"sm"}
										variant="filled"
										color="blue.3"
									/>
									<Stack gap={0}>
										<Text size="sm" fw={600}>
											{name}
										</Text>
										<Badge color="red.4">Admin</Badge>
									</Stack>
								</Group>
							</Menu.Target>

							<Menu.Dropdown>
								<Menu.Label>
									<Text fw={700} size="sm" c={"gray.9"}>
										My Account
									</Text>
								</Menu.Label>

								<Menu.Item
									onClick={() =>
										navigate(
											`${AppRoutes.Admin}/${AppRoutes.Settings}`
										)
									}
									leftSection={<IconUser size={14} />}
								>
									Profile Settings
								</Menu.Item>

								<Menu.Item
									onClick={() =>
										navigate(
											`${AppRoutes.Admin}/${AppRoutes.Help}`
										)
									}
									leftSection={<IconSettings size={14} />}
								>
									Help & SUpport
								</Menu.Item>

								<Menu.Item
									color="red"
									onClick={() => signout()}
									leftSection={<IconLogout size={14} />}
								>
									Logout
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
					</Group>
				)}
			</Flex>
		</nav>
	);
};

export default Nav;
