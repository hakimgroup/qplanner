import { useState } from "react";
import "./mobileMenu.scss";
import clsx from "clsx";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AppRoutes } from "@/shared/shared.models";
import { Button, Text } from "@mantine/core";
import { IconLogout, IconPlus } from "@tabler/icons-react";
import { useAuth } from "@/shared/AuthProvider";
import { useSignout } from "@/pages/auth/auth.hooks";
import { useClickOutside } from "@mantine/hooks";

const MobileMenu = () => {
	const [open, setOpen] = useState(false);
	const ref = useClickOutside(() => setOpen(false));
	const navigate = useNavigate();
	const { user } = useAuth();

	//APIs
	const { mutate: signout } = useSignout();
	const { pathname } = useLocation();

	return (
		<div className="mobile-menu">
			<div
				className={clsx("mm-burger", open && "active")}
				onClick={() => setOpen(!open)}
			>
				<i>Menu</i>
			</div>

			{open && (
				<div ref={ref} className="mm-menu-list">
					<Link to={AppRoutes.MyCampaigns}>
						<Text
							c={
								pathname === AppRoutes.MyCampaigns
									? "blue"
									: "dark"
							}
							fw={600}
							onClick={() => setOpen(false)}
						>
							My Campaigns
						</Text>
					</Link>
					{user?.user_metadata.isAdmin && (
						<Link to={AppRoutes.Admin}>
							<Text
								c={
									pathname === AppRoutes.Admin
										? "blue"
										: "dark"
								}
								fw={600}
								mt={15}
								onClick={() => setOpen(false)}
							>
								Admin Panel
							</Text>
						</Link>
					)}
					<Button
						size="sm"
						mt={20}
						variant="gradient"
						gradient={{ from: "blue", to: "grape", deg: 90 }}
						rightSection={<IconPlus size={14} />}
						onClick={() => {
							navigate(`${AppRoutes.Calendar}/1`);
							setOpen(false);
						}}
					>
						Create New Campaign
					</Button>
					<Button
						size="sm"
						variant="light"
						mt={10}
						rightSection={<IconLogout size={14} />}
						onClick={() => signout()}
					>
						Sign out
					</Button>
				</div>
			)}
		</div>
	);
};

export default MobileMenu;
