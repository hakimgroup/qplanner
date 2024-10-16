import useUser, { useSignout } from "@/pages/auth/auth.hooks";
import { AppRoutes } from "@/shared/shared.models";
import { Button, Image, Text } from "@mantine/core";
import { IconLogout, IconPlus } from "@tabler/icons-react";
import "./nav.scss";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/AuthProvider";
import MobileMenu from "../mobileMenu/MobileMenu";
import Logo from "@assets/logo.svg";

const Nav = () => {
	const navigate = useNavigate();
	const { data: user } = useUser();
	const isAdmin = user?.role === "admin";

	//APIs
	const { mutate: signout } = useSignout();
	const { pathname } = useLocation();

	return (
		<nav>
			<div className="logo">
				<Image w={120} src={Logo} alt="QPlanner Logo" />
			</div>

			<div className="links">
				<Link to={AppRoutes.MyCampaigns}>
					<Text
						span
						c={pathname === AppRoutes.MyCampaigns ? "blue" : "dark"}
						fw={600}
					>
						My Marketing Plans
					</Text>
				</Link>
				{isAdmin && (
					<Link to={AppRoutes.Admin}>
						<Text
							span
							c={pathname === AppRoutes.Admin ? "blue" : "dark"}
							fw={600}
						>
							Admin Panel
						</Text>
					</Link>
				)}
				<Button
					size="sm"
					variant="gradient"
					gradient={{ from: "blue", to: "grape", deg: 90 }}
					rightSection={<IconPlus size={14} />}
					onClick={() => navigate(`${AppRoutes.Calendar}/1`)}
				>
					Create New Marketing Plan
				</Button>
				<Button
					size="sm"
					variant="light"
					rightSection={<IconLogout size={14} />}
					onClick={() => signout()}
				>
					Sign out
				</Button>
			</div>

			<MobileMenu />
		</nav>
	);
};

export default Nav;
