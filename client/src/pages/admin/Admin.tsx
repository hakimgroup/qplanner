import {
	Button,
	Text,
	TextInput,
	MultiSelect,
	Select,
	Table,
	Box,
	Badge,
	Textarea,
	ActionIcon,
	Modal,
	Stack,
	Title,
} from "@mantine/core";
import { hasLength, useForm } from "@mantine/form";
import filtersData from "@/filters.json";
import "./admin.scss";
import { IconEdit, IconPlus } from "@tabler/icons-react";
import {
	useAddCampaignAdmin,
	useAllCampaigns,
	useCampaign,
	useEditCampaignInList,
} from "../calendarPlanner/campaign.hooks";
import { toast } from "sonner";
import _ from "lodash";
import { Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { CampaignModel, CampaignsModel } from "@/api/campaign";
import useUser from "../auth/auth.hooks";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface Formatted {
	practiceName?: string;
	campaign_link: string;
	campaign_name: string;
	campaign_note?: string;
	start_date: string;
	end_date: string;
}

const Admin = () => {
	const { data: allCampaigns } = useAllCampaigns();
	const [cm, setCm] = useState<CampaignsModel>(null);
	const navigate = useNavigate();

	//APIs
	const { data: user } = useUser();
	const isAdmin = user?.role === "admin";
	const { data } = useCampaign();

	const editForm = useForm<CampaignsModel>({
		mode: "controlled",
		initialValues: {
			...cm,
		},
		validate: {},
	});

	const form = useForm({
		mode: "controlled",
		initialValues: {
			campaign_name: "",
			campaign_type: "",
			campaign_availability: [],
			campaign_link: "",
			campaign_tags: [],
			campaign_description: "",
		},
		validate: {
			campaign_name: hasLength(
				{ min: 1 },
				"Campaign name cannot be empty"
			),
			campaign_type: hasLength(
				{ min: 1 },
				"Campaign type cannot be empty"
			),
			campaign_availability: hasLength(
				{ min: 1 },
				"Please select all available months for this campaign"
			),
		},
	});

	const columns: GridColDef[] = [
		{
			field: "campaign_name",
			headerName: "Campaign Name",
			width: 250,
			renderCell(params) {
				return (
					<Text c="blue.9" size="sm" fw={600} fs="italic">
						{params.value}
					</Text>
				);
			},
		},
		{
			field: "campaign_description",
			headerName: "Description",
			width: 200,
			renderCell(params) {
				return (
					<Text size="xs" maw={200}>
						{params.value}
					</Text>
				);
			},
		},
		{ field: "campaign_type", headerName: "Type", flex: 1 },
		{
			field: "campaign_link",
			headerName: "Link",
			flex: 1,
			renderCell(params) {
				return (
					<a href={params.value} target="_blank">
						Campaign Link
					</a>
				);
			},
		},
		{
			field: "campaign_availability",
			headerName: "Availability",
			width: 150,
			renderCell(params) {
				return (
					<Text size="xs">
						{String(_.head(params.value))} -{" "}
						{String(_.last(params.value))}
					</Text>
				);
			},
		},
		{
			field: "campaign_tags",
			headerName: "Tags",
			width: 200,
			renderCell(params) {
				return (
					<Box maw={200}>
						{params.value.map((tg, i) => (
							<Badge
								size="sm"
								key={i}
								variant="light"
								mr={5}
								mb={5}
							>
								{tg}
							</Badge>
						))}
					</Box>
				);
			},
		},
		{
			align: "center",
			field: "actions",
			headerName: "",
			width: 100,
			sortable: false,
			renderCell(params) {
				return (
					<ActionIcon
						variant="light"
						size="xs"
						c="blue.9"
						onClick={() => {
							setCm(params.row);
							editForm.setValues(params.row);
						}}
					>
						<IconEdit />
					</ActionIcon>
				);
			},
		},
	];

	const plansColumns: GridColDef[] = [
		{
			field: "practiceName",
			headerName: "Practice Name",
			flex: 1,
			renderCell(params) {
				return (
					<Text c="red.9" size="sm" fw={600} fs="italic">
						{params.value}
					</Text>
				);
			},
		},
		{
			field: "campaign_link",
			headerName: "Campaign Link",
			flex: 1,
			renderCell(params) {
				return (
					<a href={params.value} target="_blank">
						Campaign Link
					</a>
				);
			},
		},
		{
			field: "campaign_name",
			headerName: "Campaign Name",
			flex: 1,
			renderCell(params) {
				return (
					<Text size="sm" fw={700}>
						{params.value}
					</Text>
				);
			},
		},
		{
			field: "campaign_note",
			headerName: "Campaign Note",
			flex: 1,
			renderCell(params) {
				return <Text size="xs">{params.value}</Text>;
			},
		},
		{
			field: "start_date",
			headerName: "Start Date",
			width: 100,
			renderCell(params) {
				return (
					<Text size="xs" fw={600} c="blue.9">
						{params.value}
					</Text>
				);
			},
		},
		{
			field: "end_date",
			headerName: "End Date",
			width: 100,
			renderCell(params) {
				return (
					<Text size="xs" fw={600} c="blue.9">
						{params.value}
					</Text>
				);
			},
		},
	];

	const { mutate, isPending } = useAddCampaignAdmin(() => {
		form.reset();
		toast.success("Campaign added successfully!!", {
			position: "top-center",
		});
	});

	const { mutate: edit, isPending: editing } = useEditCampaignInList(() => {
		editForm.reset();
		setCm(null);
		toast.success("Campaign edited successfully!!", {
			position: "top-center",
		});
	});

	const handleCreate = (values: typeof form.values) => {
		mutate(values);
	};

	const handleEdit = (values: typeof editForm.values) => {
		edit(values);
	};

	const formatCampaigns = (campaignModels: CampaignModel[]): Formatted[] => {
		return _.flatMap(campaignModels, (campaignModel) => {
			const practiceName = campaignModel.personal_details?.practiceName;
			const campaignPlans = campaignModel.campaign_plans || [];

			return campaignPlans.map((plan) => {
				const [start_date, end_date] = plan.campaign_period || ["", ""];
				return {
					practiceName: practiceName,
					campaign_link: plan.campaign_link,
					campaign_name: plan.campaign_name,
					campaign_note: plan.campaign_note,
					start_date: start_date,
					end_date: end_date,
				} as Formatted;
			});
		});
	};

	if (user && !isAdmin) {
		return null;
	}

	return (
		<Fragment>
			<Modal
				opened={cm !== null}
				onClose={() => setCm(null)}
				size="sm"
				title={
					<Text fw={600} c="blue">
						Edit campaign details
					</Text>
				}
			>
				<form onSubmit={editForm.onSubmit(handleEdit)}>
					<Textarea
						autosize
						minRows={4}
						mt="xs"
						{...editForm.getInputProps("campaign_description")}
						label="Campaign Description"
					/>

					<Button
						fullWidth
						type="submit"
						mt={20}
						rightSection={<IconPlus size={15} />}
						loading={editing}
					>
						Save
					</Button>
				</form>
			</Modal>
			<div className="admin">
				<Text fz="h1" fw={600} c="dark">
					Admin Panel
				</Text>
				<Text size="sm" c="dimmed" maw={600}>
					Welcome to the Admin Panel! Here, you can create, edit, and
					delete marketing campaigns for your users. Manage your
					campaigns effectively to provide your users with the best
					options for their marketing strategies. Use the tools below
					to ensure your campaigns are up-to-date and aligned with
					your goals.
				</Text>

				<div className="create-rows">
					<div className="row">
						<form onSubmit={form.onSubmit(handleCreate)}>
							<TextInput
								mt="xs"
								{...form.getInputProps("campaign_name")}
								label="Campaign Name"
							/>

							<Textarea
								autosize
								minRows={1}
								mt="xs"
								{...form.getInputProps("campaign_description")}
								label="Campaign Description"
							/>

							<Select
								mt="xs"
								label="Campaign Type"
								{...form.getInputProps("campaign_type")}
								data={[
									"Campaign",
									"Marketing Suite",
									"Brand Activations",
								]}
							/>

							<TextInput
								mt="xs"
								{...form.getInputProps("campaign_link")}
								label="Campaign Link"
							/>

							<MultiSelect
								mt="xs"
								label="Campaign Availability"
								clearable
								hidePickedOptions
								placeholder="Choose all available months for this campaign"
								data={[
									"Jan",
									"Feb",
									"Mar",
									"Apr",
									"May",
									"Jun",
									"Jul",
									"Aug",
									"Sep",
									"Oct",
									"Nov",
									"Dec",
								]}
								{...form.getInputProps("campaign_availability")}
							/>

							<MultiSelect
								mt="xs"
								label="Campaign Tags"
								clearable
								hidePickedOptions
								placeholder="Choose all campaign tags"
								data={[
									...filtersData.objectives,
									...filtersData.topics,
								].map((t) => t)}
								{...form.getInputProps("campaign_tags")}
							/>

							<Button
								fullWidth
								type="submit"
								mt={20}
								rightSection={<IconPlus size={15} />}
								loading={isPending}
							>
								Add
							</Button>
						</form>
					</div>
				</div>

				<Stack h={1000} w="100%" mt="lg">
					<Title order={3} c="teal.9">
						All Campaigns
					</Title>
					<DataGrid
						disableRowSelectionOnClick
						getRowHeight={() => "auto"}
						showCellVerticalBorder
						hideFooter
						rows={
							allCampaigns?.map((el) => ({
								...el,
								id: el.campaign_id,
							})) ?? []
						}
						columns={columns}
						sx={{
							borderRadius: 0,
						}}
					/>
				</Stack>

				<Stack h={880} w="100%" mt="xl">
					<Title order={3} c="teal.9">
						Campaigns By Practice
					</Title>
					<DataGrid
						disableRowSelectionOnClick
						getRowHeight={() => "auto"}
						showCellVerticalBorder
						showColumnVerticalBorder
						unstable_rowSpanning
						hideFooter
						rows={(formatCampaigns(data) ?? []).map(
							(row, index) => ({
								...row,
								id: index,
							})
						)}
						columns={plansColumns}
						sx={{
							borderRadius: 0,
						}}
					/>
				</Stack>
			</div>
		</Fragment>
	);
};

export default Admin;
