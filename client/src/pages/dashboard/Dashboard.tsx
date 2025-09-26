import { useState } from "react";
import { Group, Box } from "@mantine/core";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardContent } from "./DashboardContent";

export default function Dashboard() {
	const [collapsed, setCollapsed] = useState(false);

	return (
		<Group align="stretch" gap={0} wrap="nowrap" h="100vh">
			<DashboardSidebar
				collapsed={collapsed}
				setCollapsed={setCollapsed}
			/>

			{/* Main content (always fills remaining space) */}
			<Box
				style={{ flex: 1, minHeight: "100%" }}
				ml={collapsed ? 50 : 300}
			>
				<DashboardContent />
			</Box>
		</Group>
	);
}
