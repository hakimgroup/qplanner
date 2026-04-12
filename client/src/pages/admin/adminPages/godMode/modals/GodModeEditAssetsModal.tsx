import {
	Modal,
	Stack,
	Group,
	Button,
	TextInput,
	Text,
	useMantineTheme,

	Box,
	ActionIcon,
	Checkbox,
	rgba,
	Tabs,
	NumberInput,
	Select,
	ScrollArea,
} from "@mantine/core";
import { useState, useMemo } from "react";
import { IconBolt, IconPlus, IconTrash } from "@tabler/icons-react";
import { useGodModeUpdateSelection } from "@/hooks/godMode.hooks";
import GodModeReasonField from "./GodModeReasonField";
import GradientDivider from "@/components/gradientDivider/GradientDivider";
import GodModeDiffPreview from "./GodModeDiffPreview";

interface Props {
	opened: boolean;
	onClose: () => void;
	selection: any;
}

type AssetItem = {
	name: string;
	price: number | string | null;
	quantity: number | null;
	suffix: string | null;
	type: string;
	userSelected: boolean;
	adminRequested?: boolean;
	note?: string | null;
};

const blankItem: AssetItem = {
	name: "",
	price: null,
	quantity: 1,
	suffix: null,
	type: "default",
	userSelected: false,
};

const TYPE_OPTIONS = [
	{ label: "Default", value: "default" },
	{ label: "Card", value: "card" },
	{ label: "Free", value: "free" },
	{ label: "External", value: "external" },
];

