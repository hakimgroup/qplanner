import { AppRoutes } from "@/shared/shared.models";
import {
	Avatar,
	Badge,
	Box,
	Burger,
	Button,
	Divider,
	Drawer,
	Flex,
	Group,
	Menu,
	Stack,
	Text,
	useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
	IconArrowLeft,
	IconBell,
	IconHelp,
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
import { useBreakpoints, useNavPreset } from "@/shared/shared.hooks";
import { signOutSafe } from "@/api/auth";
import { startCase } from "lodash";
import { userRoleColors } from "@/shared/shared.const";
import { useSignout } from "@/pages/auth/auth.hooks";

const Nav = () => {
	const T = useMantineTheme();
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { user, isAdmin, role, firstName, lastName } = useAuth();
	const name = `${firstName ?? "User"} ${lastName ?? ""}`.trim();
	const isUserView = [
		AppRoutes.Dashboard,
		AppRoutes.FAQs,
		AppRoutes.NotificationsCenter,
	].includes(pathname as any);
	const { title, description } = useNavPreset();
	const notDashboard = ![AppRoutes.Dashboard, AppRoutes.Admin].includes(
		pathname as any
	);

	const { mutate: signout } = useSignout();
	const { isXs, isSm } = useBreakpoints();
	const isMobile = isXs || isSm;
	const [drawerOpen, { open: openDrawer, close: closeDrawer }] =
		useDisclosure(false);

	//Components
	const AdminNavigate = () => (
		<Button
			variant="gradient"
			gradient={{ from: "violet", to: "indigo", deg: 135 }}
			size="xs"
			fw={700}
			leftSection={<IconUserShield size={14} stroke={3} />}
			onClick={() => {
				closeDrawer();
				if (!isUserView) {
					navigate(AppRoutes.Dashboard);
				} else {
					navigate(AppRoutes.Admin);
				}
			}}
		>
			{isMobile
				? isUserView
					? "Admin"
					: "User"
				: isUserView
					? "Go To Admin View"
					: "Go To User View"}
		</Button>
	);

	/* ---- Mobile drawer menu content ---- */
	const MobileDrawerContent = () => (
		<Stack gap="md" p="md">
			<Group gap="sm">
				<Avatar name={name} size="md" variant="filled" color="blue.3" />
				<Box>
					<Text size="sm" fw={600}>
						{name}
					</Text>
					{role && (
						<Badge size="xs" color={userRoleColors[role]}>
							{startCase(role)}
						</Badge>
					)}
				</Box>
			</Group>

			<Divider />

			{isAdmin && <AdminNavigate />}

			<Button
				variant="subtle"
				color="gray"
				justify="start"
				leftSection={<IconBell size={16} />}
				onClick={() => {
					closeDrawer();
					navigate(AppRoutes.NotificationsCenter);
				}}
			>
				Notifications
			</Button>

			{isAdmin && (
				<Button
					variant="subtle"
					color="gray"
					justify="start"
					leftSection={<IconUser size={16} />}
					onClick={() => {
						closeDrawer();
						navigate(
							`${AppRoutes.Admin}/${AppRoutes.Settings}`
						);
					}}
				>
					Profile Settings
				</Button>
			)}

			<Button
				variant="subtle"
				color="gray"
				justify="start"
				leftSection={<IconHelp size={16} />}
				onClick={() => {
					closeDrawer();
					if (isAdmin && !isUserView) {
						navigate(`${AppRoutes.Admin}/${AppRoutes.Help}`);
					} else {
						navigate(AppRoutes.FAQs);
					}
				}}
			>
				Help & Support
			</Button>

			<Divider />

			<Button
				variant="subtle"
				color="red"
				justify="start"
				leftSection={<IconLogout size={16} />}
				onClick={() => {
					closeDrawer();
					isUserView ? signout() : signOutSafe();
				}}
			>
				Logout
			</Button>
		</Stack>
	);

	return (
		<>
			<nav className={cl.nav}>
				<Flex justify={"space-between"} align={"center"}>
					<Flex align={"center"} gap={isMobile ? 8 : 15}>
						{notDashboard && (
							<>
								<StyledButton
									borderWidth={0}
									leftSection={<IconArrowLeft size={16} />}
									onClick={() =>
										navigate(AppRoutes.Dashboard)
									}
								>
									{!isMobile && "Back to Planner"}
								</StyledButton>

								{!isMobile && (
									<Box h={"30px"}>
										<Divider
											size="xs"
											orientation="vertical"
											color="gray.1"
											h={"100%"}
										/>
									</Box>
								)}
							</>
						)}

						<Flex align={"center"} gap={isMobile ? 8 : 12}>
							<Logo isSmall />
							<Box>
								<Text
									size={isMobile ? "md" : "xl"}
									fw={600}
									lh={"130%"}
								>
									{title}
								</Text>
								{!isMobile && (
									<Text
										size="xs"
										fw={500}
										c={"gray.7"}
										lh={"130%"}
									>
										{description}
									</Text>
								)}
							</Box>
						</Flex>

						{pathname === AppRoutes.Dashboard && !isMobile && (
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

					{/* ---- Desktop right side (user view) ---- */}
					{isUserView && !isMobile && (
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
									<Help />
									<Notification />
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

					{/* ---- Desktop right side (admin view) ---- */}
					{isAdmin && !isUserView && !isMobile && (
						<Group gap={10}>
							<AdminNavigate />
							{pathname !== AppRoutes.NotificationsCenter && (
								<Notification />
							)}
							<Menu shadow="md" position="bottom-end">
								<Menu.Target>
									<Group
										gap={8}
										style={{ cursor: "pointer" }}
									>
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
											<Badge
												color={userRoleColors[role]}
											>
												{startCase(role)}
											</Badge>
										</Stack>
									</Group>
								</Menu.Target>

								<Menu.Dropdown>
									<Menu.Label>
										<Text
											fw={700}
											size="sm"
											c={"gray.9"}
										>
											My Account
										</Text>
									</Menu.Label>

									<Menu.Item
										onClick={() =>
											navigate(
												`${AppRoutes.Admin}/${AppRoutes.Settings}`
											)
										}
										leftSection={
											<IconUser size={14} />
										}
									>
										Profile Settings
									</Menu.Item>

									<Menu.Item
										onClick={() =>
											navigate(
												`${AppRoutes.Admin}/${AppRoutes.Help}`
											)
										}
										leftSection={
											<IconSettings size={14} />
										}
									>
										Help & Support
									</Menu.Item>

									<Menu.Item
										color="red"
										onClick={() => signOutSafe()}
										leftSection={
											<IconLogout size={14} />
										}
									>
										Logout
									</Menu.Item>
								</Menu.Dropdown>
							</Menu>
						</Group>
					)}

					{/* ---- Mobile right side ---- */}
					{isMobile && (
						<Group gap={8}>
							<Notification />
							<Burger
								opened={drawerOpen}
								onClick={openDrawer}
								size="sm"
							/>
						</Group>
					)}
				</Flex>
			</nav>

			{/* ---- Mobile practice selector (below nav on dashboard) ---- */}
			{isMobile && pathname === AppRoutes.Dashboard && (
				<Box px="sm" py="xs" bg="white" className={cl.mobileSelector}>
					<PracticeSelector />
				</Box>
			)}

			{/* ---- Mobile drawer ---- */}
			<Drawer
				opened={drawerOpen}
				onClose={closeDrawer}
				position="right"
				size="xs"
				title={
					<Text size="lg" fw={700}>
						Menu
					</Text>
				}
				zIndex={200}
			>
				<MobileDrawerContent />
			</Drawer>
		</>
	);
};

export default Nav;
