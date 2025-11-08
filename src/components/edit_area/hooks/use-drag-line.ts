import { useState } from "react";
import { type TimelineAction, type TimelineRow } from "@/interface/action";
import { parserActionsToPositions, parserTimeToTransform } from "@/utils/deal-data";
import { type DragLineData } from "@/components/edit_area/drag-lines";

export function useDragLine() {
  const [dragLineData, setDragLineData] = useState<DragLineData>({ isMoving: false, movePositions: [], assistPositions: [] });

  /** Get auxiliary lines */
  const defaultGetAssistPosition = (data: {
    editorData: TimelineRow[];
    assistActionIds?: string[];
    action: TimelineAction;
    row: TimelineRow;
    startLeft: number;
    scale: number;
    scaleWidth: number;
    hideCursor: boolean;
    cursorLeft: number;
  }) => {
    const { editorData, assistActionIds, action, row, scale, scaleWidth, startLeft, cursorLeft, hideCursor } = data;
    const otherActions: TimelineAction[] = [];
    if (assistActionIds) {
      editorData.forEach((rowItem) => {
        rowItem.actions.forEach((actionItem) => {
          if (assistActionIds.includes(actionItem.id)) otherActions.push(actionItem);
        });
      });
    } else {
      editorData.forEach((rowItem) => {
        if (rowItem.id !== row.id) {
          otherActions.push(...rowItem.actions);
        } else {
          rowItem.actions.forEach((actionItem) => {
            if (actionItem.id !== action.id) otherActions.push(actionItem);
          });
        }
      });
    }

    const positions = parserActionsToPositions(otherActions, {
      startLeft,
      scale,
      scaleWidth,
    });
    if (!hideCursor) positions.push(cursorLeft);

    return positions;
  };

  /** Get current move marker */
  const defaultGetMovePosition = (data: { start: number; end: number; dir?: "right" | "left"; startLeft: number; scale: number; scaleWidth: number }) => {
    const { start, end, dir, scale, scaleWidth, startLeft } = data;
    const { left, width } = parserTimeToTransform({ start, end }, { startLeft, scaleWidth, scale });
    if (!dir) return [left, left + width];
    return dir === "right" ? [left + width] : [left];
  };

  /** Initialize drag lines */
  const initDragLine = (data: { movePositions?: number[]; assistPositions?: number[] }) => {
    const { movePositions, assistPositions } = data;

    setDragLineData({
      isMoving: true,
      movePositions: movePositions || [],
      assistPositions: assistPositions || [],
    });
  };

  /** Update drag line */
  const updateDragLine = (data: { movePositions?: number[]; assistPositions?: number[] }) => {
    const { movePositions, assistPositions } = data;
    setDragLineData((pre) => ({
      ...pre,
      movePositions: movePositions || pre.movePositions,
      assistPositions: assistPositions || pre.assistPositions,
    }));
  };

  /** Dispose drag lines */
  const disposeDragLine = () => {
    setDragLineData({ isMoving: false, movePositions: [], assistPositions: [] });
  };

  return {
    initDragLine,
    updateDragLine,
    disposeDragLine,
    dragLineData,
    defaultGetAssistPosition,
    defaultGetMovePosition,
  };
}
