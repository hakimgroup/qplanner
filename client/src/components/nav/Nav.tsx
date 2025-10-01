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
	IconUserShield,
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
import { signOutSafe } from "@/api/auth";
import { startCase } from "lodash";
import { userRoleColors } from "@/shared/shared.const";

const Nav = () => {
	const T = useMantineTheme();
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { user, isAdmin, role } = useAuth();
	const name = `${user?.identities[0].identity_data.first_name} ${user?.identities[0].identity_data.last_name}`;
	const isUserView = [AppRoutes.Dashboard, AppRoutes.FAQs].includes(
		pathname as any
	);
	const { title, description } = useNavPreset();
	const notDashboard = ![AppRoutes.Dashboard, AppRoutes.Admin].includes(
		pathname as any
	);

	//Components
	const AdminNavigate = () => (
		<Button
			color="violet"
			variant="light"
			size="xs"
			fw={700}
			leftSection={<IconUserShield size={14} stroke={3} />}
			onClick={() => {
				if (!isUserView) {
					navigate(AppRoutes.Dashboard);
				} else {
					navigate(AppRoutes.Admin);
				}
			}}
		>
			{isUserView ? "Admin" : "User"} View
		</Button>
	);

	return (
		<nav className={cl.nav}>
			<Flex justify={"space-between"} align={"center"}>
				<Flex align={"center"} gap={15}>
					{notDashboard && (
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

					{pathname === AppRoutes.Dashboard && (
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

				{isUserView && (
					<Flex align={"center"} gap={15}>
						{isAdmin && <AdminNavigate />}

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
								<Notification />

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
							onClick={() => signOutSafe()}
						>
							Logout
						</Button>
					</Flex>
				)}

				{isAdmin && !isUserView && (
					<Group gap={30}>
						<AdminNavigate />
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
										<Badge color={userRoleColors[role]}>
											{startCase(role)}
										</Badge>
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
									onClick={() => signOutSafe()}
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
