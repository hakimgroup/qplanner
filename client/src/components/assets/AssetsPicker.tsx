import {
	Card,
	Stack,
	Group,
	Text,
	SimpleGrid,
	Checkbox,
	Badge,
	ActionIcon,
	TextInput,
	Select,
	useMantineTheme,
} from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { AssetItem, AssetOption, Assets } from "@/models/general.models";

export type EditableAsset = AssetItem & {
	chosenOptionLabel?: string | null;
	priceNum?: number | null;
};

export type AssetsState = {
	printedAssets: EditableAsset[];
	digitalAssets: EditableAsset[];
	externalPlacements: EditableAsset[];
};

const normalisePrice = (p: number | string | null | undefined): number | null => {
	if (p === null || p === undefined) return null;
	if (typeof p === "number") return isNaN(p) ? null : p;
	const num = Number(p);
	return isNaN(num) ? null : num;
};

const initBucket = (
	list: AssetItem[] | undefined,
	isExternal = false,
): EditableAsset[] =>
	(list ?? []).map((a) => ({
		...a,
		quantity: isExternal
			? a.quantity && a.quantity > 0
				? a.quantity
				: 1
			: a.quantity && a.quantity > 0
				? a.quantity
				: 0,
		chosenOptionLabel: null,
		priceNum: normalisePrice(a.price),
	}));

export function initAssetsState(baseAssets: Assets | undefined): AssetsState {
	return {
		printedAssets: initBucket(baseAssets?.printedAssets, false),
		digitalAssets: initBucket(baseAssets?.digitalAssets, false),
		externalPlacements: initBucket(baseAssets?.externalPlacements, true),
	};
}

// For catalog flows: keep only assets the admin curated for this campaign.
// The catalog template stores the curation marker as `userSelected: true` on
// each item (the admin's "include this in the practice's choices" flag).
// If no items are flagged in any bucket, fall back to the full set so
// practices aren't presented with an empty picker.
export function filterToAdminCuratedAssets(
	baseAssets: Assets | undefined,
): Assets | undefined {
	if (!baseAssets) return baseAssets;

	const curate = (list: AssetItem[] | undefined): AssetItem[] =>
		(list ?? []).filter((a) => a.userSelected === true);

	const printed = curate(baseAssets.printedAssets);
	const digital = curate(baseAssets.digitalAssets);
	const external = curate(baseAssets.externalPlacements);

	const anyCurated =
		printed.length > 0 || digital.length > 0 || external.length > 0;
	if (!anyCurated) return baseAssets;

	return {
		...baseAssets,
		printedAssets: printed,
		digitalAssets: digital,
		externalPlacements: external,
	};
}

// Mark every non-card item as userSelected with qty 1 — used for bespoke flow
// where the practice has already explicitly checked the assets they want.
export function initAssetsStatePreselected(
	baseAssets: Assets | undefined,
): AssetsState {
	const preselect = (list: EditableAsset[]): EditableAsset[] =>
		list.map((a) => {
			if (a.type === "card") return a;
			const qty = a.quantity && a.quantity > 0 ? a.quantity : 1;
			return { ...a, userSelected: true, quantity: qty };
		});

	const base = initAssetsState(baseAssets);
	return {
		printedAssets: preselect(base.printedAssets),
		digitalAssets: preselect(base.digitalAssets),
		externalPlacements: preselect(base.externalPlacements),
	};
}

export function hasAnySelectedAsset(state: AssetsState): boolean {
	const all = [
		...state.printedAssets,
		...state.digitalAssets,
		...state.externalPlacements,
	];
	return all.some((a) => a.userSelected && (a.quantity ?? 0) > 0);
}

export function calcEstimatedTotal(state: AssetsState): number {
	function lineCost(a: EditableAsset): number {
		if (!a.userSelected) return 0;
		const qty = a.quantity && a.quantity > 0 ? a.quantity : 0;

		if (a.type === "free" && a.price === null) return 0;

		if (a.type === "card") {
			if (a.options && a.options.length > 0) {
				const picked =
					(a.chosenOptionLabel &&
						a.options.find((o) => o.label === a.chosenOptionLabel)) ||
					null;
				if (picked && picked.value != null && !isNaN(picked.value)) {
					return picked.value * qty;
				}
				const sorted = [...a.options].sort(
					(x, y) => (x.value ?? 0) - (y.value ?? 0),
				);
				const cheapest = sorted[0];
				if (cheapest && cheapest.value != null && !isNaN(cheapest.value)) {
					return cheapest.value * qty;
				}
			}
			return 0;
		}

		if (a.priceNum != null) return a.priceNum * qty;
		return 0;
	}

	const all = [
		...state.printedAssets,
		...state.digitalAssets,
		...state.externalPlacements,
	];
	return all.reduce((sum, a) => sum + lineCost(a), 0);
}

