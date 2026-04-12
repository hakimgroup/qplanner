import {
	Stack,
	Text,
	SimpleGrid,
	Image,
	Group,
	Badge,
	Box,
	useMantineTheme,
	rgba,
	ThemeIcon,
	Center,
	SegmentedControl,
	Button,
	Anchor,
} from "@mantine/core";
import { useState, useMemo } from "react";
import {
	IconPalette,
	IconPrinter,
	IconDeviceDesktop,
	IconMapPin,
	IconNote,
	IconPhoto,
	IconClockHour3,
	IconExternalLink,
	IconFolderOpen,
	IconEdit,
} from "@tabler/icons-react";
import GodModeEditAssetsModal from "../modals/GodModeEditAssetsModal";
import GodModeEditCreativesModal from "../modals/GodModeEditCreativesModal";
import { GodModeSelectionDetails } from "@/hooks/godMode.hooks";

interface Props {
	data: GodModeSelectionDetails;
}

function Section({
	icon,
	title,
	tint,
	count,
	action,
	children,
}: {
	icon: React.ReactNode;
	title: string;
	tint: string;
	count?: number;
	action?: React.ReactNode;
	children: React.ReactNode;
}) {
	const T = useMantineTheme().colors;
	const palette = T[tint as keyof typeof T] as any;
	return (
		<Box
			p="lg"
			style={{
				background: rgba(palette[0], 0.5),
				borderRadius: 14,
				border: `1px solid ${rgba(palette[3], 0.25)}`,
			}}
		>
			<Group gap={10} mb="md" align="center" justify="space-between">
				<Group gap={10}>
					<ThemeIcon size={32} radius="md" variant="light" color={tint}>
						{icon}
					</ThemeIcon>
					<Text fw={700} size="md" c={`${tint}.8` as any}>
						{title}
					</Text>
				</Group>
				<Group gap={6}>
					{count !== undefined && (
						<Badge variant="light" color={tint} size="md" radius="sm">
							{count}
						</Badge>
					)}
					{action}
				</Group>
			</Group>
			{children}
		</Box>
	);
}

