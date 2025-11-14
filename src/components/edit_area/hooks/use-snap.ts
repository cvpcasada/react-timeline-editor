import { useRef, useState } from "react";
import { type TimelineAction, type TimelineRow } from "@/interface/action";
import { parserActionsToPositions, parserTimeToTransform } from "@/utils/deal-data";
import { type SnapGuideLineData } from "@/components/edit_area/snap-lines";

type ActiveDragState = {
  action: TimelineAction;
  row: TimelineRow;
  assistActionIds?: string[];
} | null;

export function useSnap() {
  const [snapData, setSnapData] = useState<SnapGuideLineData>({ isMoving: false, movePositions: [], assistPositions: [] });
  // Track active drag state to enable reactive snap position updates
  const activeDragStateRef = useRef<ActiveDragState>(null);

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

  /** Initialize snap */
  const initSnap = (data: { movePositions?: number[]; assistPositions?: number[]; action: TimelineAction; row: TimelineRow; assistActionIds?: string[] }) => {
    const { movePositions, assistPositions, action, row, assistActionIds } = data;

    // Store active drag state for reactive updates
    activeDragStateRef.current = { action, row, assistActionIds };

    setSnapData({
      isMoving: true,
      movePositions: movePositions || [],
      assistPositions: assistPositions || [],
    });
  };

  /** Update snap */
  const updateSnap = (data: { movePositions?: number[]; assistPositions?: number[] }) => {
    const { movePositions, assistPositions } = data;
    setSnapData((pre) => ({
      ...pre,
      movePositions: movePositions || pre.movePositions,
      assistPositions: assistPositions || pre.assistPositions,
    }));
  };

  /** Dispose snap */
  const disposeSnap = () => {
    activeDragStateRef.current = null;
    setSnapData({ isMoving: false, movePositions: [], assistPositions: [] });
  };

  /** Get active drag state */
  const getActiveDragState = () => {
    return activeDragStateRef.current;
  };

  return {
    initSnap,
    updateSnap,
    disposeSnap,
    snapData,
    getActiveDragState,
    defaultGetAssistPosition,
    defaultGetMovePosition,
  };
}
