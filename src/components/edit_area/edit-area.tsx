import React from "react";
import { type TimelineRow } from "@/interface/action";
import { type CommonProp } from "@/interface/common-prop";
import { EditRow } from "./edit-row";
import { SnapGuideLines } from "./snap-lines";
import { useSnap } from "./hooks/use-snap";

export type EditAreaProps = CommonProp & {
  /** Timeline height */
  timelineHeight: number;

  /** Set editor data */
  setEditorData: (params: TimelineRow[]) => void;

  /** Scroll element reference */
  scrollElementRef: React.RefObject<HTMLDivElement | null>;

  /** Snap positions */
  snapPositions?: { value: number; actionId: string; rowId?: string }[];
};

export const EditArea = ({
  ref,
  ...props
}: EditAreaProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
  const { snapData, handleInitSnap, handleUpdateSnap, disposeSnap } = useSnap({
    snap: props.snap,
    hideCursor: props.hideCursor,
    cursorTime: props.cursorTime,
    scaleWidth: props.scaleWidth,
    scale: props.scale,
    startLeft: props.startLeft,
    getAssistDragLineActionIds: props.getAssistDragLineActionIds,
    editorData: props.editorData,
    snapPositions: props.snapPositions,
  });

  const defaultRowHeight = props.rowHeight ?? 32;
  const currentScaleWidth = props.scaleWidth ?? 160;
  const currentStartLeft = props.startLeft ?? 20;
  // const currentRowHeight = rowHeight ?? 32;

  const contentWidth = Math.max(
    props.scaleCount * currentScaleWidth + currentStartLeft,
    props.timelineWidth
  );

  const [totalHeight, rows] = (() => {
    let result: React.ReactNode[] = [];

    // Get total height
    let currentHeight = 0;

    for (let i = 0; i < props.editorData.length; i++) {
      const row = props.editorData[i];
      if (!row) continue;

      const itemHeight = row.rowHeight || defaultRowHeight;

      result.push(
        <EditRow
          {...props}
          key={row.id}
          rowData={row}
          snapData={snapData}
          scrollContainerRef={props.scrollElementRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: contentWidth,
            height: `${itemHeight}px`,
            transform: `translateY(${currentHeight}px)`,
          }}
          onActionMoveStart={(data) => {
            handleInitSnap(data);
            return props.onActionMoveStart && props.onActionMoveStart(data);
          }}
          onActionResizeStart={(data) => {
            handleInitSnap(data);
            return props.onActionResizeStart && props.onActionResizeStart(data);
          }}
          onActionMoving={(data) => {
            handleUpdateSnap(data);
            return props.onActionMoving && props.onActionMoving(data);
          }}
          onActionResizing={(data) => {
            handleUpdateSnap(data);
            return props.onActionResizing && props.onActionResizing(data);
          }}
          onActionResizeEnd={(data) => {
            disposeSnap();
            return props.onActionResizeEnd && props.onActionResizeEnd(data);
          }}
          onActionMoveEnd={(data) => {
            disposeSnap();
            return props.onActionMoveEnd && props.onActionMoveEnd(data);
          }}
        />
      );

      currentHeight += itemHeight;
    }

    return [currentHeight, result] as const;
  })();

  return (
    <div
      ref={ref}
      style={{
        width: contentWidth,
        height: totalHeight,
        position: "relative",
        backgroundPositionX: `0, ${props.startLeft ?? 20}px`,
        backgroundSize: `${props.startLeft ?? 20}px, ${
          props.scaleWidth ?? 160
        }px`,
      }}
      className="timeline-editor-edit-area"
    >
      {rows}
      {props.snap && <SnapGuideLines {...snapData} />}
    </div>
  );
};
