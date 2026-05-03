import {
	Modal,
	Stack,
	Group,
	Text,
	Card,
	Textarea,
	Badge,
	Flex,
	Button,
	useMantineTheme,
	ThemeIcon} from "@mantine/core";
import GradientDivider from "@/components/gradientDivider/GradientDivider";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
	IconClock,
	IconCircle,
	IconBox} from "@tabler/icons-react";
import {
	useMarkNotificationRead,
	useSubmitAssets} from "@/hooks/notification.hooks";
import StyledButton from "@/components/styledButton/StyledButton";
import CreativePicker, { CreativeItem } from "./CreativePicker";
import AssetsPicker, {
	AssetsState,
	initAssetsState,
	hasAnySelectedAsset,
	calcEstimatedTotal,
	buildFinalAssets,
} from "@/components/assets/AssetsPicker";
import { format } from "date-fns";
import { activityColors } from "@/shared/shared.const";
import { toLower } from "lodash";
import { NotificationRow } from "@/models/notification.models";
import { Assets } from "@/models/campaign.models";
import { useIsMobile } from "@/shared/shared.hooks";

type Props = {
	opened: boolean;
	onClose: () => void;
	notification: NotificationRow; // list_notifications row shape
};

export default function PracticeRespondModal({
	opened,
	onClose,
	notification}: Props) {
	const T = useMantineTheme();
	const isMobile = useIsMobile();

	// ─────────────────────────────────
	// Pull structured payload from the notification
	// ─────────────────────────────────
	const payload = notification?.payload ?? null;
	const selectionId = notification?.selection_id ?? null;
	const campaignName = payload?.name ?? "";
	const campaignCategory = payload?.category ?? "";
	const fromDate = payload?.from_date ?? null;
	const toDate = payload?.to_date ?? null;
	const creatives: CreativeItem[] = payload.creatives ?? [];

	const baseAssets: Assets = payload?.assets ?? {
		printedAssets: [],
		digitalAssets: [],
		externalPlacements: []};

	// ─────────────────────────────────
	// Local state (reset whenever the modal opens for a new notification)
	// ─────────────────────────────────
	const [assetsState, setAssetsState] = useState<AssetsState>(() =>
		initAssetsState(baseAssets),
	);

	const [selectedCreative, setSelectedCreative] = useState<string | null>(
		null
	);
	const [creativeAnswer, setCreativeAnswer] = useState<string>("");
	const [practiceNote, setPracticeNote] = useState<string>("");

	useEffect(() => {
		if (!opened || !notification) return;
		setAssetsState(initAssetsState(baseAssets));
		setSelectedCreative(null);
		setCreativeAnswer("");
		setPracticeNote("");
	}, [opened, notification, baseAssets]);

	// ─────────────────────────────────
	// Hooks for submit + mark read
	// ─────────────────────────────────
	const { mutate: submitAssets, isPending: submitting } = useSubmitAssets();
	const { mutate: markRead, isPending: markingRead } =
		useMarkNotificationRead();

	// currency formatter for footer card
	function GBP(v: number): string {
		return `£${v.toFixed(2)}`;
	}

	const estimatedTotal = useMemo(() => calcEstimatedTotal(assetsState), [
		assetsState,
	]);

	const anySelected = useMemo(() => hasAnySelectedAsset(assetsState), [
		assetsState,
	]);

	const creativeRequired = creatives.length > 0;
	const creativeIsChosen = !creativeRequired || !!selectedCreative;

	// Check if the selected creative has a custom question that requires an answer
	const selectedCreativeObj = creatives.find((c) => c.url === selectedCreative);
	const questionAnswered =
		!selectedCreativeObj?.question || !!creativeAnswer.trim();

	const canSubmit =
		creativeIsChosen &&
		questionAnswered &&
		anySelected &&
		!!selectionId &&
		!submitting &&
		!markingRead;

	// submit handler
	function handleSubmit() {
		if (!selectionId) {
			toast.error("Missing selection id");
			return;
		}

		const finalAssets = buildFinalAssets(assetsState, creativeAnswer);

		submitAssets(
			{
				selectionId,
				chosenCreative: selectedCreative ?? null,
				assets: finalAssets,
				note: practiceNote?.trim() || null},
			{
				onSuccess: () => {
					toast.success("Your asset choices have been sent");
					onClose();
				},
				onError: (e: any) => {
					toast.error(e?.message ?? "Failed to submit assets");
				}}
		);
	}

	// mark-as-read handler
	function handleMarkRead() {
		if (!notification?.id) return;
		markRead(
			{ notificationId: notification.id },
			{
				onSuccess: () => {},
				onError: (e: any) => {}}
		);
	}

	useEffect(() => {
		if (!notification?.read_at) {
			handleMarkRead();
		}
	}, [notification]);

	return (
		<Modal
			fullScreen={isMobile}
			opened={opened}
			onClose={onClose}
			radius="lg"
			centered
			size="56rem"
			overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
			title={
				<Stack gap={10}>
					<Group gap={5} align="center">
						<IconCircle color={T.colors.blue[3]} size={20} />
						<Text fw={600} size="lg">
							Respond to Asset Request
						</Text>
					</Group>
					<Group gap={6} wrap="wrap">
						<Text fw={600} size="lg">
							{campaignName ? campaignName : "Campaign"} Details
						</Text>
						{campaignCategory && (
							<Badge
								size="xs"
								radius="sm"
								color={
									activityColors[toLower(campaignCategory)]
								}
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
			<Stack gap={30}>
				{/* Campaign Period */}
				<Card radius="md" px="md" py="md" bg={"gray.0"}>
					<Stack gap={15}>
						<Stack gap={5}>
							<Text fw={700} size="sm">
								About this campaign
							</Text>
							<Text size="sm" fw={500} c="gray.6">
								{payload?.description}
							</Text>
						</Stack>

						<Group>
							<Flex gap={10}>
								<Group gap={5} align="center">
									<IconClock size={15} />
									<Text c="gray.6" size="sm">
										Start Date:
									</Text>
								</Group>

								<Text c="blue.3" size="sm" fw={700}>
									{fromDate
										? format(fromDate, "MMM dd, yyyy")
										: "—"}
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
									{fromDate
										? format(toDate, "MMM dd, yyyy")
										: "—"}
								</Text>
							</Flex>
						</Group>
					</Stack>
				</Card>

				{/* Creative picker */}
				<CreativePicker
					creatives={creatives}
					value={selectedCreative}
					onChange={(url) => {
						setSelectedCreative(url);
						setCreativeAnswer(""); // reset answer when switching creative
					}}
					creativeAnswer={creativeAnswer}
					onAnswerChange={setCreativeAnswer}
				/>

				{/* Assets */}
				<Stack gap={8}>
					<Text fw={600} size="lg">
						Complete Your Campaign Setup
					</Text>
					<Group gap={8} align="center">
						<ThemeIcon
							variant="light"
							color="blue.5"
							radius="xl"
							size="sm"
						>
							<IconBox size={14} />
						</ThemeIcon>
						<Text fw={500}>Select Assets</Text>
					</Group>
				</Stack>

				<AssetsPicker value={assetsState} onChange={setAssetsState} />

				{/* Practice note */}
				<Stack gap={6}>
					<Text fw={700} size="sm">
						Additional Notes (Optional)
					</Text>
					<Textarea
						radius="md"
						minRows={3}
						autosize
						value={practiceNote}
						onChange={(e) => setPracticeNote(e.currentTarget.value)}
						placeholder="Add any specific instructions or requirements…"
					/>
				</Stack>

				{/* Estimated Total Cost */}
				<Card
					radius="md"
					px="md"
					py="md"
					bg={"gray.0"}
					pos={"sticky"}
					bottom={20}
					withBorder
					style={{
						borderColor: T.colors.blue[0]}}
				>
					<Group justify="space-between" align="center">
						<Text c="gray.7" fw={600}>
							Estimated Total Cost:
						</Text>
						<Text fw={800} c={"blue.3"}>
							{GBP(estimatedTotal)}
						</Text>
					</Group>
				</Card>

				{/* Footer */}
				<GradientDivider />

				<Flex
					justify="flex-end"
					direction={{ base: "column", sm: "row" }}
					gap="md"
				>
					<Group justify="flex-end">
						<StyledButton variant="default" onClick={onClose}>
							Cancel
						</StyledButton>
						<Button
							loading={submitting}
							disabled={!canSubmit}
							onClick={handleSubmit}
						>
							Submit My Choices
						</Button>
					</Group>
				</Flex>
			</Stack>
		</Modal>
	);
}
