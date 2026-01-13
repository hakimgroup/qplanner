import {
	Modal,
	Stack,
	Text,
	Group,
	Badge,
	Card,
	useMantineTheme,
	ThemeIcon,
} from "@mantine/core";
import { format } from "date-fns";
import {
	IconPlus,
	IconPencil,
	IconTrash,
	IconSparkles,
	IconCalendarEvent,
	IconCopy,
	IconStack2,
	IconCheck,
} from "@tabler/icons-react";
import { activityColors } from "@/shared/shared.const";
import { NotificationRow } from "@/models/notification.models";
import { ActorNotificationType } from "@/shared/shared.models";
import { toLower } from "lodash";
import StyledButton from "@/components/styledButton/StyledButton";

type ActorNotificationModalProps = {
	opened: boolean;
	onClose: () => void;
	notification: NotificationRow;
};

function getActionDetails(type: string) {
	switch (type) {
		case ActorNotificationType.CampaignAdded:
			return {
				icon: IconPlus,
				color: "green",
				label: "Campaign Added",
				description: "You added this campaign to your plan.",
			};
		case ActorNotificationType.CampaignUpdated:
			return {
				icon: IconPencil,
				color: "blue",
				label: "Campaign Updated",
				description: "You updated this campaign on your plan.",
			};
		case ActorNotificationType.CampaignDeleted:
			return {
				icon: IconTrash,
				color: "red",
				label: "Campaign Removed",
				description: "You removed this campaign from your plan.",
			};
		case ActorNotificationType.BespokeAdded:
			return {
				icon: IconSparkles,
				color: "violet",
				label: "Bespoke Campaign Created",
				description: "You created a new bespoke campaign.",
			};
		case ActorNotificationType.BespokeEventAdded:
			return {
				icon: IconCalendarEvent,
				color: "orange",
				label: "Bespoke Event Created",
				description: "You created a new bespoke event.",
			};
		case ActorNotificationType.BulkAdded:
			return {
				icon: IconStack2,
				color: "teal",
				label: "Campaigns Added",
				description: "You added multiple campaigns to your plan.",
			};
		case ActorNotificationType.CampaignsCopied:
			return {
				icon: IconCopy,
				color: "indigo",
				label: "Campaigns Copied",
				description: "Campaigns were copied to this practice.",
			};
		default:
			return {
				icon: IconCheck,
				color: "gray",
				label: "Action Completed",
				description: "An action was performed.",
			};
	}
}

export default function ActorNotificationModal({
	opened,
	onClose,
	notification,
}: ActorNotificationModalProps) {
	const T = useMantineTheme();
	const p = notification?.payload ?? null;
	const campaignName = p?.name ?? "Campaign";
	const category = p?.category ?? null;
	const fromDate = p?.from_date ?? null;
	const toDate = p?.to_date ?? null;
	const isBespoke = p?.is_bespoke ?? false;

	const actionDetails = getActionDetails(notification.type);
	const ActionIcon = actionDetails.icon;

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			radius="lg"
			centered
			size="md"
			overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
			title={
				<Group gap={8} align="center">
					<ThemeIcon
						size="sm"
						radius="xl"
						color={actionDetails.color}
						variant="light"
					>
						<ActionIcon size={14} />
					</ThemeIcon>
					<Text fw={600} size="sm">
						{actionDetails.label}
					</Text>
				</Group>
			}
		>
			<Stack gap="md">
				{/* Action confirmation card */}
				<Card
					radius="md"
					px="md"
					py="sm"
					withBorder
					style={{
						borderColor: T.colors[actionDetails.color][2],
						background: T.colors[actionDetails.color][0],
					}}
				>
					<Group gap="sm" align="flex-start">
						<ThemeIcon
							size="lg"
							radius="md"
							color={actionDetails.color}
							variant="light"
						>
							<ActionIcon size={18} />
						</ThemeIcon>
						<Stack gap={4} style={{ flex: 1 }}>
							<Text
								size="sm"
								fw={600}
								c={`${actionDetails.color}.9`}
								style={{ lineHeight: 1.4 }}
							>
								{actionDetails.description}
							</Text>
							<Text size="xs" c="gray.6">
								This is a confirmation of your action.
							</Text>
						</Stack>
					</Group>
				</Card>

				{/* Campaign details */}
				<Stack gap="xs">
					<Group justify="space-between" align="flex-start">
						<Stack gap={4}>
							<Text size="xs" fw={700} c="gray.5" tt="uppercase">
								Campaign
							</Text>
							<Group gap={8}>
								<Text size="sm" fw={600} c="gray.9">
									{campaignName}
								</Text>
								{isBespoke && (
									<Badge
										size="xs"
										radius="sm"
										color="violet"
										variant="light"
									>
										Bespoke
									</Badge>
								)}
							</Group>
						</Stack>

						{category && (
							<Badge
								size="sm"
								radius="sm"
								color={activityColors[toLower(category)] ?? "gray"}
								variant={category === "Event" ? "filled" : "light"}
								tt="none"
							>
								{category}
							</Badge>
						)}
					</Group>

					{/* Date range - only show if we have dates */}
					{(fromDate || toDate) && (
						<Stack gap={4} mt="xs">
							<Text size="xs" fw={700} c="gray.5" tt="uppercase">
								Campaign Period
							</Text>
							<Text size="sm" c="gray.7">
								{fromDate ? format(new Date(fromDate), "MMM dd, yyyy") : "—"}{" "}
								→ {toDate ? format(new Date(toDate), "MMM dd, yyyy") : "—"}
							</Text>
						</Stack>
					)}

					{/* Timestamp */}
					<Stack gap={4} mt="xs">
						<Text size="xs" fw={700} c="gray.5" tt="uppercase">
							Action Time
						</Text>
						<Text size="sm" c="gray.7">
							{notification?.created_at
								? format(new Date(notification.created_at), "MMM dd, yyyy 'at' h:mm a")
								: "—"}
						</Text>
					</Stack>
				</Stack>

				{/* Close button */}
				<Group justify="flex-end" mt="md">
					<StyledButton variant="default" radius="md" onClick={onClose}>
						Close
					</StyledButton>
				</Group>
			</Stack>
		</Modal>
	);
}
