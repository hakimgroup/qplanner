// AdminSidebar.tsx
import { NavLink } from "react-router-dom";
import {
	ActionIcon,
	Badge,
	Box,
	Flex,
	MantineTheme,
	SegmentedControl,
	Stack,
	Text,
	Tooltip,
	useMantineTheme,
} from "@mantine/core";
import { usePracticesOfInterest } from "@/shared/PracticesOfInterestProvider";
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
	IconUsers,
	IconLogs,
	IconBolt,
	IconMail,
	IconStar,
	IconWand,
	IconBug,
} from "@tabler/icons-react";
import { AppRoutes, UserRoles } from "@/shared/shared.models";
import { useAuth } from "@/shared/AuthProvider";
import cl from "./admin.module.scss";
import clsx from "clsx";

type SidebarLinkItem = {
	to: string; // absolute route
	label: string;
	icon: React.ReactNode;
	accent?: string; // optional Mantine theme color (e.g. "red")
};

type SidebarLink = {
	title: string;
	links: SidebarLinkItem[];
};

export default function AdminSidebar({
	collapsed,
	onToggle,
	widthOpen,
	widthCollapsed,
	isMobile,
	onNavigate,
}: {
	collapsed: boolean;
	onToggle: () => void;
	widthOpen: number;
	widthCollapsed: number;
	isMobile?: boolean;
	onNavigate?: () => void;
}) {
	const T = useMantineTheme();
	const { role } = useAuth();
	const isSuperAdmin = role === UserRoles.SuperAdmin;

	const base = (theme: MantineTheme) =>
		isMobile
			? {}
			: {
					background: theme.colors.gray[0],
					borderRight: `1px solid ${theme.colors.gray[1]}`,
					position: "fixed" as const,
					top: 0,
					left: 0,
					bottom: 0,
					width: collapsed ? widthCollapsed : widthOpen,
					transition: "width 150ms ease",
					zIndex: 5,
				};

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
					icon: <IconUsers size={18} />,
				},
				// {
				// 	to: `${AppRoutes.Admin}/${AppRoutes.AuditLogs}`,
				// 	label: "Audit Logs",
				// 	icon: <IconLogs size={18} />,
				// },
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
					to: `${AppRoutes.Admin}/${AppRoutes.BugReports}`,
					label: "Bug Reports",
					icon: <IconBug size={18} color={T.colors.gray[9]} />,
				},
				// {
				// 	to: `${AppRoutes.Admin}/${AppRoutes.Help}`,
				// 	label: "Help & Support",
				// 	icon: <IconHelpCircle size={18} color={T.colors.gray[9]} />,
				// },
			],
		},
	];

	if (isSuperAdmin) {
		LINKS.splice(1, 0, {
			title: "Super Admin",
			links: [
				{
					to: `${AppRoutes.Admin}/${AppRoutes.GodMode}`,
					label: "God Mode",
					icon: <IconBolt size={18} color={T.colors.red[6]} />,
					accent: "red",
				},
				{
					to: `${AppRoutes.Admin}/${AppRoutes.EmailHealth}`,
					label: "Email Health",
					icon: <IconMail size={18} color={T.colors.red[6]} />,
					accent: "red",
				},
				{
					to: `${AppRoutes.Admin}/${AppRoutes.PracticesOfInterest}`,
					label: "Practices of Interest",
					icon: <IconStar size={18} color={T.colors.red[6]} />,
					accent: "red",
				},
				{
					to: AppRoutes.Landing,
					label: "Landing Pages",
					icon: <IconWand size={18} color={T.colors.red[6]} />,
					accent: "red",
				},
				// {
				// 	to: `${AppRoutes.Admin}/${AppRoutes.SendEmail}`,
				// 	label: "Send Email",
				// 	icon: <IconMail size={18} color={T.colors.red[6]} />,
				// 	accent: "red",
				// },
			],
		});
	}

	const getAccentStyle = (
		accent: string | undefined,
		_isActive: boolean
	): React.CSSProperties => {
		if (!accent) return {};
		const palette = (T.colors as any)[accent];
		if (!palette) return {};
		return {
			color: palette[7],
		};
	};

	const showExpanded = isMobile || !collapsed;
	const { isEnabled: poiEnabled, viewMode, setViewMode, poiPracticeIds } =
		usePracticesOfInterest();

	return (
		<Box style={base(T)} pt={isMobile ? 0 : 100} className={cl["admin-sidebar"]}>
			<Flex direction="column" h="100%" p={showExpanded ? "sm" : 6} gap="sm">
				{/* Practices of Interest toggle — super_admin only.
				    Lives at the top so it's always in view when navigating admin pages. */}
				{poiEnabled && showExpanded && (
					<Box
						mb={6}
						p="sm"
						style={{
							background: `linear-gradient(135deg, ${T.colors.blue[0]}, ${T.colors.violet[0]})`,
							border: `1px solid ${T.colors.blue[1]}`,
							borderRadius: 10,
						}}
					>
						<Stack gap={6}>
							<Flex align="center" justify="space-between">
								<Text size="xs" fw={700} c="violet.7" tt="uppercase" lts={0.4}>
									Practice view
								</Text>
								{viewMode === "poi" && (
									<Badge
										variant="filled"
										color="violet.5"
										size="xs"
										radius="sm"
									>
										{poiPracticeIds.length}
									</Badge>
								)}
							</Flex>
							<SegmentedControl
								size="xs"
								fullWidth
								color="violet"
								value={viewMode}
								onChange={(v) => setViewMode(v as "all" | "poi")}
								data={[
									{ value: "all", label: "All" },
									{ value: "poi", label: "Mine" },
								]}
								classNames={{
									root: cl.poiSegmentedRoot,
									label: cl.poiSegmentedLabel,
								}}
							/>
						</Stack>
					</Box>
				)}

				<Stack gap={30}>
					{LINKS.map((lk) => (
						<Stack gap={6} key={lk.title}>
							<Flex
								align="center"
								justify={collapsed && !isMobile ? "center" : "space-between"}
								mb={5}
							>
								{showExpanded && (
									<Text fw={500} size="xs" c="gray.8">
										{lk.title}
									</Text>
								)}
							</Flex>

							{lk.links.map((link) =>
								!showExpanded ? (
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
											style={({ isActive }) =>
												getAccentStyle(link.accent, isActive)
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
										style={({ isActive }) =>
											getAccentStyle(link.accent, isActive)
										}
										onClick={onNavigate}
									>
										{link.icon}
										<Text
											size="sm"
											fw={500}
											style={
												link.accent
													? {
															color: (T.colors as any)[link.accent]?.[7],
														}
													: undefined
											}
										>
											{link.label}
										</Text>
									</NavLink>
								)
							)}
						</Stack>
					))}
				</Stack>

				{!isMobile && (
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
				)}
			</Flex>
		</Box>
	);
}
