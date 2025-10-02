import {
	Modal,
	Stack,
	TextInput,
	Textarea,
	Select,
	Group,
	Button,
	SimpleGrid,
	Text,
	Flex,
	useMantineTheme,
	ActionIcon,
	Grid,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import filtersData from "@/filters.json";
import { useUpsertCatalogCampaign } from "@/hooks/campaign.hooks";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import StyledButton from "@/components/styledButton/StyledButton";
import { useState } from "react";
import CampaignDates from "@/components/campaignDates/CampaignDates";

type Props = {
	opened: boolean;
	onClose: () => void;
	row?: any | null;
};

export default function CampaignModal({ opened, onClose, row }: Props) {
	const T = useMantineTheme();

	// Reference links state (array of strings)
	const [links, setLinks] = useState<string[]>(
		Array.isArray(row?.reference_links) ? row.reference_links : [""]
	);
	const handleChangeLink = (index: number, value: string) => {
		const copy = [...links];
		copy[index] = value;
		setLinks(copy);
	};
	const handleAddLink = () => setLinks((l) => [...l, ""]);
	const handleRemoveLink = (index: number) =>
		setLinks((l) => l.filter((_, i) => i !== index));

	const form = useForm({
		initialValues: {
			name: row?.name ?? "",
			description: row?.description ?? "",
			category: row?.category ?? "",
			// ⬇️ If no tier present, start with null (not "good")
			tier: row?.tier ?? (null as string | null),
			objectives: row?.objectives ?? [],
			topics: row?.topics ?? [],
			from: row?.availability?.from
				? new Date(row.availability.from)
				: null,
			to: row?.availability?.to ? new Date(row.availability.to) : null,
		},
		validate: {
			name: (v) => (!!v?.trim() ? null : "Required"),
			category: (v) => (!!v ? null : "Required"),
			// ⬇️ Tier is optional now (no validation)
		},
	});

	const { mutate: upsert, isPending } = useUpsertCatalogCampaign();

	const handleSubmit = form.onSubmit((vals) => {
		// strip blank links
		const reference_links = links.map((l) => l.trim()).filter(Boolean);

		upsert(
			{
				id: row?.id ?? null,
				name: vals.name.trim(),
				description: vals.description?.trim() || null,
				category: vals.category,
				// ⬇️ Send null if tier is empty string
				tier: vals.tier ? vals.tier : null,
				objectives: vals.objectives,
				topics: vals.topics,
				availability:
					vals.from && vals.to
						? { from: vals.from, to: vals.to }
						: null,
				reference_links,
			},
			{ onSuccess: onClose }
		);
	});

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={
				<Flex align={"center"} gap={10}>
					<IconPlus color={T.colors.blue[3]} size={21} />
					<Text fz={"h4"} fw={600}>
						{row ? "Edit Campaign" : "Add Campaign"}
					</Text>
				</Flex>
			}
			centered
			radius={10}
			overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
		>
			<form onSubmit={handleSubmit}>
				<Stack gap="md">
					<TextInput
						radius={10}
						label="Name"
						withAsterisk
						{...form.getInputProps("name")}
					/>
					<Textarea
						radius={10}
						label="Description"
						minRows={2}
						autosize
						{...form.getInputProps("description")}
					/>

					<SimpleGrid cols={{ base: 1, sm: 2 }}>
						<Select
							radius={10}
							label="Category"
							withAsterisk
							data={filtersData.categories.map((c: string) => ({
								label: c,
								value: c,
							}))}
							{...form.getInputProps("category")}
						/>
						<Select
							radius={10}
							label="Tier"
							// ⬇️ No asterisk; tier is optional
							placeholder="No tier"
							clearable
							// include an explicit "No tier" option (empty string), plus tiers
							data={[
								{ label: "— No tier —", value: "" },
								{ label: "Good", value: "good" },
								{ label: "Better", value: "better" },
								{ label: "Best", value: "best" },
							]}
							// values may be string | null; treat null as ""
							value={form.values.tier ?? ""}
							onChange={(v) =>
								form.setFieldValue("tier", v || null)
							}
							nothingFoundMessage="No options"
						/>
					</SimpleGrid>

					<CampaignDates
						dateRange={{
							from: form.values.from,
							to: form.values.to,
						}}
						onChange={({ from, to }) => {
							form.setFieldValue("from", from);
							form.setFieldValue("to", to);
						}}
						startLabel="From"
						endLabel="To"
						inputSize="sm"
						gap={20}
					/>

					<Select
						radius={10}
						label="Objectives"
						data={filtersData.objectives}
						multiple
						searchable
						{...form.getInputProps("objectives")}
					/>

					<Select
						radius={10}
						label="Topics"
						data={filtersData.topics}
						multiple
						searchable
						{...form.getInputProps("topics")}
					/>

					{/* Reference Links (multiple) */}
					<Stack gap="xs">
						<Group justify="space-between" align="center">
							<Text fw={500}>Reference Links</Text>
							<StyledButton
								leftSection={<IconPlus size={14} />}
								onClick={handleAddLink}
							>
								Add Link
							</StyledButton>
						</Group>

						{links.map((link, idx) => (
							<Grid key={idx} gutter="xs" align="center">
								<Grid.Col span={links.length > 1 ? 11 : 12}>
									<TextInput
										radius={10}
										placeholder="https://example.com"
										value={link}
										onChange={(e) =>
											handleChangeLink(
												idx,
												e.currentTarget.value
											)
										}
									/>
								</Grid.Col>
								{links.length > 1 && (
									<Grid.Col span={1}>
										<ActionIcon
											color="red"
											variant="subtle"
											onClick={() =>
												handleRemoveLink(idx)
											}
											aria-label="Remove link"
										>
											<IconTrash size={16} />
										</ActionIcon>
									</Grid.Col>
								)}
							</Grid>
						))}
					</Stack>

					<Group justify="flex-end" mt="sm">
						<StyledButton onClick={onClose}>Cancel</StyledButton>
						<Button type="submit" loading={isPending}>
							{row ? "Save changes" : "Create campaign"}
						</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
}
