import { Box, Button, Center, Stack, Text, Title, useMantineTheme } from "@mantine/core";
import { IconArrowLeft, IconMoodLookDown } from "@tabler/icons-react";
import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";
import { getLandingPage } from "./registry";

export default function LandingPageRoute() {
	const { slug = "" } = useParams<{ slug: string }>();
	const entry = getLandingPage(slug);
	const T = useMantineTheme().colors;

	useEffect(() => {
		if (!entry) document.title = "Page not found · Hakim Group";
	}, [entry]);

	if (!entry) {
		return (
			<Center mih="100vh" p="lg">
				<Stack align="center" gap="md" maw={420} ta="center">
					<Box style={{ color: T.gray[5] }}>
						<IconMoodLookDown size={48} />
					</Box>
					<Title order={2} c="gray.9" style={{ fontSize: 22 }}>
						We couldn't find that page
					</Title>
					<Text size="sm" c="gray.6">
						No landing page is registered under{" "}
						<Text span fw={700} c="gray.8">
							/landing/{slug}
						</Text>
						. The link may have been retired or mistyped.
					</Text>
					<Button
						component={Link}
						to="/landing"
						leftSection={<IconArrowLeft size={14} />}
						radius={10}
						color="violet"
						mt="sm"
					>
						Back to landing pages
					</Button>
				</Stack>
			</Center>
		);
	}

	const Page = entry.Component;
	return <Page />;
}
