import {
	Card,
	Text,
	SegmentedControl,
	Stack,
	Title,
	Group,
	Badge,
	Flex,
	Checkbox,
	SimpleGrid,
	Textarea,
	useMantineTheme,
	Divider,
	Button,
	Modal,
	Select,
	ComboboxItem,
} from "@mantine/core";
import { useState } from "react";
import filtersData from "@/filters.json";
import {
	IconAlertCircle,
	IconCalendar,
	IconLink,
	IconUser,
} from "@tabler/icons-react";
import { Colors } from "@/shared/shared.const";
import StyledButton from "../styledButton/StyledButton";
import { useDisclosure } from "@mantine/hooks";
import { DateInput } from "@mantine/dates";

const SingleNotification = () => {
	const T = useMantineTheme();
	const [opened, { open, close }] = useDisclosure(false);
	const [value, setValue] = useState("overview");
	const [val, setVal] = useState<ComboboxItem | null>(null);
	const [assets, setAssets] = useState([]);
	const [campaign, setCampaign] = useState({
		dateRange: {
			from: null,
			to: null,
		},
	});

	const overviewMeta = [
		{
			title: "Start Date",
			value: "Feb 15, 2025",
		},
		{
			title: "End Date",
			value: "Mar 15, 2025",
		},
		{
			title: "Owner",
			value: "Marketing Team",
		},
		{
			title: "Created",
			value: "Jan 15, 2025",
		},
	];

	const links = [
		"https://example.com/spring-frames",
		"https://example.com/competitor-analysis",
	];

	return (
		<Stack gap={10}>
			<Card radius={10} style={{ border: "1px solid #e5e7eb" }}>
				<Stack gap={15}>
					<Stack gap={2}>
						<Group align="center" justify="space-between">
							<Title order={4} fw={600}>
								Spring Frame Launch Campaign
							</Title>

							<Flex align={"center"} gap={7}>
								<Badge color="red.4">High Priority</Badge>
								<IconAlertCircle
									size={18}
									color={T.colors.orange[5]}
								/>
							</Flex>
						</Group>

						<Text size="sm" c={"gray.6"}>
							Targeted campaign to promote new spring frame
							collection with emphasis on premium designer brands
							and eye health messaging.
						</Text>
					</Stack>

					<Group align="center" justify="space-between">
						{overviewMeta.map((ov, i) => (
							<Stack key={ov.title} gap={0}>
								<Text fw={500} c={"blue.3"} size="sm">
									{ov.title}
								</Text>
								<Group gap={3} align="center">
									{i === 2 && <IconUser size={15} />}
									<Text c={"gray.9"} size="sm" fw={700}>
										{ov.value}
									</Text>
								</Group>
							</Stack>
						))}
					</Group>

					<Stack gap={5}>
						<Text fw={500} c={"gray.8"}>
							Objectives
						</Text>
						<Flex align={"center"} gap={4}>
							{["AOV", "Sales"].map((c) => (
								<Badge key={c} color="red.4">
									{c}
								</Badge>
							))}
						</Flex>
					</Stack>

					<Stack gap={10}>
						<Text fw={500} c={"gray.8"}>
							Select Asset for Placement
						</Text>

						<Checkbox.Group
							value={assets}
							onChange={(v) => setAssets(v)}
						>
							<SimpleGrid cols={2} spacing={9} mt="xs">
								{filtersData.assets.map((ct) => (
									<Checkbox
										key={ct}
										radius={50}
										size="xs"
										color="blue.3"
										value={ct}
										label={
											<Text
												size="sm"
												fw={500}
												ml={-5}
												mt={-2}
											>
												{ct}
											</Text>
										}
									/>
								))}
							</SimpleGrid>
						</Checkbox.Group>
					</Stack>

					<Textarea
						resize="vertical"
						radius={10}
						label={
							<Text fw={500} c={"gray.8"}>
								Extra Notes
							</Text>
						}
						placeholder="Add any additional notes about the asset selection..."
						minRows={3}
						maxRows={10}
						autosize
					/>

					<Stack gap={10}>
						<Text fw={500} c={"gray.8"}>
							Reference Links
						</Text>

						<Stack gap={5}>
							{links.map((l) => (
								<Group align="center" key={l} gap={5}>
									<IconLink
										size={12}
										color={T.colors.blue[3]}
									/>
									<Text c={"blue.3"} fw={500} size="sm">
										{l}
									</Text>
								</Group>
							))}
						</Stack>
					</Stack>

					<Stack gap={8}>
						<Text fw={500} c={"gray.8"}>
							Internal Comments
						</Text>

						<Card radius={10} bg={Colors.cream} p={10}>
							<Text size="sm">
								High priority - practice has upcoming frame
								supplier visit
							</Text>
						</Card>
					</Stack>

					<Divider size={"xs"} color="gray.1" />

					<Flex align={"center"} justify={"space-between"}>
						<StyledButton onClick={open}>
							Edit Placement
						</StyledButton>
						<Group gap={7}>
							<Button radius={10} color="red.4">
								Reject
							</Button>
							<Button radius={10} color="blue.3">
								Submit
							</Button>
						</Group>
					</Flex>
				</Stack>
			</Card>

			<Modal
				opened={opened}
				onClose={close}
				title={
					<Stack gap={0}>
						<Text fz={"h3"} fw={600}>
							Spring Frame Launch Campaign
						</Text>
						<Text size="sm" c="gray.8">
							Update placement details and timing
						</Text>
					</Stack>
				}
				centered
				radius={10}
				size={"40rem"}
				overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
			>
				<Stack gap={15}>
					<Flex align={"center"} justify={"space-between"} gap={8}>
						<DateInput
							w={"100%"}
							pointer
							radius={10}
							valueFormat="DD MMMM YYYY"
							leftSection={<IconCalendar size={16} />}
							value={campaign.dateRange.from}
							onChange={(d) =>
								setCampaign({
									...campaign,
									dateRange: {
										...campaign.dateRange,
										from: d,
									},
								})
							}
							label={
								<Text size="sm" c={"gray.9"} fw={500}>
									Start Date
								</Text>
							}
							placeholder="Select Start Date"
						/>
						<DateInput
							w={"100%"}
							pointer
							color="blue.3"
							radius={10}
							valueFormat="DD MMMM YYYY"
							leftSection={<IconCalendar size={16} />}
							value={campaign.dateRange.to}
							onChange={(d) =>
								setCampaign({
									...campaign,
									dateRange: {
										...campaign.dateRange,
										to: d,
									},
								})
							}
							label={
								<Text size="sm" c={"gray.9"} fw={500}>
									End Date
								</Text>
							}
							placeholder="Select End Date"
						/>
					</Flex>

					<Select
						radius={10}
						label="Status"
						data={filtersData.status}
						value={val ? val.value : null}
						onChange={(_value, option) => setVal(option)}
					/>

					<Textarea
						resize="vertical"
						radius={10}
						label="Notes"
						placeholder="Add notes about this placement"
						minRows={3}
						maxRows={10}
						autosize
					/>

					<Flex align={"center"} justify={"flex-end"} gap={8}>
						<StyledButton>Cancel</StyledButton>
						<Button radius={10} color="blue.3">
							Update Placement
						</Button>
					</Flex>
				</Stack>
			</Modal>
		</Stack>
	);
};

export default SingleNotification;
