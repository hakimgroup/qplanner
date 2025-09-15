import StyledButton from "@/components/styledButton/StyledButton";
import {
	useMantineTheme,
	Modal,
	Stack,
	Text,
	Flex,
	Slider,
	Divider,
	Switch,
	Card,
	Title,
	Badge,
	Group,
	Button,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
	IconArrowRight,
	IconCheck,
	IconWand,
	IconX,
} from "@tabler/icons-react";
import { map, range, upperFirst } from "lodash";
import { useState } from "react";

const Guided = () => {
	const [opened, { open, close }] = useDisclosure(false);
	const T = useMantineTheme();

	const [selections, setSelections] = useState({
		clinical: 50,
		frame: 50,
		contact: 50,
		events: false,
		suppliers: false,
		seasonal: false,
	});

	const selectionRanges = [
		{
			type: "clinical",
			title: "Clinical Services Emphasis",
			description:
				"How much focus do you want on clinical and eye health campaigns?",
			previewTitle: "Clinical Focus",
		},
		{
			type: "frame",
			title: "Frame Product Emphasis",
			description:
				"How important are frame-focused campaigns for your practice?",
			previewTitle: "Frame Focus",
		},
		{
			type: "contact",
			title: "Contact Lens Emphasis",
			description: "What priority should contact lens campaigns have?",
			previewTitle: "Contact Lens Focus",
		},
	];

	const selectionTypes = [
		{
			title: "Event Readiness",
			description:
				"Are you ready to run time-sensitive promotional events?",
			type: "events",
		},
		{
			title: "Supplier Brand Participation",
			description:
				"Do you want to include campaigns featuring specific supplier brands?",
			type: "suppliers",
		},
		{
			title: "Local Seasonality Focus",
			description:
				"Should campaigns align with your local seasonal patterns?",
			type: "seasonal",
		},
	];

	return (
		<>
			<StyledButton leftSection={<IconWand size={14} />} onClick={open}>
				Guided Populate
			</StyledButton>

			<Modal
				opened={opened}
				onClose={close}
				title={
					<Stack gap={0}>
						<Flex align={"center"} gap={10}>
							<IconWand color={T.colors.blue[3]} size={21} />
							<Text fz={"h4"} fw={600}>
								Guided Campaign Selection
							</Text>
						</Flex>
						<Text size="sm" c="gray.6">
							Answer a few questions to get personalized campaign
							recommendations for Downtown Vision Center
						</Text>
					</Stack>
				}
				centered
				radius={10}
				size={"44rem"}
				overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
			>
				{selectionRanges.map((tp, i) => (
					<Stack gap={0} key={tp.type} mt={i !== 0 ? 15 : 0}>
						<Text fw={500}>{tp.title}</Text>
						<Text size="sm" c={"gray.6"}>
							{tp.description}
						</Text>

						<Slider
							mt={10}
							color="blue.3"
							label={null}
							step={10}
							value={selections[tp.type]}
							min={0}
							max={100}
							thumbSize={20}
							styles={{ thumb: { borderWidth: 2, padding: 3 } }}
							onChange={(v) =>
								setSelections({ ...selections, [tp.type]: v })
							}
						/>

						<Flex align={"center"} justify={"space-between"} mt={3}>
							<Text size="xs" c={"gray.6"}>
								Low Priority
							</Text>
							<Text size="sm" fw={500} c="blue.3">
								{selections[tp.type]}%
							</Text>
							<Text size="xs" c={"gray.6"}>
								High Priority
							</Text>
						</Flex>

						<Divider size={"xs"} color="gray.1" mt={15} />
					</Stack>
				))}

				{selectionTypes.map((tp, i) => (
					<Stack gap={0} key={tp.type} mt={i !== 0 ? 20 : 30}>
						<Text fw={500}>{tp.title}</Text>
						<Text size="sm" c={"gray.6"}>
							{tp.description}
						</Text>

						<Flex
							align={"center"}
							justify={"space-between"}
							mt={10}
						>
							<Text size="sm" fw={500}>
								{selections[tp.type] ? "Yes" : "No"}
							</Text>

							<Switch
								size="lg"
								onLabel="YES"
								offLabel="NO"
								color="blue.3"
								checked={selections[tp.type]}
								onChange={({ currentTarget: { checked } }) =>
									setSelections({
										...selections,
										[tp.type]: checked,
									})
								}
							/>
						</Flex>

						{i !== 2 && (
							<Divider size={"xs"} color="gray.1" mt={15} />
						)}
					</Stack>
				))}

				<Card
					mt={30}
					radius={10}
					bg={"violet.0"}
					bd="1px solid violet.2"
					p={20}
				>
					<Title order={6} c={"grape.6"}>
						Preview Your Focus
					</Title>

					<Stack gap={8} mt={10}>
						{selectionRanges.map((sr) => (
							<Flex
								key={sr.previewTitle}
								align={"center"}
								justify={"space-between"}
							>
								<Text size="sm">{sr.previewTitle}:</Text>

								<Badge
									variant="outline"
									color="gray.2"
									style={{ textTransform: "unset" }}
								>
									<Text
										size="xs"
										fw={600}
										c={"gray.9"}
										mt={1}
									>
										{selections[sr.type]}%
									</Text>
								</Badge>
							</Flex>
						))}
					</Stack>

					<Divider size={"xs"} color="gray.1" mt={10} />

					<Flex align={"center"} justify={"space-between"} mt={10}>
						{selectionTypes.map((st) => {
							const isActive = selections[st.type];

							return (
								<Group align="center" gap={5} key={st.type}>
									<Text
										fw={500}
										size="xs"
										c={isActive ? "green.7" : "gray.7"}
									>
										{upperFirst(st.type)}
									</Text>
									{isActive ? (
										<IconCheck
											size={12}
											stroke={3}
											color={
												T.colors[
													isActive ? "green" : "gray"
												][7]
											}
										/>
									) : (
										<IconX
											size={12}
											stroke={3}
											color={
												T.colors[
													isActive ? "green" : "gray"
												][7]
											}
										/>
									)}
								</Group>
							);
						})}
					</Flex>
				</Card>

				<Flex justify={"flex-end"} mt={15} gap={8}>
					<StyledButton>Cancel</StyledButton>
					<Button
						radius={10}
						color="blue.3"
						leftSection={<IconArrowRight size={14} />}
					>
						Get Recommendations
					</Button>
				</Flex>
			</Modal>
		</>
	);
};

export default Guided;
