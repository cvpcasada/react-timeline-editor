import { type TimelineRow } from "@/interface/action";

export interface TimelineRowLayout {
  row: TimelineRow;
  renderRow: TimelineRow;
  top: number;
  height: number;
}

export function getTimelineRowLayouts(params: {
  editorData: TimelineRow[];
  rowHeight: number;
  collapsedRowHeight: number;
  focusedRowId: string | null;
}) {
  const layouts: TimelineRowLayout[] = [];
  let totalHeight = 0;

  for (const row of params.editorData) {
    const expandedHeight = row.rowHeight || params.rowHeight;
    const collapsedHeight = row.collapsed?.height || params.collapsedRowHeight;
    const height =
      row.collapsed && row.id !== params.focusedRowId
        ? collapsedHeight
        : expandedHeight;

    layouts.push({
      row,
      renderRow: {
        ...row,
        rowHeight: height,
      },
      top: totalHeight,
      height,
    });
    totalHeight += height;
  }

  return { layouts, totalHeight };
}
