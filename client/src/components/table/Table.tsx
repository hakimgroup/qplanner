import { useMantineTheme, rgba, Box } from "@mantine/core";
import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import { ColDef, themeQuartz } from "ag-grid-community";
import _ from "lodash";

interface Props {
	cols: ColDef[];
	rows: any[];
	loading?: boolean;
	spacing?: number;
	rowCentered?: boolean;
	headerHeight?: number;
	rowHeight?: number;
	autoHeight?: boolean;
	height?: number;
	enableSelection?: boolean;
	onSelect?: (row: any[]) => void;
}

const Table = ({
	cols,
	rows,
	spacing = 15,
	rowCentered = true,
	headerHeight = 45,
	rowHeight,
	height = 300,
	autoHeight,
	enableSelection,
	onSelect,
	loading,
}: Props) => {
	const rowBuffer = 0;
	const C = useMantineTheme().colors;

	const rowSelection = {
		mode: enableSelection ? "multiRow" : undefined,
		headerCheckbox: true,
	};

	const myTheme = themeQuartz.withParams({
		backgroundColor: "#fdfdfd",
		foregroundColor: C.gray[8],
		headerTextColor: C.gray[7],
		headerBackgroundColor: rgba(C.blue[3], 0.05),
		oddRowBackgroundColor: rgba(C.blue[3], 0.025),
		selectedRowBackgroundColor: rgba(C.blue[3], 0.1),
		headerColumnResizeHandleColor: C.gray[2],
		wrapperBorder: { color: rgba(C.blue[3], 0.15) },
		headerRowBorder: { color: rgba(C.blue[3], 0.1) },
		rowBorder: { color: rgba(C.blue[3], 0.15) },
		rangeSelectionBorderStyle: "none",
		checkboxBorderRadius: 50,
		checkboxUncheckedBorderColor: C.blue[3],
		checkboxCheckedBackgroundColor: C.blue[3],
		inputBorder: { color: rgba(C.blue[3], 0.15) },
		inputFocusBorder: { color: rgba(C.blue[3], 1) },
		menuBackgroundColor: "#fdfdfd",
		menuBorder: { color: rgba(C.blue[3], 0.2) },
		menuShadow: { radius: 0, spread: 1, color: "transparent" },
		spacing,
		accentColor: C.blue[3],
	});

	const theme = useMemo(() => {
		return myTheme;
	}, []);

	const defaultColDef = useMemo(() => {
		return {
			editable: false,
			filter: false,
			sort: true,
			resizable: false,
			unSortIcon: true,
			...(rowCentered && {
				cellStyle: {
					display: "flex",
					alignItems: "center",
				},
			}),
			wrapText: true, // <-- let the cell wrap
			autoHeight: true, // <-- let the row grow to fit
		};
	}, []);

	return (
		<Box h={height} w={"100%"}>
			<AgGridReact
				domLayout={autoHeight ? "autoHeight" : "normal"}
				animateRows={false}
				loading={loading}
				theme={theme}
				defaultColDef={defaultColDef as any}
				rowData={rows}
				rowBuffer={rowBuffer}
				rowModelType="clientSide"
				// rowHeight={80}
				headerHeight={headerHeight}
				rowSelection={rowSelection as any}
				columnDefs={cols}
				onSelectionChanged={(event) => {
					onSelect(event.selectedNodes.map((d) => d.data));
				}}
				onCellValueChanged={(event) =>
					console.log(`New Cell Value: ${event.value}`)
				}
				pagination
			/>
		</Box>
	);
};

export default Table;
