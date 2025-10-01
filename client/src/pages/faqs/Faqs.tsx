import StyledButton from "@/components/styledButton/StyledButton";
import {
	Accordion,
	Button,
	Card,
	Center,
	Grid,
	Group,
	Stack,
	Text,
	Title,
	useMantineTheme,
} from "@mantine/core";
import { IconBook, IconHelpCircle, IconVideo } from "@tabler/icons-react";

const Faqs = () => {
	const T = useMantineTheme().colors;

	const data = [
		{
			value: "How do I get started with the Marketing Planner?",
			description:
				"Start by watching our 60-second tutorial video or browsing the campaign catalogue. Use filters to find campaigns that match your practice needs, then add them to your plan with specific dates.",
		},
		{
			value: "How do I add campaigns to my plan?",
			description:
				"Browse campaigns in the catalogue view, click on any campaign card to see details, then click 'Add to Plan' and select your preferred dates. You can also use Quick Populate or Guided Populate for faster planning.",
		},
		{
			value: "What are bespoke campaigns?",
			description:
				"Bespoke campaigns are custom campaigns you create for your specific needs. Click 'Create Bespoke Campaign' to define your own campaign with custom objectives, topics, and requirements.",
		},
		{
			value: "How do I use filters effectively?",
			description:
				"Use the filters panel on the left to narrow down campaigns by section, objectives, topics, or status. You can combine multiple filters to find exactly what you need for your practice.",
		},
		{
			value: "Where can I see my selected campaigns?",
			description:
				"Switch to 'My Selections' using the toggle at the top of the page to see all campaigns you've added to your plan. You can view them in Cards, Table, or Calendar format.",
		},
		{
			value: "How does the calendar view work?",
			description:
				"The calendar view shows your campaigns plotted over time. This allows you to see potential conflicts or overlaps.",
		},
	];

	const items = data.map((item) => (
		<Accordion.Item key={item.value} value={item.value}>
			<Accordion.Control>
				<Text fw={500}>{item.value}</Text>
			</Accordion.Control>
			<Accordion.Panel>
				<Text size="sm" c="gray.6">
					{item.description}
				</Text>
			</Accordion.Panel>
		</Accordion.Item>
	));

	return (
		<Stack
			w={"100%"}
			align="center"
			gap={0}
			pt={50}
			pb={100}
			maw={900}
			style={{
				margin: "0 auto",
			}}
		>
			<Center w={70} h={70} bg={"blue.0"} style={{ borderRadius: "50%" }}>
				<IconHelpCircle size={40} color={T.blue[3]} stroke={1.7} />
			</Center>

			<Title order={1} mt={15}>
				How can we help?
			</Title>

			<Text c="gray.6" size="lg" mt={5}>
				Find answers to common questions about using the Marketing
				Planner
			</Text>

			<Grid w={"100%"} mt={30}>
				<Grid.Col span={6}>
					<Card
						radius={10}
						style={{ border: `1px solid ${T.blue[0]}` }}
					>
						<Stack gap={5}>
							<Group align="center">
								<IconVideo size={20} />
								<Title order={3}>Tutorial Video</Title>
							</Group>

							<Text size="sm" c="gray.7">
								Watch our 60-second walkthrough to get started
								quickly
							</Text>

							<Button fullWidth mt={20}>
								Watch Tutorial
							</Button>
						</Stack>
					</Card>
				</Grid.Col>

				<Grid.Col span={6}>
					<Card
						radius={10}
						style={{ border: `1px solid ${T.blue[0]}` }}
					>
						<Stack gap={5}>
							<Group align="center">
								<IconBook size={20} />
								<Title order={3}>How to Use the Portal</Title>
							</Group>

							<Text size="sm" c="gray.7">
								Step-by-step guide to planning your marketing
								campaigns
							</Text>

							<StyledButton fullWidth mt={20}>
								Read Guide
							</StyledButton>
						</Stack>
					</Card>
				</Grid.Col>
			</Grid>

			<Card
				w={"100%"}
				radius={10}
				style={{ border: `1px solid ${T.blue[0]}` }}
				mt={30}
				pb={30}
			>
				<Stack gap={40}>
					<Stack gap={5}>
						<Title order={3}>Frequently Asked Questions</Title>
						<Text size="sm" c="gray.7">
							Common questions and answers about the Marketing
							Planner
						</Text>
					</Stack>

					<Accordion defaultValue="Apples">{items}</Accordion>
				</Stack>
			</Card>

			<Card
				w={"100%"}
				radius={10}
				style={{ border: `1px solid ${T.blue[0]}` }}
				mt={30}
				pb={30}
			>
				<Stack gap={20}>
					<Stack gap={5}>
						<Title order={3}>Still need help?</Title>
						<Text size="sm" c="gray.7">
							Can't find what you're looking for? Get in touch
							with our support team.
						</Text>
					</Stack>

					<Group gap={10}>
						<StyledButton>Contact Support</StyledButton>
					</Group>
				</Stack>
			</Card>

			<Card
				w={"100%"}
				radius={10}
				style={{ border: `1px solid ${T.blue[0]}` }}
				mt={30}
				pb={30}
			>
				<Stack gap={20}>
					<Stack gap={5}>
						<Title order={3}>Help us improve</Title>
						<Text size="sm" c="gray.7">
							If you'd like something added to the platform, we're
							always interested in getting feedback.
						</Text>
					</Stack>

					<Group gap={10}>
						<StyledButton>Leave Feedback</StyledButton>
						<StyledButton>Request a Feature</StyledButton>
					</Group>
				</Stack>
			</Card>
		</Stack>
	);
};

export default Faqs;
