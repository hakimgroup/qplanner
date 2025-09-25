// AdminLayout.tsx
import { Outlet } from "react-router-dom";
import { Box, Flex, Stack } from "@mantine/core";
import { useState, useMemo } from "react";
import AdminSidebar from "./AdminSidebar";

const OPEN_WIDTH = 255;
const COLLAPSED_WIDTH = 50;

export default function AdminLayout() {
	const [collapsed, setCollapsed] = useState(false);

	const sidebarWidth = collapsed ? COLLAPSED_WIDTH : OPEN_WIDTH;

	const contentStyle = useMemo(
		() => ({
			marginLeft: sidebarWidth,
			height: "100vh",
			overflow: "auto",
			transition: "margin-left 150ms ease",
		}),
		[sidebarWidth]
	);

	return (
		<Box>
			<AdminSidebar
				collapsed={collapsed}
				onToggle={() => setCollapsed((v) => !v)}
				widthOpen={OPEN_WIDTH}
				widthCollapsed={COLLAPSED_WIDTH}
			/>
			<Stack style={contentStyle} pt={25} pb={100}>
				<Box>
					<Outlet />
				</Box>
			</Stack>
		</Box>
	);
}
