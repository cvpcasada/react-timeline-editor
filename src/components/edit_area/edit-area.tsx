import React from "react";
import { type TimelineRow } from "@/interface/action";
import { type CommonProp } from "@/interface/common-prop";
import { type EditData } from "@/interface/timeline";
import { parserTimeToPixel } from "@/utils/deal-data";
import { EditRow } from "./edit-row";
import { useDragLine } from "./hooks/use-drag-line";
import { DragLines } from "./drag-lines";

export type EditAreaProps = CommonProp & {
  /** Timeline height */
  timelineHeight: number;

  /** Set editor data */
  setEditorData: (params: TimelineRow[]) => void;

  /** Scroll element reference */
  scrollElementRef: React.RefObject<HTMLDivElement | null>;
};

export const EditArea = (
  props: EditAreaProps & { ref?: React.RefObject<HTMLDivElement | null> }
) => {
  const {
    dragLineData,
    initDragLine,
    updateDragLine,
    disposeDragLine,
    defaultGetAssistPosition,
    defaultGetMovePosition,
  } = useDragLine();

  const handleInitDragLine: EditData["onActionMoveStart"] = (data) => {
    if (props.dragLine) {
      const assistActionIds =
        props.getAssistDragLineActionIds &&
        props.getAssistDragLineActionIds({
          action: data.action,
          row: data.row,
          editorData: props.editorData,
        });
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
      initDragLine({ assistPositions });
    }
  };

  const handleUpdateDragLine: EditData["onActionMoving"] = (data) => {
    if (props.dragLine) {
      const currentScaleWidth = props.scaleWidth ?? 160;
      const currentScale = props.scale ?? 1;
      const currentStartLeft = props.startLeft ?? 20;
      const movePositions = defaultGetMovePosition({
        ...data,
        startLeft: currentStartLeft,
        scaleWidth: currentScaleWidth,
        scale: currentScale,
      });
      updateDragLine({ movePositions });
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

  return (
    <div
      style={{
        width: contentWidth,
        position: "relative",
        backgroundPositionX: `0, ${props.startLeft ?? 20}px`,
        backgroundSize: `${props.startLeft ?? 20}px, ${
          props.scaleWidth ?? 160
        }px`,
      }}
      className="timeline-editor-edit-area"
    >
      {(() => {
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
              dragLineData={dragLineData}
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
                handleInitDragLine(data);
                return props.onActionMoveStart && props.onActionMoveStart(data);
              }}
              onActionResizeStart={(data) => {
                handleInitDragLine(data);
                return (
                  props.onActionResizeStart && props.onActionResizeStart(data)
                );
              }}
              onActionMoving={(data) => {
                handleUpdateDragLine(data);
                return props.onActionMoving && props.onActionMoving(data);
              }}
              onActionResizing={(data) => {
                handleUpdateDragLine(data);
                return props.onActionResizing && props.onActionResizing(data);
              }}
              onActionResizeEnd={(data) => {
                disposeDragLine();
                return props.onActionResizeEnd && props.onActionResizeEnd(data);
              }}
              onActionMoveEnd={(data) => {
                disposeDragLine();
                return props.onActionMoveEnd && props.onActionMoveEnd(data);
              }}
            />
          );

          currentHeight += itemHeight;
        }

        return result;
      })()}

      {props.dragLine && (
        <DragLines {...dragLineData} />
      )}
    </div>
  );
};
