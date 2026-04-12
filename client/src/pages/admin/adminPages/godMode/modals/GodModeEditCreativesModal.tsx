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
	rgba,
	Image,
	ScrollArea,
} from "@mantine/core";
import { useState, useMemo } from "react";
import { IconBolt, IconPlus, IconTrash } from "@tabler/icons-react";
import { useGodModeUpdateSelectionCreatives } from "@/hooks/godMode.hooks";
import GodModeReasonField from "./GodModeReasonField";
import GradientDivider from "@/components/gradientDivider/GradientDivider";
import GodModeDiffPreview from "./GodModeDiffPreview";

interface Props {
	opened: boolean;
	onClose: () => void;
	/** The campaign object (bespoke or catalog) — used to read current creatives */
	campaign: any;
	selectionId: string;
}

type Creative = {
	url: string;
	label?: string | null;
	assets_link?: string | null;
	question?: string | null;
};

const blank: Creative = { url: "", label: "", assets_link: "", question: "" };

export default function GodModeEditCreativesModal({
	opened,
	onClose,
	campaign,
	selectionId,
}: Props) {
	const T = useMantineTheme().colors;
	const { mutate, isPending } = useGodModeUpdateSelectionCreatives();

	const initialCreatives: Creative[] = useMemo(
		() => campaign?.creatives ?? [],
		[campaign],
	);

	const [creatives, setCreatives] = useState<Creative[]>(initialCreatives);
	const [reason, setReason] = useState<string>("");
	const [confirming, setConfirming] = useState(false);

	const cleaned = useMemo(
		() =>
			creatives
				.map((c) => ({
					url: c.url?.trim() ?? "",
					label: c.label?.trim() || null,
					assets_link: c.assets_link?.trim() || null,
					question: c.question?.trim() || null,
				}))
				.filter((c) => c.url),
		[creatives],
	);

	const patch = useMemo(() => {
		const before = JSON.stringify(initialCreatives ?? []);
		const after = JSON.stringify(cleaned);
		if (before === after) return {};
		return { creatives: cleaned };
	}, [initialCreatives, cleaned]);

	const before = useMemo(() => {
		if (!("creatives" in patch)) return {};
		return { creatives: initialCreatives };
	}, [patch, initialCreatives]);

	const hasChanges = Object.keys(patch).length > 0;

	const handleClose = () => {
		setConfirming(false);
		setReason("");
		onClose();
	};

	const handleSave = () => {
		mutate(
			{
				selectionId,
				newCreatives: cleaned,
				reason,
			},
			{ onSuccess: () => handleClose() },
		);
	};

	const update = (idx: number, updates: Partial<Creative>) => {
		setCreatives((prev) =>
			prev.map((c, i) => (i === idx ? { ...c, ...updates } : c)),
		);
	};

	const remove = (idx: number) => {
		setCreatives((prev) => prev.filter((_, i) => i !== idx));
	};

	const add = () => {
		setCreatives((prev) => [...prev, { ...blank }]);
	};

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={
				<Group gap={8}>
					<IconBolt size={18} color={T.violet[6]} />
					<Text fw={700} size="md">
						{confirming
							? "Confirm Creative Changes"
							: "Edit Creatives"}
					</Text>
				</Group>
			}
			size="md"
			radius="md"
			centered
			overlayProps={{ backgroundOpacity: 0.6, blur: 4 }}
		>
			{!confirming ? (
				<Stack gap="md">
					<Text size="xs" c="gray.6">
						Editing creatives here only affects this selection's
						notification payloads — the original campaign template
						is not modified. If the chosen creative's URL matches an
						edited entry, its label will be updated across all
						stages. Empty rows will be removed.
					</Text>

					<ScrollArea.Autosize mah={460}>
						<Stack gap="sm">
							{creatives.length === 0 && (
								<Text size="sm" c="gray.6" ta="center" py="md">
									No creatives yet.
								</Text>
							)}
							{creatives.map((c, idx) => (
								<Box
									key={idx}
									p="sm"
									style={{
										background: rgba(T.grape[0], 0.4),
										borderRadius: 12,
										border: `1px solid ${rgba(T.grape[3], 0.3)}`,
									}}
								>
									<Stack gap={8}>
										<Group
											justify="space-between"
											align="center"
										>
											<Text
												size="xs"
												fw={700}
												c="grape.7"
											>
												Creative #{idx + 1}
											</Text>
											<ActionIcon
												color="red"
												variant="subtle"
												size="sm"
												onClick={() => remove(idx)}
												aria-label="remove"
											>
												<IconTrash size={14} />
											</ActionIcon>
										</Group>

										{c.url && (
											<Image
												src={c.url}
												h={120}
												fit="contain"
												radius="sm"
												alt={
													c.label ||
													`Creative ${idx + 1}`
												}
											/>
										)}

										<TextInput
											label="Image URL"
											value={c.url}
											onChange={(e) =>
												update(idx, {
													url: e.currentTarget.value,
												})
											}
											radius="md"
											size="xs"
											required
										/>
										<TextInput
											label="Label"
											value={c.label ?? ""}
											onChange={(e) =>
												update(idx, {
													label: e.currentTarget
														.value,
												})
											}
											radius="md"
											size="xs"
											placeholder={`Creative ${idx + 1}`}
										/>
										<TextInput
											label="Assets Link"
											value={c.assets_link ?? ""}
											onChange={(e) =>
												update(idx, {
													assets_link:
														e.currentTarget.value,
												})
											}
											radius="md"
											size="xs"
											placeholder="https://... (optional)"
										/>
										<TextInput
											label="Custom Question"
											value={c.question ?? ""}
											onChange={(e) =>
												update(idx, {
													question:
														e.currentTarget.value,
												})
											}
											radius="md"
											size="xs"
											placeholder="Optional question to ask the practice"
										/>
									</Stack>
								</Box>
							))}
						</Stack>
					</ScrollArea.Autosize>

					<Button
						variant="light"
						color="grape"
						leftSection={<IconPlus size={14} />}
						onClick={add}
					>
						Add Creative
					</Button>

					<GradientDivider />

					<Group justify="space-between">
						<Button
							variant="subtle"
							color="gray"
							onClick={handleClose}
						>
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
						You are about to update the creatives across this
						selection's notification payloads.
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
						<Button
							color="violet"
							loading={isPending}
							onClick={handleSave}
						>
							Save Changes
						</Button>
					</Group>
				</Stack>
			)}
		</Modal>
	);
}
