import { useMantineTheme, rgba, Box } from "@mantine/core";
import { useMemo, useRef, forwardRef, useImperativeHandle } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, CsvExportParams, themeQuartz } from "ag-grid-community";

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
	/** Optional defaults for CSV export (overridable when calling exportCsv) */
	csvDefaults?: Partial<CsvExportParams>;
}

export type TableHandle = {
	/** Trigger CSV export from parent */
	exportCsv: (overrides?: Partial<CsvExportParams>) => void;
	clearSelection?: () => void;
};

const Table = forwardRef<TableHandle, Props>(function Table(
	{
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
		csvDefaults,
	},
	ref
) {
	const gridRef = useRef<AgGridReact<any>>(null);
	const C = useMantineTheme().colors;
	const rowBuffer = 0;

	const rowSelection = {
		mode: "multiRow",
		headerCheckbox: true,
	};

	const myTheme = themeQuartz.withParams({
		backgroundColor: "#fdfdfd",
		foregroundColor: C.gray[8],
		headerTextColor: C.gray[7],
		headerBackgroundColor: rgba(C.blue[3], 0.05),
		oddRowBackgroundColor: rgba(C.blue[3], 0.01),
		selectedRowBackgroundColor: rgba(C.blue[3], 0.1),
		headerColumnResizeHandleColor: C.gray[2],
		wrapperBorder: { color: rgba(C.blue[3], 0.15) },
		headerRowBorder: { color: rgba(C.blue[3], 0.1) },
		rowBorder: { color: rgba(C.violet[3], 0.3) },
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

	const theme = useMemo(() => myTheme, []); // themeQuartz.withParams returns stable config

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
			wrapText: true,
			autoHeight: true,
		};
	}, [rowCentered]);

	// Expose exportCsv to parent
	useImperativeHandle(ref, () => ({
		exportCsv: (overrides?: Partial<CsvExportParams>) => {
			const api = gridRef.current?.api;
			if (!api) return;

			// Default CSV params (can be overridden by caller)
			const baseParams: CsvExportParams = {
				fileName: "table.csv",
				allColumns: true,
				onlySelected: false,
				columnSeparator: ",",
				// Fallback to unwrap simple React nodes (e.g., Mantine <Text>)
				processCellCallback: (params) => {
					const v = params.value;
					if (v && typeof v === "object" && "props" in v) {
						return (v as any).props?.children ?? "";
					}
					return v ?? "";
				},
				...(csvDefaults || {}),
				...(overrides || {}),
			};

			api.exportDataAsCsv(baseParams);
		},
		clearSelection: () => {
			gridRef.current?.api?.deselectAll();
		},
	}));

	return (
		<Box h={height} w={"100%"}>
			<AgGridReact
				ref={gridRef}
				domLayout={autoHeight ? "autoHeight" : "normal"}
				animateRows={false}
				loading={loading}
				theme={theme}
				defaultColDef={defaultColDef as any}
				rowData={rows}
				rowBuffer={rowBuffer}
				rowModelType="clientSide"
				headerHeight={headerHeight}
				// rowHeight can be provided if you want fixed height; autoHeight is already on.
				// rowHeight={rowHeight}
				columnTypes={{
					text: { filter: "agTextColumnFilter" },
				}}
				// rowSelection={rowSelection as any}
				{...((enableSelection ? { rowSelection } : {}) as any)}
				columnDefs={cols}
				onSelectionChanged={(event) => {
					onSelect?.(event.selectedNodes.map((d) => d.data));
				}}
				onCellValueChanged={(event) =>
					console.log(`New Cell Value: ${event.value}`)
				}
				pagination
			/>
		</Box>
	);
});

export default Table;
