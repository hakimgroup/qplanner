import { SegmentedControl, Center, Stack, Text } from "@mantine/core";
import { useState } from "react";

const StyledTabs = () => {
	const [value, setValue] = useState("browse");

	return (
		<SegmentedControl
			className="styled-tab"
			radius={10}
			transitionDuration={500}
			value={value}
			onChange={setValue}
			data={[
				{
					value: "browse",
					label: (
						<Center pt={10} pb={10}>
							<Stack gap={4}>
								<Text fw={700} size="sm" c={"gray.9"}>
									🎯 Select Marketing Campaigns
								</Text>
								<Text size="xs">Browse and add campaigns</Text>
							</Stack>
						</Center>
					),
				},
				{
					value: "selected",
					label: (
						<Center pt={10} pb={10}>
							<Stack gap={4}>
								<Text fw={700} size="sm" c={"gray.9"}>
									✓ Practice Selections
								</Text>
								<Text size="xs">
									View your chosen campaigns
								</Text>
							</Stack>
						</Center>
					),
				},
			]}
		/>
	);
};

export default StyledTabs;
