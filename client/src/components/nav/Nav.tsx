import useUser, { useSignout } from "@/pages/auth/auth.hooks";
import { AppRoutes } from "@/shared/shared.models";
import { Badge, Box, Button, Divider, Flex, Text } from "@mantine/core";
import { IconDeviceFloppy, IconLogout } from "@tabler/icons-react";
import cl from "./nav.module.scss";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/AuthProvider";
import Logo from "../logo/Logo";
import PracticeSelector from "../practiceSelector/PracticeSelector";
import Help from "../help/Help";
import Notification from "../notification/Notification";

const Nav = () => {
	const navigate = useNavigate();
	const { data: user } = useUser();
	const isAdmin = user?.role === "admin";

	//APIs
	const { mutate: signout } = useSignout();

	return (
		<nav className={cl.nav}>
			<Flex justify={"space-between"} align={"center"}>
				<Flex align={"center"} gap={15}>
					<Flex align={"center"} gap={12}>
						<Logo isSmall />
						<Box>
							<Text size="xl" fw={600} lh={"130%"}>
								Marketing Planner
							</Text>
							<Text size="xs" fw={500} c={"gray.7"} lh={"130%"}>
								Campaign Planning & Management
							</Text>
						</Box>
					</Flex>

					<Box h={"30px"}>
						<Divider
							size="xs"
							orientation="vertical"
							color="gray.1"
							h={"100%"}
						/>
					</Box>

					<PracticeSelector />
				</Flex>

				<Flex align={"center"} gap={15}>
					<Badge
						variant="outline"
						color="gray.1"
						style={{ textTransform: "unset" }}
					>
						<Text size="xs" fw={600} c={"gray.9"}>
							Sarah Johnson
						</Text>
					</Badge>

					<Help />

					<Notification />

					<Button
						radius={10}
						disabled
						variant="subtle"
						color="violet"
						style={{ border: "1px solid #e5e7eb" }}
						c="gray.9"
						leftSection={<IconDeviceFloppy size={18} />}
					>
						Save
					</Button>

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
			</Flex>
		</nav>
	);
};

export default Nav;
