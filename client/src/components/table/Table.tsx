import { useMantineTheme, rgba, Box } from "@mantine/core";
import { useMemo, useRef, forwardRef, useImperativeHandle, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, CsvExportParams, GetRowIdParams, themeQuartz } from "ag-grid-community";
import { useBreakpoints } from "@/shared/shared.hooks";

export type SortModelEntry = { colId: string; sort: "asc" | "desc" };

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
  onRowClick?: (row: any) => void;
  rowIdField?: string;
  /** Initial sort model — applied once on grid ready */
  initialSortModel?: SortModelEntry[];
  /** Fired whenever the user changes sort */
  onSortChanged?: (model: SortModelEntry[]) => void;
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
    onRowClick,
    loading,
    csvDefaults,
    rowIdField = "id",
    initialSortModel,
    onSortChanged,
  },
  ref
) {
  const gridRef = useRef<AgGridReact<any>>(null);
  const C = useMantineTheme().colors;
  const { isXs, isSm } = useBreakpoints();
  const isMobile = isXs || isSm;
  const rowBuffer = 0;

  // On mobile: unpin all columns and reduce minWidth values
  const mobileCols = useMemo(() => {
    if (!isMobile) return cols;
    return cols.map(({ pinned, lockPinned, ...rest }) => ({
      ...rest,
      pinned: null,
      lockPinned: false,
      minWidth: rest.minWidth ? Math.min(rest.minWidth, 120) : undefined,
      width: rest.width ? Math.min(rest.width, 150) : undefined,
    }));
  }, [cols, isMobile]);

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
    spacing: isMobile ? 8 : spacing,
    fontSize: isMobile ? 12 : undefined,
    accentColor: C.blue[3],
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const theme = useMemo(() => myTheme, [isMobile]); // rebuild when mobile state changes

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

  const onRowClicked = useCallback(
    (event: any) => {
      onRowClick?.(event.data);
    },
    [onRowClick]
  );

  // Show pointer cursor on hoverable rows
  const rowStyle = useMemo(
    () => (onRowClick ? { cursor: "pointer" } : undefined),
    [onRowClick]
  );

  // Apply initial sort once on grid ready
  const onGridReady = useCallback(
    (event: any) => {
      if (initialSortModel && initialSortModel.length > 0) {
        const colState = initialSortModel.map((s, i) => ({
          colId: s.colId,
          sort: s.sort,
          sortIndex: i,
        }));
        event.api.applyColumnState({
          state: colState,
          defaultState: { sort: null },
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onSortChangedInternal = useCallback(
    (event: any) => {
      if (!onSortChanged) return;
      const state = event.api.getColumnState() as Array<{
        colId: string;
        sort: "asc" | "desc" | null;
        sortIndex: number | null;
      }>;
      const sorted = state
        .filter((s) => s.sort)
        .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0))
        .map((s) => ({ colId: s.colId, sort: s.sort as "asc" | "desc" }));
      onSortChanged(sorted);
    },
    [onSortChanged]
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
        headerHeight={isMobile ? 36 : headerHeight}
        rowHeight={isMobile ? 60 : rowHeight}
        columnTypes={columnTypes}
        rowSelection={rowSelection as any}
        columnDefs={mobileCols}
        onSelectionChanged={onSelectionChanged}
        onRowClicked={onRowClick ? onRowClicked : undefined}
        onGridReady={onGridReady}
        onSortChanged={onSortChanged ? onSortChangedInternal : undefined}
        rowStyle={rowStyle}
        pagination={pagination}
      />
    </Box>
  );
});

export default Table;
