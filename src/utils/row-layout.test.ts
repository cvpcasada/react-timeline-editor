import { describe, expect, it } from "vite-plus/test";
import { getTimelineRowPresentation } from "./row-layout";

describe("getTimelineRowPresentation", () => {
  it("expands the locked collapsed row over hovered and default rows", () => {
    const presentation = getTimelineRowPresentation({
      editorData: [
        {
          id: "default",
          rowHeight: 48,
          collapsed: { height: 12, expandedByDefault: true },
          actions: [],
        },
        {
          id: "hovered",
          rowHeight: 50,
          collapsed: { height: 14 },
          actions: [],
        },
        {
          id: "locked",
          rowHeight: 60,
          collapsed: { height: 16 },
          actions: [],
        },
      ],
      rowHeight: 40,
      collapsedRowHeight: 10,
      hoveredRowId: "hovered",
      lockedRowId: "locked",
    });

    expect(presentation.layouts.map((layout) => layout.height)).toEqual([
      12, 14, 60,
    ]);
    expect(presentation.layouts.map((layout) => layout.top)).toEqual([
      0, 12, 26,
    ]);
    expect(presentation.totalHeight).toBe(86);
    expect(presentation.defaultExpandedRowIds).toEqual(["default"]);
  });

  it("ignores hover and lock ids for rows that are not collapsible", () => {
    const presentation = getTimelineRowPresentation({
      editorData: [
        { id: "fixed", rowHeight: 42, actions: [] },
        { id: "fallback", collapsed: { height: 8 }, actions: [] },
      ],
      rowHeight: 30,
      collapsedRowHeight: 10,
      hoveredRowId: "fixed",
      lockedRowId: "missing",
    });

    expect(presentation.layouts.map((layout) => layout.height)).toEqual([
      42, 8,
    ]);
  });
});
