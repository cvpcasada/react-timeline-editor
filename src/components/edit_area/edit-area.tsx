import React, { useEffect } from "react";
import { type TimelineRow } from "@/interface/action";
import { type CommonProp } from "@/interface/common-prop";
import { type EditData } from "@/interface/timeline";
import { parserTimeToPixel } from "@/utils/deal-data";
import { EditRow } from "./edit-row";
import { useSnap } from "./hooks/use-snap";
import { SnapGuideLines } from "./snap-lines";

export type EditAreaProps = CommonProp & {
  /** Timeline height */
  timelineHeight: number;

  /** Set editor data */
  setEditorData: (params: TimelineRow[]) => void;

  /** Scroll element reference */
  scrollElementRef: React.RefObject<HTMLDivElement | null>;
};

export const EditArea = ({
  ref,
  ...props
}: EditAreaProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
  const {
    snapData,
    initSnap,
    updateSnap,
    disposeSnap,
    getActiveDragState,
    defaultGetAssistPosition,
    defaultGetMovePosition,
  } = useSnap();

  // React to snap prop changes during active drag/resize
  useEffect(() => {
    const activeDragState = getActiveDragState();

    // If snap is enabled and there's an active drag/resize operation
    if (props.snap && activeDragState && snapData.isMoving) {
      // Recalculate assist positions
      const currentScaleWidth = props.scaleWidth ?? 160;
      const currentScale = props.scale ?? 1;
      const currentStartLeft = props.startLeft ?? 20;
      const currentHideCursor = props.hideCursor ?? false;
      const cursorLeft = parserTimeToPixel(props.cursorTime, {
        scaleWidth: currentScaleWidth,
        scale: currentScale,
        startLeft: currentStartLeft,
      });

      const assistPositions = defaultGetAssistPosition({
        editorData: props.editorData,
        assistActionIds: activeDragState.assistActionIds,
        action: activeDragState.action,
        row: activeDragState.row,
        scale: currentScale,
        scaleWidth: currentScaleWidth,
        startLeft: currentStartLeft,
        hideCursor: currentHideCursor,
        cursorLeft,
      });

      updateSnap({ assistPositions });
    }
    // If snap is disabled and there's an active drag, clear assist positions
    else if (!props.snap && snapData.isMoving) {
      updateSnap({ assistPositions: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.snap, snapData.isMoving]);

  const handleInitSnap: EditData["onActionMoveStart"] = (data) => {
    const assistActionIds =
      props.getAssistDragLineActionIds &&
      props.getAssistDragLineActionIds({
        action: data.action,
        row: data.row,
        editorData: props.editorData,
      });

    if (props.snap) {
      const currentScaleWidth = props.scaleWidth ?? 160;
      const currentScale = props.scale ?? 1;
      const currentStartLeft = props.startLeft ?? 20;
      const currentHideCursor = props.hideCursor ?? false;
      const cursorLeft = parserTimeToPixel(props.cursorTime, {
        scaleWidth: currentScaleWidth,
        scale: currentScale,
        startLeft: currentStartLeft,
      });
      const assistPositions = defaultGetAssistPosition({
        editorData: props.editorData,
        assistActionIds,
        action: data.action,
        row: data.row,
        scale: currentScale,
        scaleWidth: currentScaleWidth,
        startLeft: currentStartLeft,
        hideCursor: currentHideCursor,
        cursorLeft,
      });
      initSnap({
        assistPositions,
        action: data.action,
        row: data.row,
        assistActionIds
      });
    } else {
      // Even if snap is off, track the drag state for reactive updates
      initSnap({
        assistPositions: [],
        action: data.action,
        row: data.row,
        assistActionIds
      });
    }
  };

  const handleUpdateSnap: EditData["onActionMoving"] = (data) => {
    if (props.snap) {
      const currentScaleWidth = props.scaleWidth ?? 160;
      const currentScale = props.scale ?? 1;
      const currentStartLeft = props.startLeft ?? 20;
      const movePositions = defaultGetMovePosition({
        ...data,
        startLeft: currentStartLeft,
        scaleWidth: currentScaleWidth,
        scale: currentScale,
      });
      updateSnap({ movePositions });
    }
  };

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
