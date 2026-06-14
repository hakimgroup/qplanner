import { Button, Group, Stack, Text } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { type ReactNode } from "react";

interface CTAProps {
	href: string;
	children: ReactNode;
	secondary?: { href: string; label: ReactNode };
	caption?: string;
	external?: boolean;
}

/**
 * Primary call-to-action row. Use one per landing page near the bottom.
 * Internal hrefs (anything starting with "/") route through react-router so
 * the user stays inside the SPA. External hrefs open in a new tab.
 */
export default function CTA({
	href,
	children,
	secondary,
	caption,
	external = false,
}: CTAProps) {
	const isInternal = !external && href.startsWith("/");

	const primary = isInternal ? (
		<Button
			component={Link}
			to={href}
			size="md"
			radius={10}
			color="violet"
			rightSection={<IconArrowRight size={16} />}
		>
			{children}
		</Button>
	) : (
		<Button
			component="a"
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			size="md"
			radius={10}
			color="violet"
			rightSection={<IconArrowRight size={16} />}
		>
			{children}
		</Button>
	);

	const secondaryButton = secondary
		? secondary.href.startsWith("/") ? (
				<Button
					component={Link}
					to={secondary.href}
					size="md"
					radius={10}
					variant="subtle"
					color="violet"
				>
					{secondary.label}
				</Button>
			) : (
				<Button
					component="a"
					href={secondary.href}
					target="_blank"
					rel="noopener noreferrer"
					size="md"
					radius={10}
					variant="subtle"
					color="violet"
				>
					{secondary.label}
				</Button>
			)
		: null;

	return (
		<Stack align="center" gap={8} mt={24} mb={24}>
			<Group gap={10} justify="center">
				{primary}
				{secondaryButton}
			</Group>
			{caption && (
				<Text size="xs" c="gray.5">
					{caption}
				</Text>
			)}
		</Stack>
	);
}
