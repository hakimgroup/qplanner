import { useState } from "react";
import { Group, Box, Drawer, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardContent } from "./DashboardContent";
import { useBreakpoints } from "@/shared/shared.hooks";

export default function Dashboard() {
	const [collapsed, setCollapsed] = useState(false);
	const { isXs, isSm } = useBreakpoints();
	const isMobile = isXs || isSm;
	const [drawerOpen, { open: openDrawer, close: closeDrawer }] =
		useDisclosure(false);

	return (
		<Group align="stretch" gap={0} wrap="nowrap" h="100vh">
			{isMobile ? (
				<Drawer
					opened={drawerOpen}
					onClose={closeDrawer}
					position="left"
					size="xs"
					title={
						<Text size="lg" fw={700}>
							Filters & Views
						</Text>
					}
					zIndex={200}
				>
					<DashboardSidebar
						collapsed={false}
						setCollapsed={() => closeDrawer()}
						isMobile
					/>
				</Drawer>
			) : (
				<DashboardSidebar
					collapsed={collapsed}
					setCollapsed={setCollapsed}
				/>
			)}

			{/* Main content (always fills remaining space) */}
			<Box
				style={{ flex: 1, minHeight: "100%" }}
				ml={isMobile ? 0 : collapsed ? 50 : 300}
			>
				<DashboardContent
					isMobile={isMobile}
					onOpenFilters={isMobile ? openDrawer : undefined}
				/>
			</Box>
		</Group>
	);
}
