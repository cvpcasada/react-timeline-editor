import { useEffect, useEffectEvent, useRef, useState } from "react";
import { type TimelineAction, type TimelineRow } from "@/interface/action";
import { type CommonProp } from "@/interface/common-prop";
import { parserTimeToPixel, parserTimeToTransform } from "@/utils/deal-data";
import { type SnapGuideLineData } from "../snap-lines";

export type UseSnapProps = Pick<
  CommonProp,
  | "snap"
  | "hideCursor"
  | "cursorTime"
  | "scaleWidth"
  | "scale"
  | "startLeft"
  | "getAssistDragLineActionIds"
  | "editorData"
> & {
  snapPositions?: { value: number; actionId: string; rowId?: string }[];
};

export interface UseSnapReturn {
  snapData: SnapGuideLineData;
  handleInitSnap: (params: {
    action: TimelineAction;
    row: TimelineRow;
  }) => void;
  handleUpdateSnap: (data: {
    action: TimelineAction;
    row: TimelineRow;
    start: number;
    end: number;
    dir?: "right" | "left";
  }) => void;
  disposeSnap: () => void;
}

export const useSnap = (props: UseSnapProps): UseSnapReturn => {
  const [snapData, setSnapData] = useState<SnapGuideLineData>({
    isMoving: false,
    movePositions: [],
    assistPositions: [],
  });

  const activeDragStateRef = useRef<{
    action: TimelineAction;
    row: TimelineRow;
    assistActionIds?: string[];
  } | null>(null);

  // React to snap prop changes during active drag/resize
  const snapDataRef = useEffectEvent(() => ({
    ...props,
    snapData,
  }));

  useEffect(() => {
    const activeDragState = activeDragStateRef.current;
    const currentProps = snapDataRef();

    // If snap is enabled and there's an active drag/resize operation
    if (
      currentProps.snap &&
      activeDragState &&
      currentProps.snapData.isMoving &&
      currentProps.snapPositions
    ) {
      const assistActionIds = activeDragState.assistActionIds;

      // Filter snap positions: exclude current action's start/end
      // If assistActionIds is provided, only include those actions
      const assistPositions = currentProps.snapPositions
        .filter((pos) => {
          if (pos.actionId === activeDragState.action.id) return false;
          if (assistActionIds && !assistActionIds.includes(pos.actionId))
            return false;
          return true;
        })
        .map((pos) => pos.value);

      // Add cursor position if not hidden
      if (!currentProps.hideCursor) {
        const cursorLeft = parserTimeToPixel(currentProps.cursorTime, {
          scaleWidth: currentProps.scaleWidth ?? 160,
          scale: currentProps.scale ?? 1,
          startLeft: currentProps.startLeft ?? 20,
        });
        assistPositions.push(cursorLeft);
      }

      setSnapData((pre) => ({
        ...pre,
        assistPositions,
      }));
    }
    // If snap is disabled and there's an active drag, clear assist positions
    else if (!currentProps.snap && currentProps.snapData.isMoving) {
      setSnapData((pre) => ({
        ...pre,
        assistPositions: [],
      }));
    }
  }, [props.snap]);

  const handleInitSnap: (params: {
    action: TimelineAction;
    row: TimelineRow;
  }) => void = (data) => {
    const assistActionIds =
      props.getAssistDragLineActionIds &&
      props.getAssistDragLineActionIds({
        action: data.action,
        row: data.row,
        editorData: props.editorData,
      });

    activeDragStateRef.current = {
      action: data.action,
      row: data.row,
      assistActionIds,
    };

    if (props.snap && props.snapPositions) {
      // Filter snap positions: exclude current action's start/end
      // If assistActionIds is provided, only include those actions
      const assistPositions = props.snapPositions
        .filter((pos) => {
          if (pos.actionId === data.action.id) return false;
          if (assistActionIds && !assistActionIds.includes(pos.actionId))
            return false;
          return true;
        })
        .map((pos) => pos.value);

      // Add cursor position if not hidden
      if (!props.hideCursor) {
        const cursorLeft = parserTimeToPixel(props.cursorTime, {
          scaleWidth: props.scaleWidth ?? 160,
          scale: props.scale ?? 1,
          startLeft: props.startLeft ?? 20,
        });
        assistPositions.push(cursorLeft);
      }

      setSnapData({
        isMoving: true,
        movePositions: [],
        assistPositions,
      });
    } else {
      setSnapData({
        isMoving: true,
        movePositions: [],
        assistPositions: [],
      });
    }
  };

  const handleUpdateSnap = (data: {
    action: TimelineAction;
    row: TimelineRow;
    start: number;
    end: number;
    dir?: "right" | "left";
  }) => {
    if (props.snap) {
      const currentScaleWidth = props.scaleWidth ?? 160;
      const currentScale = props.scale ?? 1;
      const currentStartLeft = props.startLeft ?? 20;

      const { left, width } = parserTimeToTransform(
        { start: data.start, end: data.end },
        {
          startLeft: currentStartLeft,
          scaleWidth: currentScaleWidth,
          scale: currentScale,
        }
      );

      const movePositions = data.dir
        ? data.dir === "right"
          ? [left + width]
          : [left]
        : [left, left + width];

      setSnapData((pre) => ({
        ...pre,
        movePositions,
      }));
    }
  };

  const disposeSnap = () => {
    activeDragStateRef.current = null;
    setSnapData({ isMoving: false, movePositions: [], assistPositions: [] });
  };

  return {
    snapData,
    handleInitSnap,
    handleUpdateSnap,
    disposeSnap,
  };
};