export default function GodModeEditAssetsModal({
	opened,
	onClose,
	selection,
}: Props) {
	const T = useMantineTheme().colors;
	const { mutate, isPending } = useGodModeUpdateSelection();

	const initialAssets = selection?.assets ?? {};

	const [chosenCreative, setChosenCreative] = useState<string>(
		initialAssets?.creative ?? ""
	);
	const [printedAssets, setPrintedAssets] = useState<AssetItem[]>(
		initialAssets?.printedAssets ?? []
	);
	const [digitalAssets, setDigitalAssets] = useState<AssetItem[]>(
		initialAssets?.digitalAssets ?? []
	);
	const [externalPlacements, setExternalPlacements] = useState<AssetItem[]>(
		initialAssets?.externalPlacements ?? []
	);
	const [note, setNote] = useState<string>(initialAssets?.note ?? "");

	const [reason, setReason] = useState<string>("");
	const [confirming, setConfirming] = useState(false);

	const newAssetsObject = useMemo(() => {
		const obj: Record<string, any> = {
			...initialAssets,
			printedAssets,
			digitalAssets,
			externalPlacements,
		};
		if (chosenCreative) obj.creative = chosenCreative;
		else delete obj.creative;
		if (note) obj.note = note;
		else delete obj.note;
		return obj;
	}, [
		initialAssets,
		printedAssets,
		digitalAssets,
		externalPlacements,
		chosenCreative,
		note,
	]);

	const patch = useMemo(() => {
		const before = JSON.stringify(initialAssets ?? {});
		const after = JSON.stringify(newAssetsObject);
		if (before === after) return {};
		return { assets: newAssetsObject };
	}, [initialAssets, newAssetsObject]);

	const before = useMemo(() => {
		if (!("assets" in patch)) return {};
		return { assets: initialAssets };
	}, [patch, initialAssets]);

	const hasChanges = Object.keys(patch).length > 0;

	const handleClose = () => {
		setConfirming(false);
		setReason("");
		onClose();
	};

	const handleSave = () => {
		mutate(
			{
				selectionId: selection.id,
				patch,
				reason,
			},
			{ onSuccess: () => handleClose() }
		);
	};

	const updateItem = (
		section: "printed" | "digital" | "external",
		idx: number,
		updates: Partial<AssetItem>
	) => {
		const setters = {
			printed: setPrintedAssets,
			digital: setDigitalAssets,
			external: setExternalPlacements,
		};
		const arrs = {
			printed: printedAssets,
			digital: digitalAssets,
			external: externalPlacements,
		};
		const next = arrs[section].map((it, i) =>
			i === idx ? { ...it, ...updates } : it
		);
		setters[section](next);
	};

	const removeItem = (
		section: "printed" | "digital" | "external",
		idx: number
	) => {
		const setters = {
			printed: setPrintedAssets,
			digital: setDigitalAssets,
			external: setExternalPlacements,
		};
		const arrs = {
			printed: printedAssets,
			digital: digitalAssets,
			external: externalPlacements,
		};
		setters[section](arrs[section].filter((_, i) => i !== idx));
	};

	const addItem = (section: "printed" | "digital" | "external") => {
		const setters = {
			printed: setPrintedAssets,
			digital: setDigitalAssets,
			external: setExternalPlacements,
		};
		const arrs = {
			printed: printedAssets,
			digital: digitalAssets,
			external: externalPlacements,
		};
		setters[section]([...arrs[section], { ...blankItem }]);
	};

	const renderItems = (
		section: "printed" | "digital" | "external",
		items: AssetItem[]
	) => (
		<Stack gap="sm">
			{items.length === 0 && (
				<Text size="sm" c="gray.6" ta="center" py="md">
					No items.
				</Text>
			)}
			{items.map((it, idx) => (
				<Box
					key={`${section}-${idx}`}
					p="sm"
					style={{
						background: rgba(T.gray[0], 0.7),
						borderRadius: 10,
						border: `1px solid ${T.gray[2]}`,
					}}
				>
					<Stack gap={8}>
						<Group gap={6} align="flex-end" wrap="nowrap">
							<TextInput
								label="Name"
								value={it.name}
								onChange={(e) =>
									updateItem(section, idx, { name: e.currentTarget.value })
								}
								radius="md"
								size="xs"
								style={{ flex: 2 }}
							/>
							<NumberInput
								label="Price"
								value={(it.price as any) ?? ""}
								onChange={(v) =>
									updateItem(section, idx, { price: v as any })
								}
								radius="md"
								size="xs"
								style={{ flex: 1 }}
								allowNegative={false}
							/>
							<NumberInput
								label="Qty"
								value={(it.quantity as any) ?? ""}
								onChange={(v) =>
									updateItem(section, idx, {
										quantity: (v as any) ?? null,
									})
								}
								radius="md"
								size="xs"
								style={{ flex: 0.7 }}
								allowNegative={false}
							/>
							<ActionIcon
								color="red"
								variant="subtle"
								onClick={() => removeItem(section, idx)}
								aria-label="remove"
							>
								<IconTrash size={14} />
							</ActionIcon>
						</Group>
						<Group gap={6} wrap="nowrap" align="flex-end">
							<TextInput
								label="Suffix"
								value={it.suffix ?? ""}
								onChange={(e) =>
									updateItem(section, idx, {
										suffix: e.currentTarget.value || null,
									})
								}
								radius="md"
								size="xs"
								style={{ flex: 1 }}
								placeholder="e.g. per unit"
							/>
							<Select
								label="Type"
								data={TYPE_OPTIONS}
								value={it.type}
								onChange={(v) => updateItem(section, idx, { type: v ?? "default" })}
								radius="md"
								size="xs"
								style={{ flex: 1 }}
							/>
						</Group>
						<Group gap="lg">
							<Checkbox
								label={<Text size="xs">User selected</Text>}
								checked={!!it.userSelected}
								onChange={(e) =>
									updateItem(section, idx, {
										userSelected: e.currentTarget.checked,
									})
								}
								size="xs"
								color="blue"
							/>
							<Checkbox
								label={<Text size="xs">Admin requested</Text>}
								checked={!!it.adminRequested}
								onChange={(e) =>
									updateItem(section, idx, {
										adminRequested: e.currentTarget.checked,
									})
								}
								size="xs"
								color="orange"
							/>
						</Group>
					</Stack>
				</Box>
			))}
			<Button
				variant="light"
				color="violet"
				size="xs"
				leftSection={<IconPlus size={14} />}
				onClick={() => addItem(section)}
			>
				Add item
			</Button>
		</Stack>
	);

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={
				<Group gap={8}>
					<IconBolt size={18} color={T.violet[6]} />
					<Text fw={700} size="md">
						{confirming ? "Confirm Asset Changes" : "Edit Assets"}
					</Text>
				</Group>
			}
			size="xl"
			radius="lg"
			centered
			overlayProps={{ backgroundOpacity: 0.6, blur: 4 }}
		>
			{!confirming ? (
				<Stack gap="md">
					<TextInput
						label="Chosen Creative URL"
						description="The URL of the creative the practice picked. Leave blank to clear."
						value={chosenCreative}
						onChange={(e) => setChosenCreative(e.currentTarget.value)}
						placeholder="https://..."
						radius="md"
					/>

					<TextInput
						label="Asset Note"
						value={note}
						onChange={(e) => setNote(e.currentTarget.value)}
						placeholder="Optional note about the assets"
						radius="md"
					/>

					<Tabs defaultValue="printed" color="violet" variant="pills" radius="md">
						<Tabs.List>
							<Tabs.Tab value="printed">
								Printed ({printedAssets.length})
							</Tabs.Tab>
							<Tabs.Tab value="digital">
								Digital ({digitalAssets.length})
							</Tabs.Tab>
							<Tabs.Tab value="external">
								External ({externalPlacements.length})
							</Tabs.Tab>
						</Tabs.List>

						<ScrollArea.Autosize mah={400} mt="md">
							<Tabs.Panel value="printed">
								{renderItems("printed", printedAssets)}
							</Tabs.Panel>
							<Tabs.Panel value="digital">
								{renderItems("digital", digitalAssets)}
							</Tabs.Panel>
							<Tabs.Panel value="external">
								{renderItems("external", externalPlacements)}
							</Tabs.Panel>
						</ScrollArea.Autosize>
					</Tabs>

					<GradientDivider />

					<Group justify="space-between">
						<Button variant="subtle" color="gray" onClick={handleClose}>
							Cancel
						</Button>
						<Button
							color="violet"
							disabled={!hasChanges}
							onClick={() => setConfirming(true)}
						>
							Review Changes
						</Button>
					</Group>
				</Stack>
			) : (
				<Stack gap="md">
					<Text size="sm" c="gray.7">
						You are about to update the entire <strong>assets</strong> object
						on this selection.
					</Text>

					<GodModeDiffPreview before={before} after={patch} />

					<GodModeReasonField value={reason} onChange={setReason} />

					<GradientDivider />

					<Group justify="space-between">
						<Button
							variant="subtle"
							color="gray"
							onClick={() => setConfirming(false)}
							disabled={isPending}
						>
							Back
						</Button>
						<Button color="violet" loading={isPending} onClick={handleSave}>
							Save Changes
						</Button>
					</Group>
				</Stack>
			)}
		</Modal>
	);
}
