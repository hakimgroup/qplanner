import {
	Modal,
	Stack,
	Group,
	Text,
	Card,
	Badge,
	Divider,
	Flex,
	useMantineTheme,
	ThemeIcon,
} from "@mantine/core";
import {
	IconClock,
	IconMessageCircle,
	IconAlertTriangle,
} from "@tabler/icons-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { activityColors } from "@/shared/shared.const";
import StyledButton from "@/components/styledButton/StyledButton";
import { useMarkNotificationRead } from "@/hooks/notification.hooks";
import { toLower } from "lodash";
import { NotificationRow } from "@/models/notification.models";

type Props = {
	opened: boolean;
	onClose: () => void;
	notification: NotificationRow;
	selection?: any | null;
};

export default function AdminFeedbackModal({
	opened,
	onClose,
	notification,
	selection,
}: Props) {
	const T = useMantineTheme();

	const payload = notification?.payload ?? null;
	const campaignName = payload?.name ?? "";
	const campaignCategory = payload?.category ?? "";
	const feedback = (payload as any)?.feedback ?? "";

	const fromDate = selection?.from_date ?? payload?.from_date ?? null;
	const toDate = selection?.to_date ?? payload?.to_date ?? null;

	const { mutate: markRead } = useMarkNotificationRead();

	function handleMarkRead() {
		if (!notification?.id) return;
		markRead(
			{ notificationId: notification.id },
			{
				onError: (e: any) => {
					toast.error(e?.message ?? "Failed to mark as read");
				},
			}
		);
	}

	useEffect(() => {
		if (!notification?.read_at) {
			handleMarkRead();
		}
	}, [notification]);

	const DateBlock = () => (
		<Card radius="md" px="md" py="md" bg={"gray.0"}>
			<Group justify="space-around" align="center">
				<Flex gap={10}>
					<Group gap={5} align="center">
						<IconClock size={15} />
						<Text c="gray.6" size="sm">
							Start Date:
						</Text>
					</Group>
					<Text c="blue.3" size="sm" fw={700}>
						{fromDate ? format(fromDate, "MMM dd, yyyy") : "—"}
					</Text>
				</Flex>

				<Flex gap={10}>
					<Group gap={5} align="center">
						<IconClock size={15} />
						<Text c="gray.6" size="sm">
							End Date:
						</Text>
					</Group>
					<Text c="blue.3" size="sm" fw={700}>
						{toDate ? format(toDate, "MMM dd, yyyy") : "—"}
					</Text>
				</Flex>
			</Group>
		</Card>
	);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			radius="lg"
			centered
			size="lg"
			overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
			title={
				<Stack gap={10}>
					<Group gap={5} align="center">
						<IconMessageCircle color={T.colors.orange[6]} size={20} />
						<Text fw={600} size="lg">
							Revision Requested
						</Text>
					</Group>

					<Group gap={6} wrap="wrap">
						<Text fw={600} size="lg">
							{campaignName || "Campaign"}
						</Text>

						{campaignCategory && (
							<Badge
								size="xs"
								radius="sm"
								color={activityColors[toLower(campaignCategory)]}
								variant={
									campaignCategory === "Event"
										? "filled"
										: "light"
								}
								tt="none"
							>
								{campaignCategory}
							</Badge>
						)}
					</Group>
				</Stack>
			}
		>
			<Stack gap={24}>
				{/* Alert banner */}
				<Card
					radius="md"
					px="lg"
					py="lg"
					style={{
						background: `linear-gradient(135deg, ${T.colors.orange[0]} 0%, ${T.colors.yellow[0]} 100%)`,
						border: `1px solid ${T.colors.orange[2]}`,
					}}
				>
					<Flex align="center" gap="md">
						<ThemeIcon
							size={50}
							radius="xl"
							color="orange"
							variant="filled"
						>
							<IconAlertTriangle size={26} />
						</ThemeIcon>
						<Stack gap={4}>
							<Text fw={700} size="md" c="orange.9">
								Changes Requested
							</Text>
							<Text size="sm" c="gray.7">
								{notification?.practice_name || "The practice"} has
								reviewed the assets and requested revisions. The
								campaign has been moved back to "In Progress".
							</Text>
						</Stack>
					</Flex>
				</Card>

				{/* Campaign period */}
				<DateBlock />

				{/* Feedback */}
				{feedback && (
					<Stack gap={8}>
						<Text fw={600} size="sm">
							Practice Feedback
						</Text>
						<Card
							withBorder
							radius="md"
							px="md"
							py="md"
							style={{
								borderColor: T.colors.orange[2],
								backgroundColor: T.colors.orange[0],
							}}
						>
							<Text
								size="sm"
								c="gray.9"
								style={{ whiteSpace: "pre-wrap" }}
							>
								{feedback}
							</Text>
						</Card>
					</Stack>
				)}

				{/* Next steps */}
				<Card
					radius="md"
					px="md"
					py="md"
					bg={"gray.0"}
				>
					<Stack gap={8}>
						<Text fw={600} size="sm" c="gray.7">
							Next Steps
						</Text>
						<Text size="sm" c="gray.6">
							1. Review the feedback above
							<br />
							2. Make the necessary changes to the assets
							<br />
							3. Send updated assets for approval when ready
						</Text>
					</Stack>
				</Card>

				{/* Footer */}
				<Divider color="#e9ecef" />

				<Flex justify="flex-end">
					<StyledButton variant="default" onClick={onClose}>
						Close
					</StyledButton>
				</Flex>
			</Stack>
		</Modal>
	);
}
