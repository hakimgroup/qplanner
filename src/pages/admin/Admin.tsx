import {
	Button,
	Text,
	TextInput,
	MultiSelect,
	Select,
	Table,
	Box,
	Badge,
	Flex,
	Textarea,
} from "@mantine/core";
import { hasLength, useForm } from "@mantine/form";
import filtersData from "@/filters.json";
import "./admin.scss";
import { IconExternalLink, IconPlus } from "@tabler/icons-react";
import {
	useAddCampaignAdmin,
	useAllCampaigns,
} from "../calendarPlanner/campaign.hooks";
import { toast } from "sonner";
import _ from "lodash";
import { Fragment } from "react/jsx-runtime";

const Admin = () => {
	const { data: allCampaigns } = useAllCampaigns();

	const rows = allCampaigns?.map((el) => (
		<Table.Tr key={el.campaign_id}>
			<Table.Td maw={250}>
				<Text c="blue.9" size="sm" fw={600} fs="italic">
					{el.campaign_name}
				</Text>
			</Table.Td>
			<Table.Td>{el.campaign_type}</Table.Td>
			<Table.Td>
				<Flex align="center">
					<a href={el.campaign_link} target="_blank">
						Campaign Link
					</a>
					<IconExternalLink size={15} style={{ marginLeft: 5 }} />
				</Flex>
			</Table.Td>
			<Table.Td>
				{_.head(el.campaign_availability)} -{" "}
				{_.last(el.campaign_availability)}
			</Table.Td>
			<Table.Td>
				<Box maw={200}>
					{el.campaign_tags ? (
						<Fragment>
							{el.campaign_tags.map((tg, i) => (
								<Badge size="sm" key={i} variant="light">
									{tg}
								</Badge>
							))}
						</Fragment>
					) : (
						<>-</>
					)}
				</Box>
			</Table.Td>
		</Table.Tr>
	));

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

	const { mutate, isPending } = useAddCampaignAdmin(() => {
		form.reset();
		toast.success("Campaign added successfully!!", {
			position: "top-center",
		});
	});

	const handleCreate = (values: typeof form.values) => {
		mutate(values);
	};

	return (
		<div className="admin">
			<Text fz="h1" fw={600} c="dark">
				Admin Panel
			</Text>
			<Text size="sm" c="dimmed" maw={600}>
				Welcome to the Admin Panel! Here, you can create, edit, and
				delete marketing campaigns for your users. Manage your campaigns
				effectively to provide your users with the best options for
				their marketing strategies. Use the tools below to ensure your
				campaigns are up-to-date and aligned with your goals.
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

			<Box mt="lg">
				<Table
					striped
					highlightOnHover
					withTableBorder
					withColumnBorders
					verticalSpacing="md"
				>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Campaign Name</Table.Th>
							<Table.Th>Type</Table.Th>
							<Table.Th>Link</Table.Th>
							<Table.Th>Availability</Table.Th>
							<Table.Th>Tags</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>{rows}</Table.Tbody>
				</Table>
			</Box>
		</div>
	);
};

export default Admin;
