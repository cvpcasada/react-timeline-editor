import { type TimelineRow } from "@/interface/action";

export interface TimelineRowLayout {
  row: TimelineRow;
  top: number;
  height: number;
}

export interface TimelineRowPresentation {
  layouts: TimelineRowLayout[];
  totalHeight: number;
  defaultExpandedRowIds: string[];
}

export function getTimelineRowPresentation(params: {
  editorData: TimelineRow[];
  rowHeight: number;
  collapsedRowHeight: number;
  hoveredRowId: string | null;
  lockedRowId: string | null;
}): TimelineRowPresentation {
  const layouts: TimelineRowLayout[] = [];
  let totalHeight = 0;
  const collapsibleRowIds = new Set(
    params.editorData.filter((row) => row.collapsed).map((row) => row.id)
  );
  const defaultExpandedRowIds = params.editorData
    .filter((row) => row.collapsed?.expandedByDefault)
    .map((row) => row.id);
  const focusedRowId =
    (params.lockedRowId && collapsibleRowIds.has(params.lockedRowId)
      ? params.lockedRowId
      : null) ??
    (params.hoveredRowId && collapsibleRowIds.has(params.hoveredRowId)
      ? params.hoveredRowId
      : null) ??
    defaultExpandedRowIds[0] ??
    null;

  for (const row of params.editorData) {
    const expandedHeight = row.rowHeight || params.rowHeight;
    const collapsedHeight = row.collapsed?.height ?? params.collapsedRowHeight;
    const height =
      row.collapsed && row.id !== focusedRowId
        ? collapsedHeight
        : expandedHeight;

    layouts.push({
      row,
      top: totalHeight,
      height,
    });
    totalHeight += height;
  }

  return {
    layouts,
    totalHeight,
    defaultExpandedRowIds,
  };
}
