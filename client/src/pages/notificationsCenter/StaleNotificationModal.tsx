import {
	Modal,
	Stack,
	Text,
	Group,
	Badge,
	Button,
	Card,
	useMantineTheme,
} from "@mantine/core";
import { format } from "date-fns";
import { IconInfoCircle } from "@tabler/icons-react";
import { activityColors } from "@/shared/shared.const";
import { NotificationRow } from "@/models/notification.models";
import { toLower } from "lodash";
import StyledButton from "@/components/styledButton/StyledButton";

type StaleNotificationModalProps = {
	opened: boolean;
	onClose: () => void;
	notification: NotificationRow;
	selection: any | null;
};

function statusMessage(status: string | null) {
	if (!status) {
		return "This campaign has moved on to the next stage.";
	}
	switch (status) {
		case "inProgress":
			return "Your assets have already been submitted and are now being worked on.";
		case "awaitingApproval":
			return "This campaign is now awaiting approval.";
		case "confirmed":
			return "This campaign has been confirmed.";
		case "live":
			return "This campaign is now live.";
		default:
			return "This campaign has moved on to the next stage.";
	}
}

export default function StaleNotificationModal({
	opened,
	onClose,
	notification,
	selection,
}: StaleNotificationModalProps) {
	const T = useMantineTheme();
	const p = notification?.payload ?? null;
	const campaignName = p?.name ?? "Campaign";
	const category = p?.category ?? null;
	const fromDate = p?.from_date ?? selection?.from_date ?? null;
	const toDate = p?.to_date ?? selection?.to_date ?? null;

	const liveStatus = selection?.status ?? null;

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			radius="lg"
			centered
			size="40rem"
			overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
			title={
				<Group gap={6} align="center">
					<IconInfoCircle size={18} color={T.colors.blue[5]} />
					<Text fw={600} size="sm">
						{campaignName}
					</Text>

					{category && (
						<Badge
							size="xs"
							radius="sm"
							color={activityColors[toLower(category)]}
							variant={category === "Event" ? "filled" : "light"}
							tt="none"
						>
							{category}
						</Badge>
					)}
				</Group>
			}
		>
			<Stack gap="md">
				<Card
					radius="md"
					px="md"
					py="sm"
					withBorder
					style={{
						borderColor: T.colors.violet[2],
						background: T.colors.violet[0],
					}}
				>
					<Text
						size="sm"
						fw={600}
						c="violet.9"
						style={{ lineHeight: 1.4 }}
					>
						This notification is from an earlier stage.
					</Text>
					<Text size="sm" c="gray.7" style={{ lineHeight: 1.4 }}>
						{statusMessage(liveStatus)}
					</Text>
				</Card>

				<Group justify="space-between">
					<Stack gap={4}>
						<Text size="xs" fw={700} c="gray.9">
							Campaign period
						</Text>
						<Text size="xs" c="violet.9" fs={"italic"} fw={600}>
							{fromDate ? format(fromDate, "MMM dd, yyyy") : "—"}{" "}
							→ {toDate ? format(toDate, "MMM dd, yyyy") : "—"}
						</Text>
					</Stack>

					<Stack gap={4}>
						<Text size="xs" fw={700} c="gray.9">
							Last update
						</Text>
						<Text size="xs" c="violet.9" fs={"italic"} fw={600}>
							{notification?.created_at
								? format(
										notification.created_at,
										"MMM dd, yyyy p"
								  )
								: "—"}
						</Text>
					</Stack>
				</Group>

				<Group justify="flex-end" mt="lg">
					{/* optional: if status is inProgress or later, you can deep-link to a detail view */}
					<StyledButton
						variant="default"
						radius="md"
						onClick={onClose}
					>
						Close
					</StyledButton>
				</Group>
			</Stack>
		</Modal>
	);
}
