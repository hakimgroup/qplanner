import Table from "@/components/table/Table";
import { PlanRow } from "@/models/selection.models";
import {
	activityColors,
	sourceColors,
	statusColors,
} from "@/shared/shared.const";
import { formatAvailabilityForUI } from "@/shared/shared.utilities";
import { ActionIcon, Badge, Text, useMantineTheme } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import { ColDef } from "ag-grid-community";
import { format } from "date-fns";
import { startCase, upperFirst } from "lodash";
import { useState } from "react";
import PlansActions from "./PlansActions";

interface Props {
	loading: boolean;
	data: PlanRow[];
}

const PlansTable = ({ loading, data }: Props) => {
	const T = useMantineTheme().colors;
	const [row, setRow] = useState<PlanRow>(null);

	const colDefs: ColDef[] = [
		{
			field: "practice",
			flex: 1,
			cellRenderer: ({ value }) => {
				return (
					<Text size="sm" c="gray.9">
						{value}
					</Text>
				);
			},
		},
		{
			field: "campaign",

			width: 250,
			cellRenderer: ({ value }) => {
				return (
					<Text size="sm" c="gray.9">
						{value}
					</Text>
				);
			},
		},
		{
			field: "category",
			headerName: "Activity",
			sortable: false,
			width: 180,
			cellRenderer: ({ value }) => {
				return (
					<Badge
						variant="light"
						color={activityColors[value]}
						size="sm"
						fw={700}
						style={{ border: `1px solid ${T.blue[0]}` }}
					>
						{value}
					</Badge>
				);
			},
		},
		{
			field: "source",
			sortable: false,
			width: 120,
			cellRenderer: ({ value }) => {
				return (
					<Badge
						variant="light"
						color={sourceColors[value]}
						size="sm"
						fw={700}
						style={{ border: `1px solid ${T.blue[0]}` }}
					>
						{upperFirst(value)}
					</Badge>
				);
			},
		},
		{
			field: "status",
			sortable: false,
			width: 170,
			cellRenderer: ({ value }) => {
				return (
					<Badge
						variant="light"
						color={statusColors[value]}
						size="sm"
						fw={700}
						style={{ border: `1px solid ${T.blue[0]}` }}
					>
						{startCase(value)}
					</Badge>
				);
			},
		},
		{
			field: "from",
			headerName: "Availability",
			width: 190,
			sortable: false,
			filter: false,
			cellRenderer: (p) => {
				const from: Date | null = p?.value ?? null;
				const to: Date | null = p?.data?.end ?? null;

				return (
					<Text size="xs" c="gray.9" fw={500}>
						{formatAvailabilityForUI({
							from,
							to,
						})}
					</Text>
				);
			},
		},
		{
			field: "updated_at",
			headerName: "Last Updated",
			sortable: false,
			filter: false,
			cellRenderer: ({ value }) => {
				return (
					<Text size="xs" c="gray.9" fw={500}>
						{format(value, "MMM dd, yyyy")}
					</Text>
				);
			},
		},
		{
			field: "",
			headerName: "Actions",
			sortable: false,
			flex: 1,
			filter: false,
			cellRenderer: (p) => {
				return (
					<>
						<ActionIcon
							variant="subtle"
							size={"input-sm"}
							radius={10}
							color="violet.9"
							onClick={() => setRow(p.data)}
						>
							<IconEye size={23} />
						</ActionIcon>

						<PlansActions
							opened={row?.id === p.data.id}
							row={row}
							closePanel={() => setRow(null)}
						/>
					</>
				);
			},
		},
	];

	return (
		<Table
			loading={loading}
			rows={data && data.length ? data : []}
			cols={colDefs}
			enableSelection={true}
			height={550}
			onSelect={(r) => {
				// setSelectedRows(r.map((cp) => cp.id));
			}}
		/>
	);
};

export default PlansTable;
