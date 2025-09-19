import { Colors, statusColors } from "@/shared/shared.const";
import {
	Modal,
	Stack,
	Flex,
	Title,
	Card,
	Group,
	Select,
	Textarea,
	Button,
	useMantineTheme,
	Text,
	SelectProps,
	Badge,
} from "@mantine/core";
import {
	IconEdit,
	IconCalendar,
	IconTrash,
	IconCheck,
	IconCircleFilled,
} from "@tabler/icons-react";
import CampaignDates from "../campaignDates/CampaignDates";
import StyledButton from "../styledButton/StyledButton";
import filterData from "@/filters.json";
import { useEffect, useMemo, useState } from "react";
import {
	differenceInCalendarDays,
	format,
	isValid as isValidDate,
} from "date-fns";
import {
	useUpdateSelection,
	useDeleteSelection,
} from "@/hooks/selection.hooks";
import { toast } from "sonner";
import { SelectionStatus } from "@/shared/shared.models";
import { Campaign } from "@/models/campaign.models";

type DateRange = { from: Date | null; to: Date | null };

interface EditProps {
	opened?: boolean;
	closeModal: () => void;
	/**
	 * Selection to edit. Minimal fields required for update/delete.
	 * Optional campaign fields are used for the header block if present.
	 */
	selection: Campaign;
}

