import Table, { TableHandle } from "@/components/table/Table";
import { PlanRow } from "@/models/selection.models";
import {
	activityColors,
	sourceColors,
	statusColors,
} from "@/shared/shared.const";
import { formatAvailabilityForUI } from "@/shared/shared.utilities";
import { ActionIcon, Badge, Stack, Text, useMantineTheme } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import { ColDef } from "ag-grid-community";
import { format } from "date-fns";
import { startCase, upperFirst } from "lodash";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import PlansActions from "./PlansActions";

interface Props {
	loading: boolean;
	data: PlanRow[];
	setSelectedRowIds: (ids: string[]) => void;
}

// Re-export a handle so parent can call exportCsv()
export type PlansTableHandle = TableHandle;

const PlansTable = forwardRef<PlansTableHandle, Props>(
	({ loading, data, setSelectedRowIds }, ref) => {
		const T = useMantineTheme().colors;
		const tableRef = useRef<TableHandle>(null);
		const [row, setRow] = useState<PlanRow>(null);

		// 🔁 Forward the inner table's methods (like exportCsv) to the parent
		useImperativeHandle(ref, () => ({
			exportCsv: (overrides) => tableRef.current?.exportCsv(overrides),
			clearSelection: () => tableRef.current?.clearSelection(),
		}));

		const colDefs: ColDef[] = [
			{
				field: "practice",
				flex: 1,
				cellRenderer: ({ value }) => (
					<Text size="sm" c="gray.9">
						{value}
					</Text>
				),
			},
			{
				field: "campaign",
				width: 250,
				cellRenderer: ({ value }) => (
					<Text size="sm" c="gray.9">
						{value}
					</Text>
				),
			},
			{
				field: "category",
				headerName: "Activity",
				sortable: false,
				width: 180,
				cellRenderer: ({ value }) => (
					<Badge
						variant="light"
						color={activityColors[value]}
						size="sm"
						fw={700}
						style={{ border: `1px solid ${T.blue[0]}` }}
					>
						{value}
					</Badge>
				),
			},
			{
				field: "source",
				sortable: false,
				width: 120,
				cellRenderer: ({ value }) => (
					<Badge
						variant="light"
						color={sourceColors[value]}
						size="sm"
						fw={700}
						style={{ border: `1px solid ${T.blue[0]}` }}
					>
						{upperFirst(value)}
					</Badge>
				),
			},
			{
				field: "status",
				sortable: false,
				width: 170,
				cellRenderer: ({ value }) => (
					<Badge
						variant="light"
						color={statusColors[value]}
						size="sm"
						fw={700}
						style={{ border: `1px solid ${T.blue[0]}` }}
					>
						{startCase(value)}
					</Badge>
				),
			},
			{
				field: "from",
				headerName: "From",
				hide: true,
			},
			{
				field: "end",
				headerName: "To",
				hide: true,
			},
			{
				field: "av",
				headerName: "Availability",
				width: 190,
				sortable: false,
				filter: false,
				cellRenderer: (p) => {
					const from: Date | null = p?.data?.from ?? null;
					const to: Date | null = p?.data?.end ?? null;
					return (
						<Text size="xs" c="gray.9" fw={500}>
							{p.data.category === "Event"
								? format(from, "MMMM dd, yyyy")
								: formatAvailabilityForUI({ from, to })}
						</Text>
					);
				},
			},
			{
				field: "updated_at",
				headerName: "Last Updated",
				sortable: false,
				filter: false,
				cellRenderer: ({ value }) => (
					<Text size="xs" c="gray.9" fw={500}>
						{format(value, "MMM dd, yyyy")}
					</Text>
				),
			},
			{
				field: "",
				headerName: "Actions",
				sortable: false,
				flex: 1,
				filter: false,
				cellRenderer: (p) => (
					<Stack>
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
					</Stack>
				),
			},
		];

		return (
			<Table
				ref={tableRef}
				loading={loading}
				rows={data && data.length ? data : []}
				cols={colDefs}
				enableSelection={true}
				height={550}
				onSelect={(r) => {
					setSelectedRowIds(r.map((cp) => cp.id));
				}}
			/>
		);
	}
);

export default PlansTable;
