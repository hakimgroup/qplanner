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
	ActionIcon,
} from "@mantine/core";
import {
	IconClock,
	IconCircleCheck,
	IconExternalLink,
	IconConfetti,
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

export default function AdminConfirmedModal({
	opened,
	onClose,
	notification,
	selection,
}: Props) {
	const T = useMantineTheme();

	const payload = notification?.payload ?? null;
	const campaignName = payload?.name ?? "";
	const campaignCategory = payload?.category ?? "";

	const fromDate = selection?.from_date ?? payload?.from_date ?? null;
	const toDate = selection?.to_date ?? payload?.to_date ?? null;

	const chosenCreativeUrl = payload?.chosen_creative ?? null;
	const practiceNote = payload?.note ?? null;

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

	const CreativeBlock = () =>
		!chosenCreativeUrl ? null : (
			<Stack gap={8}>
				<Text fw={600} size="sm">
					Confirmed Creative
				</Text>
				<Card
					withBorder
					radius="md"
					px="md"
					py="md"
					bg={"teal.0"}
					style={{
						borderColor: T.colors.teal[2],
					}}
				>
					<Group
						justify="space-between"
						align="flex-start"
						wrap="nowrap"
					>
						<Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
							<Text fw={700} size="xs" c="teal.9" lineClamp={1}>
								{chosenCreativeUrl}
							</Text>
							<Text size="xs" c="gray.6">
								The practice approved this artwork.
							</Text>
						</Stack>

						<ActionIcon
							variant="subtle"
							component="a"
							color="teal.9"
							href={chosenCreativeUrl}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Open creative"
						>
							<IconExternalLink size={16} />
						</ActionIcon>
					</Group>
				</Card>
			</Stack>
		);

	const PracticeNoteBlock = () =>
		!practiceNote ? null : (
			<Stack gap={6}>
				<Text fw={600} size="sm">
					Confirmation Note
				</Text>
				<Card
					withBorder
					radius="md"
					px="md"
					py="sm"
					style={{
						borderColor: T.colors.indigo[0],
						backgroundColor: T.colors.indigo[0],
					}}
				>
					<Text size="sm" c="indigo.9">
						{practiceNote}
					</Text>
				</Card>
			</Stack>
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
						<IconCircleCheck color={T.colors.teal[6]} size={20} />
						<Text fw={600} size="lg">
							Assets Confirmed
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
				{/* Success banner */}
				<Card
					radius="md"
					px="lg"
					py="lg"
					style={{
						background: `linear-gradient(135deg, ${T.colors.teal[0]} 0%, ${T.colors.green[0]} 100%)`,
						border: `1px solid ${T.colors.teal[2]}`,
					}}
				>
					<Flex align="center" gap="md">
						<ThemeIcon
							size={50}
							radius="xl"
							color="teal"
							variant="filled"
						>
							<IconConfetti size={26} />
						</ThemeIcon>
						<Stack gap={4}>
							<Text fw={700} size="md" c="teal.9">
								Practice Approved!
							</Text>
							<Text size="sm" c="gray.7">
								{notification?.practice_name || "The practice"} has
								reviewed and confirmed the assets for this campaign.
								It's ready to proceed to the next stage.
							</Text>
						</Stack>
					</Flex>
				</Card>

				{/* Campaign period */}
				<DateBlock />

				{/* Chosen creative */}
				<CreativeBlock />

				{/* Practice note */}
				<PracticeNoteBlock />

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
