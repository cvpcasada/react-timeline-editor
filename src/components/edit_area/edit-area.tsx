import React from "react";
import { type TimelineRow } from "@/interface/action";
import { type CommonProp } from "@/interface/common-prop";
import { EditRow } from "./edit-row";
import { SnapGuideLines } from "./snap-lines";
import { useSnap } from "./hooks/use-snap";
import { type TimelineRowLayout } from "@/utils/row-layout";

export type EditAreaProps = CommonProp & {
  /** Timeline height */
  timelineHeight: number;

  /** Set editor data */
  setEditorData: (params: TimelineRow[]) => void;

  /** Scroll element reference */
  scrollElementRef: React.RefObject<HTMLDivElement | null>;

  /** Snap positions */
  snapPositions?: { value: number; actionId: string; rowId?: string }[];

  /** Computed row layouts */
  rowLayouts: TimelineRowLayout[];

  /** Computed row layout total height */
  rowLayoutsTotalHeight: number;

  /** Update hovered collapsible row */
  setHoveredRowId: (rowId: string | null) => void;

  /** Clear the hovered row when that row is left */
  clearHoveredRowId: (rowId: string) => void;

  /** Lock collapsible row during an interaction */
  setLockedRowId: (rowId: string | null) => void;
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

  const currentScaleWidth = props.scaleWidth ?? 160;
  const currentStartLeft = props.startLeft ?? 20;

  const contentWidth = Math.max(
    props.scaleCount * currentScaleWidth + currentStartLeft,
    props.timelineWidth
  );

  const rows = (() => {
    let result: React.ReactNode[] = [];

    for (const { row, top, height, isCollapsed } of props.rowLayouts) {
      result.push(
        <EditRow
          {...props}
          key={row.id}
          rowData={row}
          rowRenderHeight={height}
          isCollapsed={isCollapsed}
          snapData={snapData}
          scrollContainerRef={props.scrollElementRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: contentWidth,
            height: `${height}px`,
            transform: `translateY(${top}px)`,
          }}
          onPointerEnter={() => {
            if (row.collapsed) props.setHoveredRowId(row.id);
          }}
          onPointerLeave={() => {
            props.clearHoveredRowId(row.id);
          }}
          onActionMoveStart={(data) => {
            if (row.collapsed) props.setLockedRowId(row.id);
            handleInitSnap(data);
            return props.onActionMoveStart && props.onActionMoveStart(data);
          }}
          onActionResizeStart={(data) => {
            if (row.collapsed) props.setLockedRowId(row.id);
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
            props.setLockedRowId(null);
            disposeSnap();
            return props.onActionResizeEnd && props.onActionResizeEnd(data);
          }}
          onActionMoveEnd={(data) => {
            props.setLockedRowId(null);
            disposeSnap();
            return props.onActionMoveEnd && props.onActionMoveEnd(data);
          }}
        />
      );
    }

    return result;
  })();

  return (
    <div
      ref={ref}
      style={{
        width: contentWidth,
        height: props.rowLayoutsTotalHeight,
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
