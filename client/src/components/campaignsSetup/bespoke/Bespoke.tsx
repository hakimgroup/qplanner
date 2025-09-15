import StyledButton from "@/components/styledButton/StyledButton";
import {
	ActionIcon,
	Box,
	Button,
	Checkbox,
	Chip,
	Flex,
	Grid,
	Group,
	Modal,
	SimpleGrid,
	Stack,
	Text,
	Textarea,
	TextInput,
	useMantineTheme,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { IconCalendar, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import filtersData from "@/filters.json";

const Bespoke = () => {
	const [opened, { open, close }] = useDisclosure(false);
	const T = useMantineTheme();

	const [campaign, setCampaign] = useState({
		dateRange: {
			from: null,
			to: null,
		},
	});
	const [objectives, setObjectives] = useState([]);
	const [topics, setTopics] = useState([]);
	const [assets, setAssets] = useState([]);
	const [links, setLinks] = useState<string[]>([""]);

	// Update the value of a link at a given index
	const handleChange = (index: number, value: string) => {
		const updated = [...links];
		updated[index] = value;
		setLinks(updated);
	};

	// Add a new empty input field
	const handleAddLink = () => {
		setLinks([...links, ""]);
	};

	// Remove a link at a given index
	const handleRemoveLink = (index: number) => {
		setLinks(links.filter((_, i) => i !== index));
	};

	return (
		<>
			<StyledButton leftSection={<IconPlus size={14} />} onClick={open}>
				Bespoke Campaign
			</StyledButton>

			<Modal
				opened={opened}
				onClose={close}
				title={
					<Stack gap={0}>
						<Flex align={"center"} gap={10}>
							<IconPlus color={T.colors.blue[3]} size={21} />
							<Text fz={"h4"} fw={600}>
								Create Bespoke Campaign
							</Text>
						</Flex>
						<Text size="sm" c="gray.6">
							Create a custom campaign tailored to your specific
							needs
						</Text>
					</Stack>
				}
				centered
				radius={10}
				size={"42rem"}
				overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
			>
				<Stack gap={25}>
					<TextInput
						withAsterisk
						radius={10}
						size="md"
						label="Campaign Title"
						placeholder="Enter campaign title"
					/>

					<Textarea
						withAsterisk
						resize="vertical"
						radius={10}
						label="Description"
						placeholder="Describe your campaign goals and requirements"
						minRows={3}
						maxRows={10}
						autosize
					/>

					<Stack gap={5}>
						<Text size="md" c="gray.9" fw={500}>
							Preferred Dates
						</Text>

						<Flex
							align={"center"}
							justify={"space-between"}
							gap={15}
						>
							<DateInput
								w={"100%"}
								pointer
								size="md"
								radius={10}
								valueFormat="DD MMM YYYY"
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
										Preferred Start Date
									</Text>
								}
								placeholder="Start Date"
							/>
							<DateInput
								w={"100%"}
								pointer
								size="md"
								radius={10}
								valueFormat="DD MMM YYYY"
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
										Preferred End Date
									</Text>
								}
								placeholder="End Date"
							/>
						</Flex>
					</Stack>

					<Stack gap={10}>
						<Text size="md" c="gray.9" fw={500}>
							Objectives
						</Text>

						<Chip.Group
							multiple
							value={objectives}
							onChange={setObjectives}
						>
							<Group align="center" gap={5}>
								{filtersData.objectives.map((c) => (
									<Chip
										value={c}
										key={c}
										color={"blue.3"}
										size="xs"
										fw={600}
										variant={
											objectives.includes(c)
												? "filled"
												: "outline"
										}
									>
										{c}
									</Chip>
								))}
							</Group>
						</Chip.Group>
					</Stack>

					<Stack gap={10}>
						<Text size="md" c="gray.9" fw={500}>
							Topics
						</Text>

						<Chip.Group
							multiple
							value={topics}
							onChange={setTopics}
						>
							<Group align="center" gap={5}>
								{filtersData.topics.map((c) => (
									<Chip
										value={c}
										key={c}
										color={"blue.3"}
										size="xs"
										fw={600}
										variant={
											topics.includes(c)
												? "filled"
												: "outline"
										}
									>
										{c}
									</Chip>
								))}
							</Group>
						</Chip.Group>
					</Stack>

					<Stack gap={10}>
						<Text size="md" c="gray.9" fw={500}>
							Required Assets
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

					<Stack gap={10}>
						<Flex align={"center"} justify={"space-between"}>
							<Text size="md" c="gray.9" fw={500}>
								Reference Links
							</Text>
							<Box onClick={handleAddLink}>
								<StyledButton
									leftSection={<IconPlus size={14} />}
								>
									Add Link
								</StyledButton>
							</Box>
						</Flex>

						{links.map((link, index) => (
							<Grid key={index} gutter="xs">
								<Grid.Col span={links.length > 1 ? 11 : 12}>
									<TextInput
										w={"100%"}
										key={index}
										radius={10}
										placeholder="https://example.com"
										value={link}
										onChange={({ target: { value } }) =>
											handleChange(index, value)
										}
									/>
								</Grid.Col>
								<Grid.Col span={1}>
									{links.length > 1 && (
										<ActionIcon
											color="red"
											variant="subtle"
											onClick={() =>
												handleRemoveLink(index)
											}
										>
											<IconTrash size={16} />
										</ActionIcon>
									)}
								</Grid.Col>
							</Grid>
						))}
					</Stack>

					<Textarea
						withAsterisk
						resize="vertical"
						radius={10}
						label="Additional Notes"
						placeholder="Any additional requirements or context"
						minRows={3}
						maxRows={10}
						autosize
					/>

					<Flex justify={"flex-end"} gap={8}>
						<StyledButton onClick={() => {}}>Cancel</StyledButton>
						<Button radius={10} color="blue.3" disabled>
							Create Campaign
						</Button>
					</Flex>
				</Stack>
			</Modal>
		</>
	);
};

export default Bespoke;
