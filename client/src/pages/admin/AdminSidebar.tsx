// AdminSidebar.tsx
import { NavLink } from "react-router-dom";
import {
	ActionIcon,
	Box,
	Flex,
	MantineTheme,
	Stack,
	Text,
	Tooltip,
	useMantineTheme,
} from "@mantine/core";
import {
	IconLayoutSidebarRightExpand,
	IconFiles,
	IconLayoutSidebarLeftExpand,
	IconSettings,
	IconFileAnalytics,
	IconHelpCircle,
	IconAd2,
	IconBuildings,
	IconBell,
} from "@tabler/icons-react";
import { AppRoutes } from "@/shared/shared.models";
import cl from "./admin.module.scss";
import clsx from "clsx";

type SidebarLink = {
	title: string;
	links: {
		to: string; // absolute route
		label: string;
		icon: React.ReactNode;
	}[];
};

export default function AdminSidebar({
	collapsed,
	onToggle,
	widthOpen,
	widthCollapsed,
}: {
	collapsed: boolean;
	onToggle: () => void;
	widthOpen: number;
	widthCollapsed: number;
}) {
	const T = useMantineTheme();

	const base = (theme: MantineTheme) => ({
		background: theme.colors.gray[0],
		borderRight: `1px solid ${theme.colors.gray[1]}`,
		position: "fixed" as const,
		top: 0,
		left: 0,
		bottom: 0,
		width: collapsed ? widthCollapsed : widthOpen,
		transition: "width 150ms ease",
		zIndex: 5,
	});

	const LINKS: SidebarLink[] = [
		{
			title: "Main Menu",
			links: [
				{
					to: `${AppRoutes.Admin}/${AppRoutes.Plans}`,
					label: "Plans",
					icon: <IconFiles size={18} color={T.colors.gray[9]} />,
				},
				{
					to: `${AppRoutes.Admin}/${AppRoutes.Campaigns}`,
					label: "Campaigns",
					icon: <IconAd2 size={18} color={T.colors.gray[9]} />,
				},
				{
					to: `${AppRoutes.Admin}/${AppRoutes.Bespoke}`,
					label: "Bespoke",
					icon: (
						<IconFileAnalytics size={18} color={T.colors.gray[9]} />
					),
				},
				{
					to: `${AppRoutes.Admin}/${AppRoutes.Practices}`,
					label: "Practices",
					icon: <IconBuildings size={18} color={T.colors.gray[9]} />,
				},
				{
					to: `${AppRoutes.Admin}/${AppRoutes.Notifications}`,
					label: "Notifications",
					icon: <IconBell size={18} color={T.colors.gray[9]} />,
				},
				{
					to: `${AppRoutes.Admin}/${AppRoutes.PeopleAccess}`,
					label: "People and Access",
					icon: <IconSettings size={18} />,
				},
			],
		},

		{
			title: "System",
			links: [
				{
					to: `${AppRoutes.Admin}/${AppRoutes.Settings}`,
					label: "Settings",
					icon: <IconSettings size={18} color={T.colors.gray[9]} />,
				},
				{
					to: `${AppRoutes.Admin}/${AppRoutes.Help}`,
					label: "Help & Support",
					icon: <IconHelpCircle size={18} color={T.colors.gray[9]} />,
				},
			],
		},
	];

	return (
		<Box style={base(T)} pt={100} className={cl["admin-sidebar"]}>
			<Flex direction="column" h="100%" p={collapsed ? 6 : "sm"} gap="sm">
				<Stack gap={30}>
					{LINKS.map((lk) => (
						<Stack gap={6} key={lk.title}>
							<Flex
								align="center"
								justify={collapsed ? "center" : "space-between"}
								mb={5}
							>
								{!collapsed && (
									<Text fw={500} size="xs" c="gray.8">
										{lk.title}
									</Text>
								)}
							</Flex>

							{lk.links.map((link) =>
								collapsed ? (
									<Tooltip
										key={link.to}
										label={
											<Text size="xs" fw={500} c="gray.9">
												{link.label}
											</Text>
										}
										withArrow
										position="right"
										style={{
											border: `1px solid ${T.colors.blue[1]}`,
										}}
										bg={"blue.0"}
									>
										<NavLink
											to={link.to}
											className={({ isActive }) =>
												clsx(cl.link, cl.linkIcon, {
													[cl.active]: isActive,
												})
											}
										>
											{link.icon}
										</NavLink>
									</Tooltip>
								) : (
									<NavLink
										key={link.to}
										to={link.to}
										className={({ isActive }) =>
											clsx(cl.link, cl.linkRow, {
												[cl.active]: isActive,
											})
										}
									>
										{link.icon}
										<Text size="sm" fw={500}>
											{link.label}
										</Text>
									</NavLink>
								)
							)}
						</Stack>
					))}
				</Stack>

				<Flex mt="auto" justify="center" c="gray.5" pb="sm">
					<ActionIcon
						variant="subtle"
						radius="md"
						onClick={onToggle}
						aria-label="Toggle sidebar"
					>
						{collapsed ? (
							<IconLayoutSidebarRightExpand size={20} />
						) : (
							<IconLayoutSidebarLeftExpand size={20} />
						)}
					</ActionIcon>
				</Flex>
			</Flex>
		</Box>
	);
}
