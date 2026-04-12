import { Stack, Text, Textarea, Box } from "@mantine/core";

interface Props {
	value: string;
	onChange: (val: string) => void;
}

/**
 * Optional reason text input used by every God Mode mutation modal.
 * Reasons are written to god_mode_log so future-you can understand
 * why a change was made.
 */
export default function GodModeReasonField({ value, onChange }: Props) {
	return (
		<Stack gap={4}>
			<Text size="xs" c="gray.6" fw={600} tt="uppercase" style={{ letterSpacing: 0.4 }}>
				Reason (optional)
			</Text>
			<Textarea
				value={value}
				onChange={(e) => onChange(e.currentTarget.value)}
				placeholder="Why are you making this change? e.g. 'Fixing typo reported by practice'"
				autosize
				minRows={2}
				maxRows={4}
				radius="md"
			/>
			<Text size="xs" c="gray.5">
				This reason will be saved to the God Mode audit log.
			</Text>
		</Stack>
	);
}