const Edit = ({ opened = false, closeModal, selection: s }: EditProps) => {
	const T = useMantineTheme();

	// ---- Local UI state (dates, status, notes)
	const [campaign, setCampaign] = useState<{ dateRange: DateRange }>({
		dateRange: { from: null, to: null },
	});
	const [statusValue, setStatusValue] = useState<SelectionStatus | null>(
		s?.status ?? SelectionStatus.OnPlan
	);
	const [notes, setNotes] = useState<string>(s?.notes ?? "");

	// Seed state from incoming selection when opened/selection changes
	useEffect(() => {
		if (!s) return;
		const from = s.selection_from_date
			? new Date(s.selection_from_date)
			: null;
		const to = s.selection_to_date ? new Date(s.selection_to_date) : null;
		setCampaign({ dateRange: { from, to } });
		setStatusValue(s.status ?? SelectionStatus.OnPlan);
		setNotes(s.notes ?? "");
	}, [s, opened]);

	// ---- Mutations
	const { mutate: updateSelection, isPending: saving } = useUpdateSelection();
	const { mutate: deleteSelection, isPending: removing } =
		useDeleteSelection();

	// ---- Select option renderer (kept)
	const renderSelectOption: SelectProps["renderOption"] = ({
		option,
		checked,
	}) => (
		<Group gap="xs">
			{checked && (
				<IconCheck style={{ marginInlineStart: "auto" }} size={15} />
			)}
			<IconCircleFilled
				style={{ marginInlineStart: "auto" }}
				size={10}
				color={statusColors[option.value as keyof typeof statusColors]}
			/>
			{option.label}
		</Group>
	);

	// ---- Header chip examples (kept, but derive from selection if provided)
	const Objectives = () => {
		const items = s.objectives?.length ? s.objectives : ["AOV", "Sales"];
		return (
			<Flex align={"center"} gap={4}>
				{items.map((c) => (
					<Badge key={c} color="red.4">
						{c}
					</Badge>
				))}
			</Flex>
		);
	};

	const Topics = () => {
		const items = s.topics?.length ? s.topics : ["Kids", "Clinical"];
		return (
			<Flex align={"center"} gap={4}>
				{items.map((c) => (
					<Badge key={c} variant="outline" color="gray.1">
						<Text size="xs" fw={600} c={"gray.9"}>
							{c}
						</Text>
					</Badge>
				))}
			</Flex>
		);
	};

	// ---- Derived UI: duration & pretty date range
	const { from, to } = campaign.dateRange;
	const durationDays = useMemo(() => {
		if (!from || !to || !isValidDate(from) || !isValidDate(to)) return null;
		return differenceInCalendarDays(to, from) + 1; // inclusive
	}, [from, to]);

	const prettyRange = useMemo(() => {
		if (!from || !to || !isValidDate(from) || !isValidDate(to)) return null;
		// Example format: Friday, Aug 15th → Monday, Sep 15th
		return `${format(from, "EEEE, MMM do")} → ${format(
			to,
			"EEEE, MMM do"
		)}`;
	}, [from, to]);

	// ---- Validation for save
	const canSave =
		!!from && !!to && isValidDate(from) && isValidDate(to) && !!statusValue;

	// ---- Handlers
	const handleSave = () => {
		if (!canSave) {
			toast.error("Please choose a valid date range and status.");
			return;
		}
		updateSelection(
			{
				id: s.selection_id,
				patch: {
					from_date: format(from as Date, "yyyy-MM-dd"),
					to_date: format(to as Date, "yyyy-MM-dd"),
					status: statusValue ?? undefined,
					notes: notes ?? undefined,
				},
			},
			{
				onSuccess: () => {
					toast.success("Changes saved");
					closeModal();
				},
				onError: (e: any) =>
					toast.error(e?.message ?? "Could not save changes"),
			}
		);
	};

	const handleRemove = () => {
		deleteSelection(s.selection_id, {
			onSuccess: () => {
				toast.success("Removed from plan");
				closeModal();
			},
			onError: (e: any) => toast.error(e?.message ?? "Could not remove"),
		});
	};

	return (
		<Modal
			opened={opened}
			onClose={closeModal}
			title={
				<Stack gap={0}>
					<Flex align={"center"} gap={7}>
						<IconEdit color={T.colors.blue[3]} size={22} />
						<Title order={4} fw={600}>
							Edit Campaign
						</Title>
					</Flex>

					<Text size="sm" c="gray.8">
						Modify the details for{" "}
						<Text span c="blue.4" fw={700}>
							&quot;
							{s?.name}
							&quot;
						</Text>
					</Text>
				</Stack>
			}
			centered
			radius={10}
			size={"33rem"}
			overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
		>
			<Stack gap={20}>
				<Card radius={10} bg={Colors.cream}>
					<Stack gap={7}>
						<Text fw={500}>{s?.name}</Text>
						<Text size="sm" c="gray.7">
							{s.description}
						</Text>
						<Group align="center" gap={5} mt={5}>
							<Objectives />
							<Topics />
						</Group>
					</Stack>
				</Card>

				<Select
					radius={10}
					label="Status"
					data={filterData.status}
					renderOption={renderSelectOption}
					value={statusValue}
					onChange={setStatusValue as any}
				/>

				<CampaignDates
					icon={<IconCalendar size={16} />}
					dateRange={campaign.dateRange}
					onChange={(range) =>
						setCampaign({ ...campaign, dateRange: range })
					}
					startLabel="Start Date"
					endLabel="End Date"
					inputSize="sm"
					labelSize="sm"
					titleLabelSize="sm"
					hideTitleIcon
				/>

				<Card radius={10} bg={"violet.0"} p={10} mt={5}>
					<Text size="sm" c={"gray.7"}>
						Duration:{" "}
						<Text span fw={700}>
							{durationDays
								? `${durationDays} day${
										durationDays === 1 ? "" : "s"
								  }`
								: "—"}
						</Text>
					</Text>

					<Text size="sm" c={"gray.7"}>
						{prettyRange ?? "—"}
					</Text>
				</Card>

				<Textarea
					withAsterisk
					resize="vertical"
					size="sm"
					radius={10}
					label="Notes (Optional)"
					placeholder="Add any additional notes or details about this campaign"
					minRows={3}
					maxRows={10}
					autosize
					value={notes}
					onChange={(e) => setNotes(e.currentTarget.value)}
				/>

				<Group align={"center"} justify="space-between">
					<Button
						radius={10}
						color="red.4"
						leftSection={<IconTrash size={14} />}
						onClick={handleRemove}
						loading={removing}
					>
						Remove from Plan
					</Button>
					<Flex align={"center"} gap={8}>
						<StyledButton onClick={closeModal}>Cancel</StyledButton>
						<Button
							radius={10}
							color="blue.3"
							onClick={handleSave}
							loading={saving}
							disabled={!canSave}
						>
							Save Changes
						</Button>
					</Flex>
				</Group>
			</Stack>
		</Modal>
	);
};

export default Edit;
