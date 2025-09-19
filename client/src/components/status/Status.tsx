import { Badge, Flex, Text } from "@mantine/core";
import { IconCircleCheck } from "@tabler/icons-react";
import { statusColors } from "@/shared/shared.const";

type StatusValue =
	| "onPlan"
	| "inProgress"
	| "requested"
	| "confirmed"
	| "live"
	| "cancelled";

const STATUS_LABELS: Record<StatusValue, string> = {
	onPlan: "On Plan",
	inProgress: "In Progress",
	requested: "Requested",
	confirmed: "Confirmed",
	live: "Live",
	cancelled: "Cancelled",
};

// Allow passing either a value ("onPlan") or a label ("On Plan")
// We'll normalize common spellings and map to a StatusValue
const toStatusValue = (raw?: string | null): StatusValue | undefined => {
	if (!raw) return undefined;
	const key = raw.toLowerCase().replace(/[\s_-]/g, "");
	const map: Record<string, StatusValue> = {
		onplan: "onPlan",
		inprogress: "inProgress",
		requested: "requested",
		confirmed: "confirmed",
		live: "live",
		cancelled: "cancelled",
		canceled: "cancelled", // US spelling fallback
	};
	return map[key];
};

interface StatusProps {
	status?: string | null;
}

const Status: React.FC<StatusProps> = ({ status }) => {
	const value = toStatusValue(status);
	const label = value ? STATUS_LABELS[value] : "Available";
	const color = value ? statusColors[value] : "black";

	return (
		<Badge variant="light" color={color} miw={100}>
			<Flex align={"center"} gap={5}>
				{value === "onPlan" && (
					<IconCircleCheck size={15} stroke={2.4} />
				)}
				<Text fw={700} size="xs" mt={1}>
					{label}
				</Text>
			</Flex>
		</Badge>
	);
};

export default Status;
