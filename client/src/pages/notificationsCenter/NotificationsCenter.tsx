import { AppRoutes } from "@/shared/shared.models";
import {
	Badge,
	Box,
	Button,
	Center,
	Group,
	Paper,
	SegmentedControl,
	Stack,
	Text,
	ThemeIcon,
	useMantineTheme,
} from "@mantine/core";
import { IconBell, IconSparkles } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

type Props = {
	onPrimary?: () => void;
	primaryLabel?: string;
	onSecondary?: () => void;
	secondaryLabel?: string;
};

export default function NotificationsComingSoonLight({
	onPrimary,
	primaryLabel = "Back to Dashboard",
	onSecondary,
	secondaryLabel = "View roadmap",
}: Props) {
	const T = useMantineTheme().colors;
	const navigate = useNavigate();

	return (
		<Box component="section" bg="#fafafa">
			<Center h="90vh" px={{ base: 20, sm: 32 }}>
				<Stack gap={22} align="center" maw={720} ta="center">
					<Text
						variant="gradient"
						gradient={{ from: "violet", to: "red.4", deg: 45 }}
						fw={900}
						style={{
							fontSize: "clamp(40px, 7vw, 64px)",
							lineHeight: 1.05,
							letterSpacing: -0.5,
						}}
					>
						Notifications & Status Dashboard
					</Text>

					{/* “Coming Soon” badge */}
					<Badge
						variant="light"
						color="violet"
						size="lg"
						radius="xl"
						leftSection={
							<ThemeIcon
								variant="subtle"
								color="violet"
								size={18}
								radius="xl"
							>
								<IconSparkles size={14} />
							</ThemeIcon>
						}
					>
						Coming soon
					</Badge>

					{/* <Text c="violet.9" size="sm" maw={620} fw={500}>
						Real-time alerts for campaign changes, approvals, and
						upcoming events, all delivered where you work. Configure
						practice - level routing, digest summaries, and admin
						controls. No inbox clutter, just the signal you need.
					</Text> */}

					<Paper
						radius={10}
						p="sm"
						bg="white"
						shadow="xs"
						style={{ border: `1px solid ${T.blue[0]}` }}
						w="100%"
						maw={560}
					>
						<Group justify="space-between" wrap="nowrap">
							<Group gap={8}>
								<ThemeIcon
									variant="light"
									color="blue.3"
									radius="xl"
								>
									<IconBell size={18} />
								</ThemeIcon>
								<Text fw={600} c="gray.9">
									Preview delivery mode
								</Text>
							</Group>

							<SegmentedControl
								value="digest"
								data={[
									{ label: "Real-time", value: "realtime" },
									{ label: "Daily digest", value: "digest" },
									{
										label: "Critical-only",
										value: "critical",
									},
								]}
								size="xs"
								radius="md"
								disabled
							/>
						</Group>
					</Paper>

					{/* Actions (optional) */}
					<Group gap="sm" mt={6}>
						<Button
							radius="md"
							onClick={() => navigate(AppRoutes.Dashboard)}
						>
							{primaryLabel}
						</Button>
						{onSecondary && (
							<Button
								radius="md"
								variant="light"
								onClick={onSecondary}
							>
								{secondaryLabel}
							</Button>
						)}
					</Group>

					{/* <Text c="gray.5" fz="xs" mt={2}>
						No sign-ups needed.Feature will appear automatically
						when ready.
					</Text> */}
				</Stack>
			</Center>
		</Box>
	);
}
