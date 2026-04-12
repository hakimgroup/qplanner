import {
	Stack,
	Text,
	Box,
	useMantineTheme,
	rgba,
	Code,
	Group,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";

interface Props {
	before: Record<string, any>;
	after: Record<string, any>;
}

const fmt = (val: any): string => {
	if (val === null || val === undefined) return "—";
	if (typeof val === "string") return val || "—";
	if (typeof val === "boolean") return val ? "true" : "false";
	if (typeof val === "number") return String(val);
	try {
		return JSON.stringify(val, null, 2);
	} catch {
		return String(val);
	}
};

const isComplex = (val: any): boolean => {
	return typeof val === "object" && val !== null;
};

export default function GodModeDiffPreview({ before, after }: Props) {
	const T = useMantineTheme().colors;
	const keys = Object.keys(after);

	if (keys.length === 0) {
		return (
			<Text size="sm" c="gray.6">
				No changes detected.
			</Text>
		);
	}

	return (
		<Stack gap={8}>
			{keys.map((k) => {
				const beforeVal = before[k];
				const afterVal = after[k];
				const complex = isComplex(beforeVal) || isComplex(afterVal);

				return (
					<Box
						key={k}
						p="sm"
						style={{
							background: rgba(T.violet[0], 0.5),
							borderRadius: 10,
							border: `1px solid ${rgba(T.violet[3], 0.25)}`,
						}}
					>
						<Text
							size="xs"
							fw={700}
							c="violet.7"
							tt="uppercase"
							mb={6}
							style={{ letterSpacing: 0.4 }}
						>
							{k}
						</Text>
						{complex ? (
							<Stack gap={6}>
								<Box>
									<Text size="xs" c="gray.6" mb={2}>
										Before
									</Text>
									<Code
										block
										style={{
											fontSize: 11,
											background: rgba(T.red[0], 0.4),
											maxHeight: 160,
											overflow: "auto",
										}}
									>
										{fmt(beforeVal)}
									</Code>
								</Box>
								<Box>
									<Text size="xs" c="gray.6" mb={2}>
										After
									</Text>
									<Code
										block
										style={{
											fontSize: 11,
											background: rgba(T.green[0], 0.5),
											maxHeight: 160,
											overflow: "auto",
										}}
									>
										{fmt(afterVal)}
									</Code>
								</Box>
							</Stack>
						) : (
							<Group gap="xs" wrap="nowrap" align="center">
								<Box
									style={{
										flex: 1,
										minWidth: 0,
										padding: "6px 10px",
										background: rgba(T.red[0], 0.5),
										borderRadius: 6,
									}}
								>
									<Text
										size="xs"
										c="red.8"
										style={{
											wordBreak: "break-word",
										}}
									>
										{fmt(beforeVal)}
									</Text>
								</Box>
								<IconArrowRight size={14} color={T.gray[5]} />
								<Box
									style={{
										flex: 1,
										minWidth: 0,
										padding: "6px 10px",
										background: rgba(T.green[0], 0.6),
										borderRadius: 6,
									}}
								>
									<Text
										size="xs"
										c="green.8"
										style={{
											wordBreak: "break-word",
										}}
									>
										{fmt(afterVal)}
									</Text>
								</Box>
							</Group>
						)}
					</Box>
				);
			})}
		</Stack>
	);
}
