import { useMantineTheme, rgba, Box } from "@mantine/core";
import { useMemo, useRef, forwardRef, useImperativeHandle, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, CsvExportParams, GetRowIdParams, themeQuartz } from "ag-grid-community";

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
  pagination?: boolean;
  csvDefaults?: Partial<CsvExportParams>;
  onSelect?: (row: any[]) => void;
  rowIdField?: string;
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
    pagination = true,
    onSelect,
    loading,
    csvDefaults,
    rowIdField = "id",
  },
  ref
) {
  const gridRef = useRef<AgGridReact<any>>(null);
  const C = useMantineTheme().colors;
  const rowBuffer = 0;

  const rowSelection = useMemo(
    () =>
      enableSelection
        ? { mode: "multiRow" as const, headerCheckbox: true }
        : undefined,
    [enableSelection]
  );

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

  const getRowId = useCallback(
    (params: GetRowIdParams) => params.data?.[rowIdField] ?? params.data?.id,
    [rowIdField]
  );

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

  const columnTypes = useMemo(
    () => ({ text: { filter: "agTextColumnFilter" } }),
    []
  );

  const onSelectionChanged = useCallback(
    (event: any) => {
      onSelect?.(event.selectedNodes.map((d: any) => d.data));
    },
    [onSelect]
  );

  return (
    <Box h={height} w={"100%"}>
      <AgGridReact
        ref={gridRef}
        domLayout={autoHeight ? "autoHeight" : "normal"}
        animateRows={false}
        theme={theme}
        defaultColDef={defaultColDef as any}
        rowData={rows}
        rowBuffer={rowBuffer}
        rowModelType="clientSide"
        getRowId={getRowId}
        headerHeight={headerHeight}
        columnTypes={columnTypes}
        rowSelection={rowSelection as any}
        columnDefs={cols}
        onSelectionChanged={onSelectionChanged}
        pagination={pagination}
      />
    </Box>
  );
});

export default Table;
