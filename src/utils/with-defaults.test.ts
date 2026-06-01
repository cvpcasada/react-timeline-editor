import { describe, expect, it } from "vite-plus/test";
import { MIN_SCALE_COUNT } from "@/interface/const";
import { withDefaults } from "./with-defaults";

describe("withDefaults", () => {
  it("clamps zero minScaleCount before comparing maxScaleCount", () => {
    const props = withDefaults({
      editorData: [],
      effects: {},
      minScaleCount: 0,
      maxScaleCount: 5,
    });

    expect(props.minScaleCount).toBe(MIN_SCALE_COUNT);
    expect(props.maxScaleCount).toBe(MIN_SCALE_COUNT);
  });

  it("clamps zero maxScaleCount when minScaleCount is omitted", () => {
    const props = withDefaults({
      editorData: [],
      effects: {},
      maxScaleCount: 0,
    });

    expect(props.maxScaleCount).toBe(MIN_SCALE_COUNT);
  });

  it("drops invalid per-row collapsed heights without mutating input rows", () => {
    const row = {
      id: "captions",
      collapsed: { height: 0, expandedByDefault: true },
      actions: [],
    };

    const props = withDefaults({
      editorData: [row],
      effects: {},
      collapsedRowHeight: 18,
    });

    expect(props.editorData[0]?.collapsed).toEqual({
      height: undefined,
      expandedByDefault: true,
    });
    expect(row.collapsed.height).toBe(0);
  });
});
