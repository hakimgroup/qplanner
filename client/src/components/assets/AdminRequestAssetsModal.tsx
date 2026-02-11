import {
	useRequestAssets,
	useUpdateSourceAssets,
} from "@/hooks/notification.hooks";
import {
	Modal,
	Stack,
	Text,
	Group,
	SimpleGrid,
	Checkbox,
	TextInput,
	ActionIcon,
	Flex,
	Button,
	Card,
	Badge,
	Tooltip,
	useMantineTheme,
	Image, // ⬅️ added
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { startCase } from "lodash";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import StyledButton from "../styledButton/StyledButton";
import { useUpsertCatalogCampaign } from "@/hooks/campaign.hooks";
import { AssetItem, Assets } from "@/models/general.models";
import { AdminModalSelection, Creatives } from "@/models/campaign.models";

type Props = {
	opened: boolean;
	onClose: () => void;
	selection: AdminModalSelection;
};

// Initialize assets state. We KEEP all assets, always visible.
const cloneAssets = (a?: Assets | null): Assets => ({
	printedAssets: (a?.printedAssets ?? []).map((x) => ({
		...x,
		userSelected: x.userSelected ?? false,
		quantity:
			typeof x.quantity === "number" && Number.isFinite(x.quantity)
				? x.quantity
				: 0,
	})),
	digitalAssets: (a?.digitalAssets ?? []).map((x) => ({
		...x,
		userSelected: x.userSelected ?? false,
		quantity:
			typeof x.quantity === "number" && Number.isFinite(x.quantity)
				? x.quantity
				: 0,
	})),
});

/* ----------------------- CHILD COMPONENTS ----------------------- */

function CreativeInputs({
	creatives,
	addCreative,
	removeCreative,
	updateCreativeUrl,
	updateCreativeLabel,
	updateCreativeAssetsLink,
}: {
	creatives: Creatives[];
	addCreative: () => void;
	removeCreative: (idx: number) => void;
	updateCreativeUrl: (idx: number, val: string) => void;
	updateCreativeLabel: (idx: number, val: string) => void;
	updateCreativeAssetsLink: (idx: number, val: string) => void;
}) {
	const hasAnyUrl = creatives.some((c) => c.url?.trim());
	const T = useMantineTheme().colors;

	return (
		<Stack gap={8}>
			<Group justify="space-between" align="center">
				<Text fw={700} size="sm">
					Campaign Creatives
				</Text>

				<Tooltip
					label={`Add ${
						creatives && creatives.length > 0 ? "another" : "a"
					} creative (max 4)`}
					withArrow
					style={{
						border: `1px solid ${T.blue[1]}`,
						color: T.gray[9],
					}}
					bg={"blue.0"}
				>
					<ActionIcon
						variant="light"
						aria-label="add creative"
						onClick={() => {
							addCreative();
						}}
						disabled={creatives.length >= 4}
					>
						<IconPlus size={16} />
					</ActionIcon>
				</Tooltip>
			</Group>

			{/* If we have any URLs, show a preview grid; otherwise show plain inputs */}
			{hasAnyUrl ? (
				<SimpleGrid cols={{ base: 1, sm: 4 }} spacing="sm">
					{creatives.map((item, idx) => (
						<Card
							key={idx}
							withBorder
							radius="md"
							px="md"
							py="sm"
							shadow="xs"
							mah={420}
							style={{ borderColor: T.blue[1] }}
						>
							<Stack gap={8}>
								<Group justify="space-between" align="center">
									<Text size="xs" fw={600} c="indigo.9">
										{item.label?.trim() ||
											`Creative ${idx + 1}`}
									</Text>
									{creatives.length > 1 && (
										<ActionIcon
											color="red"
											variant="subtle"
											aria-label="remove creative"
											onClick={() => removeCreative(idx)}
										>
											<IconTrash size={16} />
										</ActionIcon>
									)}
								</Group>

								{item.url?.trim() && (
									<Image
										src={item.url}
										radius="sm"
										height={160}
										alt={
											item.label?.trim() ||
											`Creative ${idx + 1}`
										}
									/>
								)}

								<TextInput
									label={
										<Text size="xs" fw={500} c="gray.7">
											Name
										</Text>
									}
									placeholder={`Creative ${idx + 1}`}
									value={item.label || ""}
									onChange={(e) =>
										updateCreativeLabel(
											idx,
											e.currentTarget.value
										)
									}
									radius="md"
								/>

								<TextInput
									label={
										<Text size="xs" fw={500} c="gray.7">
											Image URL
										</Text>
									}
									placeholder="https://image-url-or-asset.jpg"
									value={item.url}
									onChange={(e) =>
										updateCreativeUrl(
											idx,
											e.currentTarget.value
										)
									}
									radius="md"
								/>

								<TextInput
									label={
										<Text size="xs" fw={500} c="gray.7">
											Assets Link
										</Text>
									}
									placeholder="https://assets-link (optional)"
									value={item.assets_link || ""}
									onChange={(e) =>
										updateCreativeAssetsLink(
											idx,
											e.currentTarget.value
										)
									}
									radius="md"
								/>
							</Stack>
						</Card>
					))}
				</SimpleGrid>
			) : (
				<Stack gap={6}>
					{creatives.map((item, idx) => (
						<Group
							key={idx}
							gap={6}
							wrap="nowrap"
							align="flex-end"
							w="100%"
						>
							<TextInput
								placeholder={`Creative ${idx + 1}`}
								value={item.label || ""}
								onChange={(e) =>
									updateCreativeLabel(
										idx,
										e.currentTarget.value
									)
								}
								radius="md"
								style={{ flex: 1, maxWidth: 180 }}
								label={
									<Text size="xs" fw={500} c="gray.7">
										Name
									</Text>
								}
							/>

							<TextInput
								placeholder="https://image-url-or-asset.jpg"
								value={item.url}
								onChange={(e) =>
									updateCreativeUrl(
										idx,
										e.currentTarget.value
									)
								}
								radius="md"
								style={{ flex: 2 }}
								label={
									<Text size="xs" fw={500} c="gray.7">
										Image URL
									</Text>
								}
							/>

							<TextInput
								placeholder="https://assets-link (optional)"
								value={item.assets_link || ""}
								onChange={(e) =>
									updateCreativeAssetsLink(
										idx,
										e.currentTarget.value
									)
								}
								radius="md"
								style={{ flex: 2 }}
								label={
									<Text size="xs" fw={500} c="gray.7">
										Assets Link
									</Text>
								}
							/>

							{creatives.length > 1 && (
								<ActionIcon
									color="red"
									variant="subtle"
									aria-label="remove creative"
									onClick={() => removeCreative(idx)}
								>
									<IconTrash size={16} />
								</ActionIcon>
							)}
						</Group>
					))}
				</Stack>
			)}

			<Text size="xs" c="gray.6">
				These will be shown to the practice. They'll choose one.
			</Text>
		</Stack>
	);
}

function AssetCard({
	item,
	section,
	toggleRequestAsset,
}: {
	item: AssetItem;
	section: keyof Assets;
	toggleRequestAsset: (
		section: keyof Assets,
		name: string,
		checked: boolean
	) => void;
}) {
	const T = useMantineTheme().colors;
	const selected = item.userSelected;

	const getDescriptor = (it: AssetItem): string => {
		switch (it.type) {
			case "default": {
				if (
					it.price !== null &&
					it.price !== "" &&
					!Number.isNaN(Number(it.price))
				) {
					const unit =
						it.suffix && it.suffix.trim().length > 0
							? it.suffix
							: "";
					return `£${it.price} ${unit}`;
				}
				return "Price on request";
			}
			case "card": {
				if (it.options && it.options.length > 0) {
					const sorted = [...it.options].sort(
						(a, b) => (a.value ?? 0) - (b.value ?? 0)
					);
					const cheapest = sorted[0];
					const valueDisplay =
						cheapest.value != null && !Number.isNaN(cheapest.value)
							? `£${cheapest.value}`
							: "£—";
					return cheapest.label
						? `From ${valueDisplay} (${cheapest.label})`
						: `From ${valueDisplay}`;
				}
				return "Price on request";
			}
			case "free":
				return "Free";
			case "external": {
				if (
					it.price !== null &&
					it.price !== "" &&
					!Number.isNaN(Number(it.price))
				) {
					if (it.suffix && it.suffix.trim().length > 0) {
						return `£${it.price} ${it.suffix}`;
					}
					return `£${it.price}`;
				}
				return "External / quoted";
			}
			default: {
				if (
					it.price !== null &&
					it.price !== "" &&
					!Number.isNaN(Number(it.price))
				) {
					return `£${it.price}${it.suffix ? ` ${it.suffix}` : ""}`;
				}
				return "Price on request";
			}
		}
	};

	return (
		<Card
			withBorder
			radius={10}
			px="md"
			py="sm"
			style={{
				borderColor: selected ? T.blue[2] : T.gray[1],
				background: selected ? "rgba(107, 123, 255, 0.06)" : "white",
			}}
		>
			<Stack gap={8}>
				<Group justify="space-between" align="flex-start">
					<Stack gap={2} style={{ flex: 1 }}>
						<Text fw={600} size="sm">
							{item.name}
						</Text>

						<Text
							size="xs"
							fw={600}
							c={item.type === "free" ? "gray.7" : "indigo"}
						>
							{getDescriptor(item)}
						</Text>

						{item.suffix &&
							item.type !== "default" &&
							item.type !== "external" && (
								<Text size="xs" c="gray.6">
									{item.suffix}
								</Text>
							)}
					</Stack>

					{selected && (
						<Badge variant="light" color="indigo">
							Requested
						</Badge>
					)}
				</Group>

				<Checkbox
					size="xs"
					radius="xl"
					color="blue.3"
					checked={item.userSelected}
					label={<Text size="xs">Request this asset</Text>}
					onChange={(e) =>
						toggleRequestAsset(
							section,
							item.name,
							e.currentTarget.checked
						)
					}
				/>
			</Stack>
		</Card>
	);
}

function PlacementCard({
	p,
	updatePlacementPrice,
	toggleRequestPlacement,
}: {
	p: AssetItem;
	updatePlacementPrice: (name: string, raw: string) => void;
	toggleRequestPlacement: (name: string, checked: boolean) => void;
}) {
	const selected = p.userSelected;
	const T = useMantineTheme().colors;
	return (
		<Card
			withBorder
			radius={10}
			px="md"
			py="sm"
			style={{
				borderColor: selected ? T.blue[2] : T.gray[1],
				background: selected ? "rgba(107, 123, 255, 0.06)" : "white",
			}}
		>
			<Stack gap={8}>
				<Group justify="space-between" align="flex-start">
					<Stack gap={2} style={{ flex: 1 }}>
						<Text fw={600} size="sm">
							{p.name}
						</Text>
						<Text size="xs" c="gray.6">
							{p.suffix || "placement"}
						</Text>
					</Stack>

					{selected && (
						<Badge variant="light" color="indigo">
							Requested
						</Badge>
					)}
				</Group>

				<Stack gap={4}>
					<Text size="xs" fw={500} c="gray.7">
						Price (£):
					</Text>
					<TextInput
						radius="md"
						size="xs"
						value={p.price ?? ""}
						placeholder="e.g. 150"
						onChange={(e) =>
							updatePlacementPrice(p.name, e.currentTarget.value)
						}
						styles={{
							input: { maxWidth: 90 },
						}}
					/>
				</Stack>

				<Checkbox
					size="xs"
					radius="xl"
					color="blue.3"
					checked={p.userSelected}
					label={<Text size="xs">Request this placement</Text>}
					onChange={(e) =>
						toggleRequestPlacement(p.name, e.currentTarget.checked)
					}
				/>
			</Stack>
		</Card>
	);
}

/* ----------------------- MAIN MODAL COMPONENT ----------------------- */

export default function AdminRequestAssetsModal({
	opened,
	onClose,
	selection,
}: Props) {
	// editable asset state
	const [assetsState, setAssetsState] = useState<Assets>(() =>
		cloneAssets(selection.assets)
	);

	// creatives (up to 4 {url,label,assets_link})
	const defaultCreatives = [{ url: "", label: "", assets_link: "" }];
	const [creatives, setCreatives] = useState<Creatives[]>(
		selection.creatives ?? defaultCreatives
	);

	/** ⬇️ New: toggle to switch to catalog update mode */
	const applyToCatalog = selection.campaign_id;

	const catalogId = selection?.campaign_id ?? null;

	const { mutate: updateAssets, isPending: savingAssets } =
		useUpdateSourceAssets();
	const { mutate: requestAssets, isPending: requesting } = useRequestAssets();

	const { mutate: upsertCatalog, isPending: savingCatalog } =
		useUpsertCatalogCampaign();

	// Creatives handlers
	const addCreative = () => {
		if (creatives.length >= 4) return;
		setCreatives((l) => [...l, { url: "", label: "", assets_link: "" }]);
	};

	const removeCreative = (idx: number) => {
		setCreatives((l) => l.filter((_, i) => i !== idx));
	};

	const updateCreativeUrl = (idx: number, val: string) => {
		setCreatives((l) => {
			const c = [...l];
			c[idx] = { ...c[idx], url: val };
			return c;
		});
	};

	const updateCreativeLabel = (idx: number, val: string) => {
		setCreatives((l) => {
			const c = [...l];
			c[idx] = { ...c[idx], label: val };
			return c;
		});
	};

	const updateCreativeAssetsLink = (idx: number, val: string) => {
		setCreatives((l) => {
			const c = [...l];
			c[idx] = { ...c[idx], assets_link: val };
			return c;
		});
	};

	// Toggle for Printed / Digital assets
	const toggleRequestAsset = (
		section: keyof Assets,
		name: string,
		checked: boolean
	) => {
		setAssetsState((prev) => ({
			...prev,
			[section]: prev[section].map((it) =>
				it.name === name ? { ...it, userSelected: checked } : it
			),
		}));
	};

	// (external placements code removed in this variant)
	const updatePlacementPrice = (_name: string, _raw: string) => {};
	const toggleRequestPlacement = (_name: string, _checked: boolean) => {};

	// Derived sets for rendering
	const printedAssets = assetsState.printedAssets;
	const digitalAssets = assetsState.digitalAssets;

	// Validation for submission
	const hasAnyCreative = useMemo(
		() => creatives.map((c) => c.url.trim()).filter(Boolean).length > 0,
		[creatives]
	);

	const hasAnyRequested = useMemo(() => {
		const anySelected = (arr: AssetItem[]) =>
			arr.some((it) => it.userSelected);
		return anySelected(printedAssets) || anySelected(digitalAssets);
	}, [printedAssets, digitalAssets]);

	// In "catalog" mode, allow saving even with no requested assets (you may be templating)
	const canSubmit = applyToCatalog
		? !savingCatalog
		: hasAnyCreative && hasAnyRequested && !savingAssets && !requesting;

	// Submit flow:
	const handleSubmit = () => {
		const cleanedCreatives = creatives
			.filter((c) => c.url.trim())
			.slice(0, 4)
			.map((c, idx) => ({
				url: c.url.trim(),
				label: c.label?.trim() || `Creative ${idx + 1}`,
				assets_link: c.assets_link?.trim() || null,
			}));

		if (applyToCatalog) {
			if (!catalogId) {
				toast.error("Missing campaign (catalog) id");
				return;
			}
			upsertCatalog(
				{
					id: catalogId,
					assets: assetsState, // campaigns_catalog.assets
					creatives: cleanedCreatives, // campaigns_catalog.creatives
				},
				{
					onSuccess: () => {
						toast.success("Campaign template updated");
						onClose();
					},
					onError: (e: any) => {
						toast.error(
							e?.message ?? "Failed to update campaign template"
						);
					},
				}
			);
			return;
		}

		// --- Selection mode (original flow) ---
		updateAssets(
			{
				selectionId: selection.id,
				isBespoke: !!selection.isBespoke,
				bespokeCampaignId: selection.bespoke_campaign_id ?? null,
				assets: assetsState,
			},
			{
				onSuccess: () => {
					requestAssets(
						{
							selectionId: selection.id,
							creativeUrls: cleanedCreatives,
							note: null,
						},
						{
							onSuccess: () => {
								onClose();
							},
							onError: (e: any) => {
								toast.error(
									e?.message ??
										"Failed to send notification to practice"
								);
							},
						}
					);
				},
				onError: (e: any) => {
					toast.error(
						e?.message ?? "Failed to save requested assets"
					);
				},
			}
		);
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={
				<Text fw={600} size="sm">
					Request Assets
					{selection.name ? ` — ${selection.name}` : ""}
				</Text>
			}
			size="56rem"
			radius="lg"
			centered
			overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
		>
			<Stack gap="lg">
				<Stack gap={5}>
					<Text size="sm" fw={500} c={"blue.3"}>
						Objectives
					</Text>
					{selection?.objectives?.length ? (
						<Flex align={"center"} gap={4}>
							{selection?.objectives?.map((c) => (
								<Badge key={c} color="red.4">
									{startCase(c)}
								</Badge>
							))}
						</Flex>
					) : (
						<Text>-</Text>
					)}
				</Stack>

				<Stack gap={5}>
					<Text size="sm" fw={500} c={"blue.3"}>
						Categories
					</Text>
					<Flex align={"center"} gap={4}>
						{selection?.topics?.map((c) => (
							<Badge key={c} variant="outline" color="gray.1">
								<Text size="xs" fw={600} c={"gray.9"}>
									{startCase(c)}
								</Text>
							</Badge>
						))}
					</Flex>
				</Stack>

				{/* Creatives section */}
				<CreativeInputs
					creatives={creatives}
					addCreative={addCreative}
					removeCreative={removeCreative}
					updateCreativeUrl={updateCreativeUrl}
					updateCreativeLabel={updateCreativeLabel}
					updateCreativeAssetsLink={updateCreativeAssetsLink}
				/>

				{/* Printed Assets */}
				<Stack gap={8}>
					<Text fw={700} size="sm">
						Printed Assets
					</Text>

					<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
						{printedAssets.length === 0 && (
							<Text size="xs" c="gray.6">
								No printed assets available
							</Text>
						)}

						{printedAssets.map((it, idx) => (
							<AssetCard
								key={`printed-${idx}`}
								item={it}
								section="printedAssets"
								toggleRequestAsset={toggleRequestAsset}
							/>
						))}
					</SimpleGrid>
				</Stack>

				{/* Digital Assets */}
				<Stack gap={8}>
					<Text fw={700} size="sm">
						Digital Assets
					</Text>

					<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
						{digitalAssets.length === 0 && (
							<Text size="xs" c="gray.6">
								No digital assets available
							</Text>
						)}

						{digitalAssets.map((it, idx) => (
							<AssetCard
								key={`digital-${idx}`}
								item={it}
								section="digitalAssets"
								toggleRequestAsset={toggleRequestAsset}
							/>
						))}
					</SimpleGrid>
				</Stack>

				{/* Footer actions */}
				<Group justify="flex-end" align="center">
					<StyledButton variant="default" c="red.4" onClick={onClose}>
						Cancel
					</StyledButton>
					<Button
						onClick={handleSubmit}
						loading={
							applyToCatalog
								? savingCatalog
								: savingAssets || requesting
						}
						disabled={!canSubmit}
					>
						{applyToCatalog
							? "Save to Campaign Template"
							: "Send Request"}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