export default function GodModeAssetsTab({ data }: Props) {
	const T = useMantineTheme().colors;
	const sel = data.selection;
	const camp = data.bespoke_campaign ?? data.campaign;
	const assets = sel?.assets ?? camp?.assets ?? {};

	// Prefer creatives from the most recent notification payload (reflects God Mode edits),
	// fall back to the campaign template source.
	const allCreatives = useMemo(() => {
		const notifs = data.notifications ?? [];
		for (let i = notifs.length - 1; i >= 0; i--) {
			const arr = (notifs[i].payload as any)?.creatives;
			if (Array.isArray(arr) && arr.length > 0) return arr;
		}
		return camp?.creatives ?? [];
	}, [data.notifications, camp?.creatives]);

	const allPrinted = assets?.printedAssets ?? [];
	const allDigital = assets?.digitalAssets ?? [];
	const allExternal = assets?.externalPlacements ?? [];

	// Resolve chosen creative URL: prefer selections.assets.creative,
	// otherwise fall back to the latest notification payload that has chosen_creative.
	const chosenCreative = useMemo(() => {
		if (assets?.creative) return assets.creative as string;
		const notifs = data.notifications ?? [];
		// walk newest -> oldest
		for (let i = notifs.length - 1; i >= 0; i--) {
			const cc = (notifs[i].payload as any)?.chosen_creative;
			if (cc) return cc as string;
		}
		// also check assets.creative inside payloads
		for (let i = notifs.length - 1; i >= 0; i--) {
			const cc = (notifs[i].payload as any)?.assets?.creative;
			if (cc) return cc as string;
		}
		return null;
	}, [assets, data.notifications]);

	const [view, setView] = useState<"all" | "selected">("all");
	const isSelectedOnly = view === "selected";

	const [editAssetsOpen, setEditAssetsOpen] = useState(false);
	const [editCreativesOpen, setEditCreativesOpen] = useState(false);
	const isBespoke = !!data.bespoke_campaign;

	// Stage classification for selected-only view
	const status = sel?.status as string | undefined;
	const earlyStage = status === "onPlan" || status === "requested";
	const finalisedStage =
		status === "awaitingApproval" ||
		status === "confirmed" ||
		status === "live" ||
		status === "completed";
	const selectionAssetsLink = sel?.assets_link as string | undefined;

	const filterSelected = (arr: any[]) =>
		arr.filter((a) => a.userSelected || a.adminRequested);

	// Build a deduped pool of creatives across catalog/bespoke + every notification payload.
	// The chosen creative may have been from a payload (admins can edit creatives at request time).
	const creativePool = useMemo(() => {
		const pool: any[] = [...allCreatives];
		const seen = new Set(pool.map((c) => c?.url).filter(Boolean));
		(data.notifications ?? []).forEach((n) => {
			const arr = (n.payload as any)?.creatives;
			if (Array.isArray(arr)) {
				arr.forEach((c: any) => {
					if (c?.url && !seen.has(c.url)) {
						seen.add(c.url);
						pool.push(c);
					}
				});
			}
		});
		return pool;
	}, [allCreatives, data.notifications]);

	const creatives = useMemo(() => {
		if (!isSelectedOnly) return allCreatives;
		if (!chosenCreative) return [];
		const match = creativePool.find((c: any) => c.url === chosenCreative);
		// fall back to a minimal card if we can't find metadata anywhere
		return match
			? [match]
			: [{ url: chosenCreative, label: "Chosen creative" }];
	}, [allCreatives, creativePool, chosenCreative, isSelectedOnly]);

	const printedAssets = useMemo(
		() => (isSelectedOnly ? filterSelected(allPrinted) : allPrinted),
		[allPrinted, isSelectedOnly]
	);
	const digitalAssets = useMemo(
		() => (isSelectedOnly ? filterSelected(allDigital) : allDigital),
		[allDigital, isSelectedOnly]
	);
	const externalPlacements = useMemo(
		() => (isSelectedOnly ? filterSelected(allExternal) : allExternal),
		[allExternal, isSelectedOnly]
	);

	return (
		<Stack gap="lg">
			<Group justify="space-between" align="center">
				<Text size="sm" c="gray.6">
					{isSelectedOnly
						? "Showing only the creative and assets the practice selected."
						: "Showing every available creative and asset for this campaign."}
				</Text>
				<SegmentedControl
					value={view}
					onChange={(v) => setView(v as "all" | "selected")}
					size="xs"
					radius="md"
					color="violet"
					data={[
						{ label: "Show all", value: "all" },
						{ label: "Selected only", value: "selected" },
					]}
				/>
			</Group>
			<Section
				icon={<IconPalette size={18} />}
				title="Creatives"
				tint="grape"
				count={isSelectedOnly && earlyStage ? undefined : creatives.length}
				action={
					<Button
						size="xs"
						variant="light"
						color="grape"
						radius="md"
						leftSection={<IconEdit size={13} />}
						onClick={() => setEditCreativesOpen(true)}
					>
						Edit
					</Button>
				}
			>
				{isSelectedOnly && earlyStage ? (
					<Center py="lg">
						<Stack gap={6} align="center">
							<ThemeIcon
								size={42}
								radius="xl"
								variant="light"
								color="gray"
							>
								<IconClockHour3 size={20} />
							</ThemeIcon>
							<Text size="sm" c="gray.6" ta="center">
								{status === "onPlan"
									? "Nothing has been chosen yet — assets haven't been requested."
									: "Waiting for the practice to submit their selection."}
							</Text>
						</Stack>
					</Center>
				) : creatives.length === 0 ? (
					<Center py="lg">
						<Stack gap={6} align="center">
							<ThemeIcon size={42} radius="xl" variant="light" color="gray">
								<IconPhoto size={20} />
							</ThemeIcon>
							<Text size="sm" c="gray.6">
								No creatives configured.
							</Text>
						</Stack>
					</Center>
				) : (
					<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
						{creatives.map((c: any, idx: number) => {
							const isChosen = c.url && c.url === chosenCreative;
							return (
								<Box
									key={idx}
									style={{
										background: "white",
										borderRadius: 12,
										overflow: "hidden",
										border: isChosen
											? `2px solid ${T.grape[5]}`
											: `1px solid ${rgba(T.grape[3], 0.3)}`,
									}}
								>
									{c.url && (
										<Image
											src={c.url}
											h={150}
											fit="cover"
											alt={c.label || `Creative ${idx + 1}`}
										/>
									)}
									<Stack gap={6} p="sm">
										<Group justify="space-between" align="center">
											<Text size="sm" fw={700} c="gray.9" lineClamp={1}>
												{c.label || `Creative ${idx + 1}`}
											</Text>
											{isChosen && (
												<Badge
													size="xs"
													color="grape"
													variant="filled"
													radius="sm"
												>
													Chosen
												</Badge>
											)}
										</Group>
										{c.assets_link && (
											<Text size="xs" c="teal.7" lineClamp={1}>
												🔗 {c.assets_link}
											</Text>
										)}
										{c.question && (
											<Text size="xs" c="gray.6" fs="italic">
												"{c.question}"
											</Text>
										)}
									</Stack>
								</Box>
							);
						})}
					</SimpleGrid>
				)}
			</Section>

			{isSelectedOnly && finalisedStage && selectionAssetsLink && (
				<Section
					icon={<IconFolderOpen size={18} />}
					title="Final Assets"
					tint="teal"
				>
					<Box
						p="lg"
						style={{
							background: "white",
							borderRadius: 12,
							border: `1px solid ${rgba(T.teal[3], 0.3)}`,
						}}
					>
						<Group justify="space-between" align="center" wrap="wrap">
							<Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
								<Text
									size="xs"
									c="gray.6"
									fw={600}
									tt="uppercase"
									style={{ letterSpacing: 0.4 }}
								>
									Final Assets Folder
								</Text>
								<Anchor
									href={selectionAssetsLink}
									target="_blank"
									rel="noopener noreferrer"
									size="sm"
									c="teal.7"
									fw={500}
									style={{
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										display: "block",
									}}
								>
									{selectionAssetsLink}
								</Anchor>
							</Stack>
							<Button
								component="a"
								href={selectionAssetsLink}
								target="_blank"
								rel="noopener noreferrer"
								size="sm"
								radius="md"
								color="teal"
								leftSection={<IconExternalLink size={14} />}
							>
								Open
							</Button>
						</Group>
					</Box>
				</Section>
			)}

			<Section
				icon={<IconPrinter size={18} />}
				title="Printed Assets"
				tint="orange"
				count={printedAssets.length}
				action={
					<Button
						size="xs"
						variant="light"
						color="orange"
						radius="md"
						leftSection={<IconEdit size={13} />}
						onClick={() => setEditAssetsOpen(true)}
					>
						Edit
					</Button>
				}
			>
				{printedAssets.length === 0 ? (
					<Text size="sm" c="gray.6">
						No printed assets.
					</Text>
				) : (
					<Stack gap={8}>
						{printedAssets.map((a: any, idx: number) => (
							<AssetRow key={`p-${idx}`} item={a} tint="orange" />
						))}
					</Stack>
				)}
			</Section>

			<Section
				icon={<IconDeviceDesktop size={18} />}
				title="Digital Assets"
				tint="cyan"
				count={digitalAssets.length}
				action={
					<Button
						size="xs"
						variant="light"
						color="cyan"
						radius="md"
						leftSection={<IconEdit size={13} />}
						onClick={() => setEditAssetsOpen(true)}
					>
						Edit
					</Button>
				}
			>
				{digitalAssets.length === 0 ? (
					<Text size="sm" c="gray.6">
						No digital assets.
					</Text>
				) : (
					<Stack gap={8}>
						{digitalAssets.map((a: any, idx: number) => (
							<AssetRow key={`d-${idx}`} item={a} tint="cyan" />
						))}
					</Stack>
				)}
			</Section>

			{externalPlacements.length > 0 && (
				<Section
					icon={<IconMapPin size={18} />}
					title="External Placements"
					tint="pink"
					count={externalPlacements.length}
					action={
						<Button
							size="xs"
							variant="light"
							color="pink"
							radius="md"
							leftSection={<IconEdit size={13} />}
							onClick={() => setEditAssetsOpen(true)}
						>
							Edit
						</Button>
					}
				>
					<Stack gap={8}>
						{externalPlacements.map((a: any, idx: number) => (
							<AssetRow key={`e-${idx}`} item={a} tint="pink" />
						))}
					</Stack>
				</Section>
			)}

			{assets?.note && (
				<Section icon={<IconNote size={18} />} title="Asset Note" tint="gray">
					<Text size="sm" c="gray.8">
						{assets.note}
					</Text>
				</Section>
			)}

			<GodModeEditAssetsModal
				opened={editAssetsOpen}
				onClose={() => setEditAssetsOpen(false)}
				selection={sel}
			/>

			{(isBespoke ? data.bespoke_campaign : data.campaign) && (
				<GodModeEditCreativesModal
					opened={editCreativesOpen}
					onClose={() => setEditCreativesOpen(false)}
					campaign={isBespoke ? data.bespoke_campaign : data.campaign}
					selectionId={sel.id}
				/>
			)}
		</Stack>
	);
}

function AssetRow({ item, tint = "gray" }: { item: any; tint?: string }) {
	const T = useMantineTheme().colors;
	const palette = (T as any)[tint] ?? T.gray;
	return (
		<Group
			justify="space-between"
			align="center"
			p="sm"
			style={{
				background: "white",
				borderRadius: 10,
				border: `1px solid ${rgba(palette[3], 0.25)}`,
			}}
			wrap="nowrap"
		>
			<Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
				<Text size="sm" fw={600} c="gray.9" lineClamp={1}>
					{item.name || "—"}
				</Text>
				{item.suffix && (
					<Text size="xs" c="gray.6">
						{item.suffix}
					</Text>
				)}
			</Stack>
			<Group gap={6} wrap="nowrap">
				{item.price !== null && item.price !== undefined && (
					<Badge variant="light" color="indigo" size="sm" radius="sm">
						£{item.price}
					</Badge>
				)}
				{item.userSelected && (
					<Badge variant="light" color="green" size="sm" radius="sm">
						Selected
					</Badge>
				)}
				{item.adminRequested && (
					<Badge variant="light" color="orange" size="sm" radius="sm">
						Requested
					</Badge>
				)}
			</Group>
		</Group>
	);
}
