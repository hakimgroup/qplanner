import { useSignout } from "@/pages/auth/auth.hooks";
import { AppRoutes } from "@/shared/shared.models";
import { Badge, Box, Button, Divider, Flex, Group, Text } from "@mantine/core";
import {
	IconArrowLeft,
	IconDeviceFloppy,
	IconLogout,
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
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { user, isAdmin } = useAuth();

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
						<Badge variant="outline" color="gray.1">
							<Text size="xs" fw={600} c={"gray.9"}>
								{user?.identities[0].identity_data.first_name}{" "}
								{user?.identities[0].identity_data.last_name}
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

				{isAdmin && <Group></Group>}
			</Flex>
		</nav>
	);
};

export default Nav;