export function buildFinalAssets(
	state: AssetsState,
	creativeAnswer?: string | null,
) {
	function mapBucket(list: EditableAsset[]) {
		return list
			.filter((a) => (a.quantity ?? 0) > 0)
			.map((a) => {
				const chosenOpt =
					a.chosenOptionLabel &&
					a.options?.find((o) => o.label === a.chosenOptionLabel);

				return {
					name: a.name,
					type: a.type,
					price: a.priceNum ?? null,
					suffix: a.suffix,
					quantity: a.quantity ?? 0,
					userSelected: a.userSelected,
					chosenOptionLabel: a.chosenOptionLabel ?? null,
					chosenOptionValue:
						chosenOpt && chosenOpt.value != null && !isNaN(chosenOpt.value)
							? chosenOpt.value
							: null,
					options: a.options ?? [],
					note: a.note ?? null,
				};
			});
	}

	const trimmed = creativeAnswer?.trim();
	return {
		printedAssets: mapBucket(state.printedAssets),
		digitalAssets: mapBucket(state.digitalAssets),
		externalPlacements: mapBucket(state.externalPlacements),
		creative_answer: trimmed ? trimmed : null,
	};
}

function describeAssetPrice(a: EditableAsset): string {
	if (a.type === "card") {
		if (a.chosenOptionLabel && a.options && a.options.length > 0) {
			const picked = a.options.find((o) => o.label === a.chosenOptionLabel);
			if (picked && picked.value != null && !isNaN(picked.value)) {
				return `£${picked.value} (${picked.label})`;
			}
		}
		if (a.options && a.options.length > 0) {
			const sorted = [...a.options].sort(
				(x, y) => (x.value ?? 0) - (y.value ?? 0),
			);
			const cheapest = sorted[0];
			if (cheapest) {
				return cheapest.label
					? `From £${cheapest.value} (${cheapest.label})`
					: `From £${cheapest.value}`;
			}
		}
		return "£—";
	}

	if (a.type === "free" && a.price === null) return "Free";

	if (a.priceNum != null) {
		return a.suffix ? `£${a.priceNum} ${a.suffix}` : `£${a.priceNum} each`;
	}
	return "£—";
}

type Props = {
	value: AssetsState;
	onChange: (next: AssetsState) => void;
	showExternal?: boolean;
};

type Bucket = keyof AssetsState;

