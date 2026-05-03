import {
	Alert,
	Badge,
	Button,
	Card,
	Flex,
	Group,
	Image,
	Modal,
	Stack,
	Text,
	Textarea,
	ThemeIcon,
	useMantineTheme,
} from "@mantine/core";
import {
	IconBox,
	IconBrush,
	IconCheck,
	IconClock,
	IconInfoCircle,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { activityColors } from "@/shared/shared.const";
import { toLower } from "lodash";
import { Assets } from "@/models/campaign.models";
import { useIsMobile } from "@/shared/shared.hooks";
import StyledButton from "@/components/styledButton/StyledButton";
import GradientDivider from "@/components/gradientDivider/GradientDivider";
import AssetsPicker, {
	AssetsState,
	buildFinalAssets,
	calcEstimatedTotal,
	hasAnySelectedAsset,
	initAssetsState,
	initAssetsStatePreselected,
} from "@/components/assets/AssetsPicker";
import CreativePicker, {
	CreativeItem,
} from "@/pages/notificationsCenter/practiceRespondModal/CreativePicker";

export type SubmitChoicesResult = {
	chosenCreative: string | null;
	creativeAnswer: string | null;
	finalAssets: any;
	note: string | null;
};

interface Props {
	opened: boolean;
	onClose: () => void;

	// Header
	title: string;
	subtitle?: string;
	category?: string | null;
	description?: string | null;
	fromDate?: Date | string | null;
	toDate?: Date | string | null;

	// Body
	assets: Assets | undefined;
	creatives?: CreativeItem[];
	// Read-only brand creative shown when no picker is offered (e.g. bespoke flows).
	defaultCreative?: { url: string; label?: string };
	preselectAssets?: boolean;
	initialNote?: string;

	// Actions
	loading?: boolean;
	submitLabel?: string;
	onSubmit: (result: SubmitChoicesResult) => void;
}

export default function SubmitChoicesModal({
	opened,
	onClose,
	title,
	subtitle,
	category,
	description,
	fromDate,
	toDate,
	assets,
	creatives = [],
	defaultCreative,
	preselectAssets = false,
	initialNote = "",
	loading = false,
	submitLabel = "Submit Campaign",
	onSubmit,
}: Props) {
	const T = useMantineTheme();
	const isMobile = useIsMobile();

	const [assetsState, setAssetsState] = useState<AssetsState>(() =>
		preselectAssets
			? initAssetsStatePreselected(assets)
			: initAssetsState(assets),
	);
	const [selectedCreative, setSelectedCreative] = useState<string | null>(null);
	const [creativeAnswer, setCreativeAnswer] = useState<string>("");
	const [note, setNote] = useState<string>(initialNote);

	useEffect(() => {
		if (!opened) return;
		setAssetsState(
			preselectAssets
				? initAssetsStatePreselected(assets)
				: initAssetsState(assets),
		);
		setSelectedCreative(null);
		setCreativeAnswer("");
		setNote(initialNote);
	}, [opened, assets, preselectAssets, initialNote]);

	const showCreativePicker = creatives.length > 0;
	const creativeRequired = showCreativePicker;
	const creativeIsChosen = !creativeRequired || !!selectedCreative;
	const selectedCreativeObj = creatives.find((c) => c.url === selectedCreative);
	const questionAnswered =
		!selectedCreativeObj?.question || !!creativeAnswer.trim();

	const estimatedTotal = useMemo(
		() => calcEstimatedTotal(assetsState),
		[assetsState],
	);
	const anySelected = useMemo(
		() => hasAnySelectedAsset(assetsState),
		[assetsState],
	);

	const canSubmit =
		creativeIsChosen && questionAnswered && anySelected && !loading;

	const formatDate = (d: Date | string | null | undefined) => {
		if (!d) return "—";
		try {
			return format(d, "MMM dd, yyyy");
		} catch {
			return "—";
		}
	};

	const handleSubmit = () => {
		const finalAssets = buildFinalAssets(assetsState, creativeAnswer);
		onSubmit({
			chosenCreative: selectedCreative ?? null,
			creativeAnswer: creativeAnswer.trim() || null,
			finalAssets,
			note: note.trim() || null,
		});
	};

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
					<Group gap={6} wrap="wrap">
						<Text fw={600} size="lg">
							{title}
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
					{subtitle && (
						<Text size="sm" c="gray.6">
							{subtitle}
						</Text>
					)}
				</Stack>
			}
		>
			<Stack gap={25}>
				{/* Campaign Period / Description */}
				{(description || fromDate || toDate) && (
					<Card radius="md" px="md" py="md" bg="gray.0">
						<Stack gap={15}>
							{description && (
								<Stack gap={5}>
									<Text fw={700} size="sm">
										About this campaign
									</Text>
									<Text size="sm" fw={500} c="gray.6">
										{description}
									</Text>
								</Stack>
							)}

							{(fromDate || toDate) && (
								<Group>
									<Flex gap={10}>
										<Group gap={5} align="center">
											<IconClock size={15} />
											<Text c="gray.6" size="sm">
												Start Date:
											</Text>
										</Group>
										<Text c="blue.3" size="sm" fw={700}>
											{formatDate(fromDate)}
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
											{formatDate(toDate)}
										</Text>
									</Flex>
								</Group>
							)}
						</Stack>
					</Card>
				)}

				{/* Creative picker (catalog only) */}
				{showCreativePicker && (
					<CreativePicker
						creatives={creatives}
						value={selectedCreative}
						onChange={(url) => {
							setSelectedCreative(url);
							setCreativeAnswer("");
						}}
						creativeAnswer={creativeAnswer}
						onAnswerChange={setCreativeAnswer}
					/>
				)}

				{/* Read-only default creative (bespoke flows) */}
				{!showCreativePicker && defaultCreative && (
					<Stack gap="xs">
						<Group gap={8} align="center">
							<ThemeIcon variant="light" color="blue.5" radius="xl" size="sm">
								<IconBrush size={14} />
							</ThemeIcon>
							<Text fw={500}>Creative</Text>
						</Group>
						<Card
							withBorder
							radius="md"
							p="sm"
							style={{ borderColor: T.colors.blue[1] }}
						>
							<Group gap="md" align="center" wrap="nowrap">
								<Image
									src={defaultCreative.url}
									alt={defaultCreative.label ?? "Brand creative"}
									radius="sm"
									h={70}
									w={100}
									fit="cover"
								/>
								<Stack gap={2} style={{ flex: 1 }}>
									<Text size="sm" fw={600}>
										{defaultCreative.label ?? "Brand creative"}
									</Text>
									<Text size="xs" c="gray.6">
										The design team will be in touch with creative options for you to choose from.
									</Text>
								</Stack>
								<Badge size="xs" variant="light" color="blue">
									Auto-applied
								</Badge>
							</Group>
						</Card>
					</Stack>
				)}

				{/* Assets */}
				<Stack gap={8}>
					<Group gap={8} align="center">
						<ThemeIcon variant="light" color="blue.5" radius="xl" size="sm">
							<IconBox size={14} />
						</ThemeIcon>
						<Text fw={500}>
							{preselectAssets
								? "Configure Asset Quantities"
								: "Select Assets"}
						</Text>
					</Group>
					{preselectAssets && (
						<Text size="xs" c="gray.6">
							Adjust quantities or pricing options for the assets you picked.
						</Text>
					)}
				</Stack>

				<AssetsPicker value={assetsState} onChange={setAssetsState} />

				{/* Note */}
				<Stack gap={6}>
					<Text fw={700} size="sm">
						Additional Notes (Optional)
					</Text>
					<Textarea
						radius="md"
						minRows={3}
						autosize
						value={note}
						onChange={(e) => setNote(e.currentTarget.value)}
						placeholder="Add any specific instructions or requirements…"
					/>
				</Stack>

				{/* Estimated Total */}
				<Card
					radius="md"
					px="md"
					py="md"
					bg="gray.0"
					withBorder
					style={{ borderColor: T.colors.blue[0] }}
					pos="sticky"
					bottom={20}
				>
					<Group justify="space-between" align="center">
						<Text c="gray.7" fw={600} size="sm">
							Estimated Total Cost:
						</Text>
						<Text fw={800} c="blue.3">
							£{estimatedTotal.toFixed(2)}
						</Text>
					</Group>
				</Card>

				<Alert
					icon={<IconInfoCircle size={16} />}
					color="blue.3"
					radius={10}
					variant="light"
				>
					<Text size="xs" c="gray.7">
						Submitting goes straight to our design team for production. You'll
						be able to review and approve the artwork once it's ready.
					</Text>
				</Alert>

				<GradientDivider />

				<Flex justify="flex-end" gap={8}>
					<StyledButton onClick={onClose}>Cancel</StyledButton>
					<Button
						loading={loading}
						disabled={!canSubmit}
						onClick={handleSubmit}
						leftSection={<IconCheck size={16} />}
					>
						{submitLabel}
					</Button>
				</Flex>
			</Stack>
		</Modal>
	);
}
