import StyledButton from "@/components/styledButton/StyledButton";
import { usePractice } from "@/shared/PracticeProvider";
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
	Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
	IconArrowRight,
	IconCheck,
	IconWand,
	IconX,
} from "@tabler/icons-react";
import { upperFirst } from "lodash";
import { useState } from "react";
import GuidedResult from "./GuidedResult";
import { useGuidedCampaigns } from "@/hooks/campaign.hooks";
import { SelectionsSource } from "@/shared/shared.models";

const StyledSlider = ({
	i = 0,
	tp,
	selections,
	setSelections,
	displayText = {
		t1: "Low Priority",
		t2: `${selections[tp.type]}%`,
		t3: "High Priority",
	},
}) => (
	<Stack gap={0} key={i} mt={i !== 0 ? 15 : 0}>
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
			onChange={(v) => setSelections({ ...selections, [tp.type]: v })}
		/>

		<Flex align={"center"} justify={"space-between"} mt={3}>
			<Text size="xs" c={"gray.6"}>
				{displayText.t1}
			</Text>
			<Text size="xs" fw={600} c="blue.3">
				{displayText.t2}
			</Text>
			<Text size="xs" c={"gray.6"}>
				{displayText.t3}
			</Text>
		</Flex>

		<Divider size={"xs"} color="gray.1" mt={15} />
	</Stack>
);

const Guided = () => {
	const T = useMantineTheme();
	const { activePracticeName } = usePractice();
	const [opened, { open, close }] = useDisclosure(false);
	const [resultsOpened, { open: openResults, close: closeResults }] =
		useDisclosure(false);

	const [selections, setSelections] = useState({
		clinical: 50,
		frame: 50,
		lens: 50,
		contact: 50,
		activity: 50,
		eventReady: false,
		supplierBrand: false,
		seasonal: false,
		kids: false,
	});

	const { data, isFetching, refetch } = useGuidedCampaigns(
		selections,
		false,
		openResults
	);

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
			type: "lens",
			title: "Lens Product Emphasis",
			description: "What priority should lens-focused campaigns have?",
			previewTitle: "Lens Focus",
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
			type: "eventReady",
		},
		{
			title: "Supplier Brand Participation",
			description:
				"Do you want to include campaigns featuring specific supplier brands?",
			type: "supplierBrand",
		},
		{
			title: "Local Seasonality Focus",
			description:
				"Should campaigns align with your local seasonal patterns?",
			type: "seasonal",
		},
		{
			title: "Kids",
			description: "Would you like children focused campaigns?",
			type: "kids",
		},
	];

	const activityText = () => {
		const low = selections.activity >= 0 && selections.activity <= 30;
		const moderate = selections.activity > 30 && selections.activity <= 60;
		const high = selections.activity > 60;

		switch (true) {
			case low:
				return "Couple campaigns here and there";
			case moderate:
				return "Moderate activity";
			case high:
				return "Campaigns throughout the year";
		}
	};

	return (
		<>
			<StyledButton
				fw={500}
				leftSection={<IconWand size={14} />}
				onClick={open}
			>
				Guided Populate
			</StyledButton>

			<Modal
				opened={opened}
				onClose={() => {
					close();
					closeResults();
				}}
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
							recommendations for{" "}
							<Text size="sm" span fw={700} c="blue.3">
								{activePracticeName}
							</Text>
						</Text>
					</Stack>
				}
				centered
				radius={10}
				size={"42rem"}
				overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
			>
				{resultsOpened && (
					<GuidedResult
						data={data}
						goBack={() => {
							closeResults();
						}}
					/>
				)}

				{!resultsOpened && (
					<>
						{selectionRanges.map((tp, i) => (
							<StyledSlider
								i={i}
								key={i}
								tp={tp}
								selections={selections}
								setSelections={setSelections}
							/>
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
										onChange={({
											currentTarget: { checked },
										}) =>
											setSelections({
												...selections,
												[tp.type]: checked,
											})
										}
									/>
								</Flex>
								<Divider size={"xs"} color="gray.1" mt={15} />
							</Stack>
						))}

						<Box mt={20}>
							<StyledSlider
								tp={{
									type: "activity",
									title: "Activity Level",
									description:
										"How active do you want your marketing calendar to be?",
								}}
								selections={selections}
								setSelections={setSelections}
								displayText={{
									t1: "Couple campaigns",
									t2: activityText(),
									t3: "Constant campaigns",
								}}
							/>
						</Box>

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

							<Stack gap={10} mt={10}>
								{selectionRanges.map((sr) => (
									<Flex
										key={sr.previewTitle}
										align={"center"}
										justify={"space-between"}
									>
										<Text size="sm">
											{sr.previewTitle}:
										</Text>

										<Badge variant="outline" color="gray.2">
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

								<Flex
									align={"center"}
									justify={"space-between"}
								>
									<Text size="sm">Activity Level:</Text>

									<Badge variant="outline" color="gray.2">
										<Text
											size="xs"
											fw={600}
											c={"gray.9"}
											mt={1}
										>
											{activityText()}
										</Text>
									</Badge>
								</Flex>
							</Stack>

							<Divider size={"xs"} color="gray.1" mt={10} />

							<Flex
								align={"center"}
								justify={"space-between"}
								mt={10}
							>
								{selectionTypes.map((st) => {
									const isActive = selections[st.type];

									return (
										<Group
											align="center"
											gap={5}
											key={st.type}
										>
											<Text
												fw={500}
												size="xs"
												c={
													isActive
														? "green.7"
														: "gray.7"
												}
											>
												{upperFirst(st.type)}
											</Text>
											{isActive ? (
												<IconCheck
													size={12}
													stroke={3}
													color={
														T.colors[
															isActive
																? "green"
																: "gray"
														][7]
													}
												/>
											) : (
												<IconX
													size={12}
													stroke={3}
													color={
														T.colors[
															isActive
																? "green"
																: "gray"
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
							<StyledButton
								onClick={() => {
									close();
									closeResults();
								}}
							>
								Cancel
							</StyledButton>
							<Button
								radius={10}
								color="blue.3"
								loading={isFetching}
								leftSection={<IconArrowRight size={14} />}
								onClick={() => refetch()}
							>
								Get Recommendations
							</Button>
						</Flex>
					</>
				)}
			</Modal>
		</>
	);
};

export default Guided;
