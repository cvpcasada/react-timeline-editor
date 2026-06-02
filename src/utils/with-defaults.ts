import {
  DEFAULT_ROW_HEIGHT,
  DEFAULT_SCALE,
  DEFAULT_SCALE_SPLIT_COUNT,
  DEFAULT_SCALE_WIDTH,
  DEFAULT_START_LEFT,
  MIN_SCALE_COUNT,
} from "@/interface/const";
import { type TimelineEditor } from "@/interface/timeline";

export function withDefaults(props: TimelineEditor) {
  let {
    editorData = [],
    effects = {},
    scale = DEFAULT_SCALE,
    scaleSplitCount = DEFAULT_SCALE_SPLIT_COUNT,
    scaleWidth = DEFAULT_SCALE_WIDTH,
    startLeft = DEFAULT_START_LEFT,
    minScaleCount,
    maxScaleCount = Infinity,
    rowHeight = DEFAULT_ROW_HEIGHT,
    collapsedRowHeight,
    autoScrollSpeed = 1,
    autoScrollMaxSpeed = 10,
  } = props;

  if (scale <= 0) {
    console.error("Error: scale must be greater than 0!");
    scale = DEFAULT_SCALE;
  }

  if (scaleSplitCount <= 0) {
    console.warn("Warning: scaleSplitCount cannot be less than 1!");
    scaleSplitCount = 1;
  }

  if (scaleWidth <= 0) {
    console.warn("Warning: scaleWidth must be greater than 0!");
    scaleWidth = DEFAULT_SCALE_WIDTH;
  }

  if (startLeft < 0) {
    console.warn("Warning: startLeft cannot be less than 0!");
    startLeft = 0;
  }

  if (typeof minScaleCount === "number") {
    minScaleCount = parseInt(minScaleCount + "");

    if (minScaleCount < 1) {
      console.warn("Warning: minScaleCount must be greater than 1!");
      minScaleCount = MIN_SCALE_COUNT;
    }
  }

  maxScaleCount =
    maxScaleCount === Infinity ? Infinity : parseInt(maxScaleCount + "");

  if (maxScaleCount < 1) {
    console.warn("Warning: maxScaleCount must be greater than 1!");
    maxScaleCount = MIN_SCALE_COUNT;
  }

  if (typeof minScaleCount === "number" && maxScaleCount < minScaleCount) {
    console.warn("Warning: maxScaleCount cannot be less than minScaleCount!");
    maxScaleCount = minScaleCount;
  }

  if (rowHeight <= 0) {
    console.warn("Warning: rowHeight must be greater than 0!");
    rowHeight = DEFAULT_ROW_HEIGHT;
  }

  if (typeof collapsedRowHeight !== "undefined" && collapsedRowHeight <= 0) {
    console.warn("Warning: collapsedRowHeight must be greater than 0!");
    collapsedRowHeight = rowHeight;
  }

  if (
    editorData.some(
      (row) =>
        typeof row.collapsed?.height !== "undefined" &&
        row.collapsed.height <= 0
    )
  ) {
    console.warn("Warning: collapsed row height must be greater than 0!");
    editorData = editorData.map((row) =>
      typeof row.collapsed?.height !== "undefined" && row.collapsed.height <= 0
        ? {
            ...row,
            collapsed: {
              ...row.collapsed,
              height: undefined,
            },
          }
        : row
    );
  }

  const temp = { ...props };
  delete temp["style"];
  return {
    ...temp,
    editorData,
    effects,
    scale,
    scaleSplitCount,
    scaleWidth,
    startLeft,
    minScaleCount,
    maxScaleCount,
    rowHeight,
    collapsedRowHeight,
    autoScrollSpeed,
    autoScrollMaxSpeed,
  };
}
