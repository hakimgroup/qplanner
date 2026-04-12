import {
	Modal,
	Stack,
	Group,
	Button,
	TextInput,
	Select,
	Textarea,
	Text,
	useMantineTheme,

	MultiSelect,
} from "@mantine/core";
import { useState, useMemo } from "react";
import { IconBolt } from "@tabler/icons-react";
import { useGodModeUpdateBespokeCampaign } from "@/hooks/godMode.hooks";
import GodModeReasonField from "./GodModeReasonField";
import GradientDivider from "@/components/gradientDivider/GradientDivider";
import GodModeDiffPreview from "./GodModeDiffPreview";
import filtersData from "@/filters.json";

interface Props {
	opened: boolean;
	onClose: () => void;
	bespokeCampaign: any;
	selectionId: string;
}

const CATEGORY_OPTIONS = [
	{ label: "Campaign", value: "Campaign" },
	{ label: "Event", value: "Event" },
];

const arraysEqual = (a: any[] | null | undefined, b: any[] | null | undefined) => {
	if (a === b) return true;
	if (!Array.isArray(a) || !Array.isArray(b)) return false;
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
};

export default function GodModeEditBespokeModal({
	opened,
	onClose,
	bespokeCampaign,
	selectionId,
}: Props) {
	const T = useMantineTheme().colors;
	const { mutate, isPending } = useGodModeUpdateBespokeCampaign();

	const isEvent = bespokeCampaign?.category === "Event";

	const [name, setName] = useState<string>(bespokeCampaign?.name ?? "");
	const [description, setDescription] = useState<string>(
		bespokeCampaign?.description ?? ""
	);
	const [category, setCategory] = useState<string>(
		bespokeCampaign?.category ?? "Campaign"
	);
	const [eventType, setEventType] = useState<string>(
		bespokeCampaign?.event_type ?? ""
	);
	const [requirements, setRequirements] = useState<string>(
		bespokeCampaign?.requirements ?? ""
	);
	const [objectives, setObjectives] = useState<string[]>(
		bespokeCampaign?.objectives ?? []
	);
	const [topics, setTopics] = useState<string[]>(
		bespokeCampaign?.topics ?? []
	);

	const [reason, setReason] = useState<string>("");
	const [confirming, setConfirming] = useState(false);

	const patch = useMemo(() => {
		const p: Record<string, any> = {};
		if ((name || null) !== (bespokeCampaign?.name ?? null)) p.name = name || null;
		if ((description || null) !== (bespokeCampaign?.description ?? null))
			p.description = description || null;
		if (category !== bespokeCampaign?.category) p.category = category;
		if ((eventType || null) !== (bespokeCampaign?.event_type ?? null))
			p.event_type = eventType || null;
		if ((requirements || null) !== (bespokeCampaign?.requirements ?? null))
			p.requirements = requirements || null;
		if (!arraysEqual(objectives, bespokeCampaign?.objectives ?? []))
			p.objectives = objectives;
		if (!arraysEqual(topics, bespokeCampaign?.topics ?? []))
			p.topics = topics;
		return p;
	}, [
		name,
		description,
		category,
		eventType,
		requirements,
		objectives,
		topics,
		bespokeCampaign,
	]);

	const before = useMemo(() => {
		const b: Record<string, any> = {};
		Object.keys(patch).forEach((k) => {
			b[k] = (bespokeCampaign ?? {})[k] ?? null;
		});
		return b;
	}, [patch, bespokeCampaign]);

	const hasChanges = Object.keys(patch).length > 0;

	const handleClose = () => {
		setConfirming(false);
		setReason("");
		onClose();
	};

	const handleSave = () => {
		mutate(
			{
				bespokeCampaignId: bespokeCampaign.id,
				selectionId,
				patch,
				reason,
			},
			{
				onSuccess: () => handleClose(),
			}
		);
	};

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={
				<Group gap={8}>
					<IconBolt size={18} color={T.violet[6]} />
					<Text fw={700} size="md">
						{confirming ? "Confirm Changes" : "Edit Bespoke Campaign"}
					</Text>
				</Group>
			}
			size="lg"
			radius="lg"
			centered
			overlayProps={{ backgroundOpacity: 0.6, blur: 4 }}
		>
			{!confirming ? (
				<Stack gap="md">
					<TextInput
						label="Name"
						value={name}
						onChange={(e) => setName(e.currentTarget.value)}
						radius="md"
						required
					/>

					<Textarea
						label="Description"
						value={description}
						onChange={(e) => setDescription(e.currentTarget.value)}
						autosize
						minRows={2}
						maxRows={5}
						radius="md"
					/>

					<Select
						label="Category"
						data={CATEGORY_OPTIONS}
						value={category}
						onChange={(v) => setCategory(v ?? "Campaign")}
						radius="md"
					/>

					{(category === "Event" || isEvent) && (
						<>
							<TextInput
								label="Event Type"
								value={eventType}
								onChange={(e) => setEventType(e.currentTarget.value)}
								radius="md"
							/>
							<Textarea
								label="Requirements"
								value={requirements}
								onChange={(e) => setRequirements(e.currentTarget.value)}
								autosize
								minRows={2}
								maxRows={5}
								radius="md"
							/>
						</>
					)}

					<MultiSelect
						label="Objectives"
						data={filtersData.objectives}
						value={objectives}
						onChange={setObjectives}
						placeholder="Pick objectives"
						radius="md"
						searchable
						clearable
						nothingFoundMessage="No matches"
					/>

					<MultiSelect
						label="Topics"
						data={filtersData.topics}
						value={topics}
						onChange={setTopics}
						placeholder="Pick topics"
						radius="md"
						searchable
						clearable
						nothingFoundMessage="No matches"
					/>

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
						You are about to change{" "}
						<Text span fw={700}>
							{Object.keys(patch).length}
						</Text>{" "}
						field{Object.keys(patch).length === 1 ? "" : "s"} on this bespoke
						campaign.
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
