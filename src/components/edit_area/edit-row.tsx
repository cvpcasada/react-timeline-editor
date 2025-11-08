/* eslint-disable react-hooks/incompatible-library */

import React, { useLayoutEffect, type FC } from "react";
import { type TimelineRow } from "@/interface/action";
import { type CommonProp } from "@/interface/common-prop";
import {
  DEFAULT_SCALE,
  DEFAULT_SCALE_WIDTH,
  DEFAULT_START_LEFT,
} from "@/interface/const";
import { prefix } from "@/utils/deal-class-prefix";
import { parserPixelToTime, parserTimeToTransform } from "@/utils/deal-data";
import { type DragLineData } from "./drag-lines";
import { EditAction } from "./edit-action";
import { useVirtualizer } from "@tanstack/react-virtual";

export type EditRowProps = CommonProp & {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  rowData?: TimelineRow;
  style?: React.CSSProperties;
  dragLineData: DragLineData;
  setEditorData: (params: TimelineRow[]) => void;
};

export const EditRow: FC<EditRowProps> = (props) => {
  const {
    rowData,
    style = {},
    onClickRow,
    onDoubleClickRow,
    onContextMenuRow,
    scrollContainerRef,
    startLeft,
    scale,
    scaleWidth,
  } = props;

  const classNames = ["edit-row"];
  if (rowData?.selected) classNames.push("edit-row-selected");

  // Get default values for optional props
  const safeScale = scale ?? DEFAULT_SCALE;
  const safeScaleWidth = scaleWidth ?? DEFAULT_SCALE_WIDTH;
  const safeStartLeft = startLeft ?? DEFAULT_START_LEFT;

  const handleTime = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): number => {
    if (!scrollContainerRef.current) return 0;
    const rect = scrollContainerRef.current.getBoundingClientRect();
    const position = e.clientX - rect.x;
    const left = position;
    const time = parserPixelToTime(left, {
      startLeft: safeStartLeft,
      scale: safeScale,
      scaleWidth: safeScaleWidth,
    });
    return time;
  };

  const actions = rowData?.actions ?? [];

  const virtualizer = useVirtualizer({
    horizontal: true,
    count: actions.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: (index) => {
      if (!actions[index]) return 0;
      let { width } = parserTimeToTransform(
        { start: actions[index].start, end: actions[index].end },
        {
          startLeft: safeStartLeft,
          scale: safeScale,
          scaleWidth: safeScaleWidth,
        }
      );
      return width;
    },
    overscan: 3,
  });

  // Remeasure when scaleWidth or startLeft change
  useLayoutEffect(() => {
    virtualizer.measure();
  }, [scaleWidth, startLeft, virtualizer]);

  return (
    <div
      className={`${prefix(...classNames)} ${(rowData?.classNames || []).join(
        " "
      )}`}
      style={style}
      onClick={(e) => {
        if (rowData && onClickRow) {
          const time = handleTime(e);
          onClickRow(e, { row: rowData, time: time });
        }
      }}
      onDoubleClick={(e) => {
        if (rowData && onDoubleClickRow) {
          const time = handleTime(e);
          onDoubleClickRow(e, { row: rowData, time: time });
        }
      }}
      onContextMenu={(e) => {
        if (rowData && onContextMenuRow) {
          const time = handleTime(e);
          onContextMenuRow(e, { row: rowData, time: time });
        }
      }}
    >
      {rowData &&
        virtualizer.getVirtualItems().map((virtualEntry) => {
          const action = actions[virtualEntry.index];
          if (!action) throw new Error("Action not found");
          return (
            <EditAction
              key={action.id}
              {...props}
              handleTime={handleTime}
              row={rowData}
              action={action}
            />
          );
        })}
    </div>
  );
};
