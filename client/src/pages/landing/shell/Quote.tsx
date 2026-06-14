import { Avatar, Box, Group, Stack, Text, useMantineTheme } from "@mantine/core";
import { IconQuote } from "@tabler/icons-react";
import { type ReactNode } from "react";

interface QuoteProps {
	children: ReactNode;
	attribution?: string;
	role?: string;
	avatar?: string;
}

/**
 * Pull-quote / testimonial block. Use for one strong line — keep it short.
 * `attribution` and `role` render under the quote.
 */
export default function Quote({
	children,
	attribution,
	role,
	avatar,
}: QuoteProps) {
	const T = useMantineTheme().colors;

	const initials = (attribution ?? "")
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((p) => p[0]?.toUpperCase())
		.join("");

	return (
		<Box
			p="xl"
			my={32}
			style={{
				borderRadius: 16,
				background: `linear-gradient(135deg, ${T.violet[0]} 0%, ${T.blue[0]} 100%)`,
				border: `1px solid ${T.violet[1]}`,
				position: "relative",
			}}
		>
			<Box
				style={{
					position: "absolute",
					top: 16,
					left: 16,
					color: T.violet[3],
				}}
			>
				<IconQuote size={32} stroke={1.5} />
			</Box>

			<Stack gap={16} pl={40}>
				<Text
					size="lg"
					c="gray.9"
					fw={500}
					style={{ fontStyle: "italic", lineHeight: 1.5 }}
				>
					{children}
				</Text>

				{attribution && (
					<Group gap={10} align="center">
						<Avatar
							src={avatar}
							color="violet"
							radius="xl"
							size="sm"
							variant={avatar ? "filled" : "light"}
						>
							{initials || "—"}
						</Avatar>
						<Stack gap={0}>
							<Text size="sm" fw={700} c="gray.9">
								{attribution}
							</Text>
							{role && (
								<Text size="xs" c="violet.7" fw={600}>
									{role}
								</Text>
							)}
						</Stack>
					</Group>
				)}
			</Stack>
		</Box>
	);
}
