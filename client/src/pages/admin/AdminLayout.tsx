// AdminLayout.tsx
import { Outlet } from "react-router-dom";
import { Box, Burger, Drawer, Group, Stack, Text } from "@mantine/core";
import { useState, useMemo } from "react";
import { useDisclosure } from "@mantine/hooks";
import AdminSidebar from "./AdminSidebar";
import { useBreakpoints } from "@/shared/shared.hooks";

const OPEN_WIDTH = 255;
const COLLAPSED_WIDTH = 50;

export default function AdminLayout() {
	const [collapsed, setCollapsed] = useState(false);
	const { isXs, isSm } = useBreakpoints();
	const isMobile = isXs || isSm;
	const [drawerOpen, { open: openDrawer, close: closeDrawer }] =
		useDisclosure(false);

	const sidebarWidth = collapsed ? COLLAPSED_WIDTH : OPEN_WIDTH;

	const contentStyle = useMemo(
		() => ({
			marginLeft: isMobile ? 0 : sidebarWidth,
			height: "100vh",
			transition: "margin-left 150ms ease",
		}),
		[sidebarWidth, isMobile]
	);

	return (
		<Box>
			{isMobile ? (
				<Drawer
					opened={drawerOpen}
					onClose={closeDrawer}
					position="left"
					size="xs"
					title={
						<Text size="lg" fw={700}>
							Admin Menu
						</Text>
					}
					zIndex={200}
					withCloseButton
				>
					<AdminSidebar
						collapsed={false}
						onToggle={closeDrawer}
						widthOpen={OPEN_WIDTH}
						widthCollapsed={COLLAPSED_WIDTH}
						isMobile
						onNavigate={closeDrawer}
					/>
				</Drawer>
			) : (
				<AdminSidebar
					collapsed={collapsed}
					onToggle={() => setCollapsed((v) => !v)}
					widthOpen={OPEN_WIDTH}
					widthCollapsed={COLLAPSED_WIDTH}
				/>
			)}
			<Stack style={contentStyle} pt={isMobile ? 0 : 25} pb={100} px={isMobile ? "sm" : undefined} gap={0}>
				{isMobile && (
					<Group
						gap="xs"
						align="center"
						py="xs"
						onClick={drawerOpen ? closeDrawer : openDrawer}
						style={{
							position: "sticky",
							top: 52,
							zIndex: 9,
							backgroundColor: "var(--mantine-color-body)",
							borderBottom: "2px solid transparent",
							borderImage: "linear-gradient(to right, transparent, var(--mantine-color-violet-3), transparent) 1",
							cursor: "pointer",
						}}
					>
						<Burger
							opened={drawerOpen}
							size="sm"
							color="violet"
						/>
						<Text fw={700} size="sm" c="violet">
							Admin Menu
						</Text>
					</Group>
				)}
				<Box pt={isMobile ? "md" : 0}>
					<Outlet />
				</Box>
			</Stack>
		</Box>
	);
}