export default function AssetsPicker({
	value,
	onChange,
	showExternal = false,
}: Props) {
	const T = useMantineTheme();

	function toggleAssetSelected(bucket: Bucket, name: string, checked: boolean) {
		onChange({
			...value,
			[bucket]: value[bucket].map((it) => {
				if (it.name !== name) return it;
				const baseMin = it.type === "external" ? 1 : 0;
				const nextQty =
					checked && (!it.quantity || it.quantity < baseMin)
						? 1
						: it.quantity ?? 0;

				return {
					...it,
					userSelected: checked,
					quantity: checked ? nextQty : 0,
				};
			}),
		});
	}

	function decQty(bucket: Bucket, name: string) {
		onChange({
			...value,
			[bucket]: value[bucket].map((it) => {
				if (it.name !== name) return it;
				const cur = it.quantity ?? 0;
				let next = cur - 1;
				if (next < 0) next = 0;

				if (it.type === "card" && next === 0) {
					return {
						...it,
						quantity: 0,
						userSelected: false,
						chosenOptionLabel: null,
					};
				}
				if (next === 0) {
					return { ...it, quantity: next, userSelected: false };
				}
				return { ...it, quantity: next, userSelected: next > 0 };
			}),
		});
	}

	function incQty(bucket: Bucket, name: string) {
		onChange({
			...value,
			[bucket]: value[bucket].map((it) => {
				if (it.name !== name) return it;
				const cur = it.quantity ?? 0;
				const next = cur + 1;
				return { ...it, quantity: next, userSelected: next > 0 };
			}),
		});
	}

	function chooseOption(bucket: Bucket, name: string, label: string) {
		onChange({
			...value,
			[bucket]: value[bucket].map((it) => {
				if (it.name !== name) return it;
				const nextQty =
					it.quantity && it.quantity > 0 ? it.quantity : 1;
				return {
					...it,
					chosenOptionLabel: label,
					quantity: nextQty,
					userSelected: true,
				};
			}),
		});
	}

	const QuantityRow = ({
		bucket,
		asset,
	}: {
		bucket: Bucket;
		asset: EditableAsset;
	}) => {
		const disableQtyForCard =
			asset.type === "card" && !asset.chosenOptionLabel;

		return (
			<Group justify="space-between" align="center" mt={6}>
				<Text size="sm" c="gray.7" fw={500}>
					{asset.name === "Paid Social Media" ? "No. Of Days:" : "Quantity:"}
				</Text>
				<Group gap={8} align="center">
					<ActionIcon
						variant="subtle"
						aria-label="decrease"
						disabled={disableQtyForCard}
						onClick={() => {
							if (disableQtyForCard) return;
							decQty(bucket, asset.name);
						}}
					>
						<IconMinus size={16} />
					</ActionIcon>
					<TextInput
						value={String(asset.quantity ?? 0)}
						onChange={() => {}}
						readOnly
						w={46}
						ta="center"
						styles={{ input: { textAlign: "center" } }}
					/>
					<ActionIcon
						variant="subtle"
						aria-label="increase"
						disabled={disableQtyForCard}
						onClick={() => {
							if (disableQtyForCard) return;
							incQty(bucket, asset.name);
						}}
					>
						<IconPlus size={16} />
					</ActionIcon>
				</Group>
			</Group>
		);
	};

	const AssetCard = ({
		bucket,
		asset,
	}: {
		bucket: Bucket;
		asset: EditableAsset;
	}) => {
		const selected = asset.userSelected && (asset.quantity ?? 0) > 0;

		return (
			<Card
				withBorder
				radius="md"
				px="md"
				py="sm"
				style={{
					borderColor: selected ? T.colors.blue[2] : T.colors.blue[0],
					background: selected ? "rgba(107,123,255,0.06)" : "white",
				}}
			>
				<Stack gap={8}>
					<Group justify="space-between" align="flex-start">
						<Stack gap={2} style={{ flex: 1 }}>
							<Text fw={600} size="sm">
								{asset.name}
							</Text>
							<Text size="sm" fw={600} c="blue.5" style={{ lineHeight: 1.3 }}>
								{describeAssetPrice(asset)}
							</Text>
						</Stack>
						{selected && (
							<Badge variant="light" color="indigo">
								Selected
							</Badge>
						)}
					</Group>

					{selected && (
						<Checkbox
							size="xs"
							radius="xl"
							color="blue.3"
							checked={asset.userSelected}
							label={
								<Text size="xs">
									{asset.userSelected
										? asset.type === "external"
											? "Remove this placement"
											: "Remove this asset"
										: asset.type === "external"
											? "Book this placement"
											: "Include this asset"}
								</Text>
							}
							onChange={(e) =>
								toggleAssetSelected(bucket, asset.name, e.currentTarget.checked)
							}
						/>
					)}

					{asset.type === "card" &&
						asset.options &&
						asset.options.length > 0 && (
							<Select
								label={
									<Text size="xs" fw={500} c="gray.8">
										Choose an option
									</Text>
								}
								size="xs"
								radius="md"
								value={asset.chosenOptionLabel ?? ""}
								placeholder="Select an option"
								data={asset.options.map((opt: AssetOption) => ({
									value: opt.label,
									label: `${opt.label} — £${opt.value}`,
								}))}
								onChange={(val) => {
									if (val) chooseOption(bucket, asset.name, val);
								}}
							/>
						)}

					<QuantityRow bucket={bucket} asset={asset} />

					{asset?.note && (
						<Text size="xs" fw={600} c="teal.9">
							{asset.note}
						</Text>
					)}
				</Stack>
			</Card>
		);
	};

	const AssetSection = ({
		title,
		bucket,
		list,
	}: {
		title: string;
		bucket: Bucket;
		list: EditableAsset[];
	}) => (
		<Stack gap={8}>
			<Text fw={700} size="sm">
				{title}
			</Text>
			{list.length === 0 ? (
				<Text size="xs" c="gray.6">
					None requested
				</Text>
			) : (
				<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
					{list.map((asset) => (
						<AssetCard
							key={`${bucket}-${asset.name}`}
							bucket={bucket}
							asset={asset}
						/>
					))}
				</SimpleGrid>
			)}
		</Stack>
	);

	return (
		<Stack gap={20}>
			<AssetSection
				title="Printed Assets"
				bucket="printedAssets"
				list={value.printedAssets}
			/>
			<AssetSection
				title="Digital Assets"
				bucket="digitalAssets"
				list={value.digitalAssets}
			/>
			{showExternal && (
				<AssetSection
					title="Additional Placements"
					bucket="externalPlacements"
					list={value.externalPlacements}
				/>
			)}
		</Stack>
	);
}
