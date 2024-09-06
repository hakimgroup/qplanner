import { Button, Text, TextInput, MultiSelect, Select } from "@mantine/core";
import { hasLength, useForm } from "@mantine/form";
import filtersData from "@/filters.json";
import "./admin.scss";
import { IconPlus } from "@tabler/icons-react";
import { useAddCampaignAdmin } from "../calendarPlanner/campaign.hooks";
import { toast } from "sonner";

const Admin = () => {
	const form = useForm({
		mode: "controlled",
		initialValues: {
			campaign_name: "",
			campaign_type: "",
			campaign_availability: [],
			campaign_link: "",
			campaign_tags: [],
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
			campaign_tags: hasLength(
				{ min: 1 },
				"Campaign name cannot be empty"
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
							mt="md"
							{...form.getInputProps("campaign_name")}
							label="Campaign Name"
						/>

						<Select
							mt="md"
							label="Campaign Type"
							{...form.getInputProps("campaign_type")}
							data={[
								"Campaign",
								"Marketing Suite",
								"Brand Activations",
							]}
						/>

						<TextInput
							mt="md"
							{...form.getInputProps("campaign_link")}
							label="Campaign Link"
						/>

						<MultiSelect
							mt="md"
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
							mt="md"
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
							mt={40}
							rightSection={<IconPlus size={15} />}
							loading={isPending}
						>
							Add
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Admin;
