import React, { type FC, useMemo, useRef, useState } from "react";
import { type TimelineAction, type TimelineRow } from "@/interface/action";
import { type CommonProp } from "@/interface/common-prop";
import {
  DEFAULT_SNAP_DISTANCE,
  DEFAULT_MOVE_GRID,
  DEFAULT_SCALE,
  DEFAULT_SCALE_SPLIT_COUNT,
  DEFAULT_SCALE_WIDTH,
  DEFAULT_START_LEFT,
} from "@/interface/const";
import { prefix } from "@/utils/deal-class-prefix";
import {
  getScaleCountByPixel,
  parserTimeToPixel,
  parserTimeToTransform,
  parserTransformToTime,
} from "@/utils/deal-data";
import { RowDnd } from "@/components/row_rnd/row-rnd";
import {
  type RndDragCallback,
  type RndDragEndCallback,
  type RndDragStartCallback,
  type RndResizeCallback,
  type RndResizeEndCallback,
  type RndResizeStartCallback,
  type RowRndApi,
} from "@/components/row_rnd/row-rnd-interface";
import { type SnapGuideLineData } from "./snap-lines";
import clsx from "@/utils/clsx";

export type EditActionProps = CommonProp & {
  row: TimelineRow;
  rowRenderHeight: number;
  action: TimelineAction;
  snapData: SnapGuideLineData;
  setEditorData: (params: TimelineRow[]) => void;
  handleTime: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => number;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  autoScroll?: boolean;
};

export const EditAction: FC<EditActionProps> = ({
  editorData,
  row,
  rowRenderHeight,
  action,
  effects,
  scale,
  scaleWidth,
  scaleSplitCount,
  startLeft,
  gridSnap,
  disableDrag,
  autoScroll,
  autoScrollSpeed,
  autoScrollMaxSpeed,

  scaleCount,
  maxScaleCount,
  setScaleCount,
  onActionMoveStart,
  onActionMoving,
  onActionMoveEnd,
  onActionResizeStart,
  onActionResizeEnd,
  onActionResizing,

  snapData,
  setEditorData,
  onClickAction,
  onClickActionOnly,
  onDoubleClickAction,
  onContextMenuAction,
  getActionRender,
  handleTime,
  scrollContainerRef,
}) => {
  const rowRnd = useRef<RowRndApi | null>(null);
  const isDragWhenClick = useRef(false);
  const {
    id,
    maxEnd,
    minStart,
    end,
    start,
    selected,
    flexible = true,
    movable = true,
    effectId,
  } = action;

  // Get default values for optional props
  const safeScale = scale ?? DEFAULT_SCALE;
  const safeScaleWidth = scaleWidth ?? DEFAULT_SCALE_WIDTH;
  const safeStartLeft = startLeft ?? DEFAULT_START_LEFT;
  const safeScaleSplitCount = scaleSplitCount ?? DEFAULT_SCALE_SPLIT_COUNT;
  const safeMaxScaleCount = maxScaleCount ?? Number.MAX_SAFE_INTEGER;

  // Get max/min pixel range
  const leftLimit = parserTimeToPixel(minStart || 0, {
    startLeft: safeStartLeft,
    scale: safeScale,
    scaleWidth: safeScaleWidth,
  });
  const rightLimit = Math.min(
    safeMaxScaleCount * safeScaleWidth + safeStartLeft, // Limit movement range based on maxScaleCount
    parserTimeToPixel(maxEnd || Number.MAX_VALUE, {
      startLeft: safeStartLeft,
      scale: safeScale,
      scaleWidth: safeScaleWidth,
    })
  );

  // Derive base transform from props
  const baseTransform = useMemo(() => {
    return parserTimeToTransform(
      { start, end },
      { startLeft: safeStartLeft, scale: safeScale, scaleWidth: safeScaleWidth }
    );
  }, [end, start, safeStartLeft, safeScaleWidth, safeScale]);

  // Track temporary drag/resize transform state
  const [dragTransform, setDragTransform] = useState<{
    left: number;
    width: number;
  } | null>(null);

  // Use drag transform if available, otherwise use base transform
  const transform = dragTransform ?? baseTransform;

  // Configure drag grid alignment properties
  const gridSize = safeScaleWidth / safeScaleSplitCount;

  // Action class names
  const classNames = prefix(
    clsx(
      "action",
      movable && "action-movable",
      selected && "action-selected",
      flexible && "action-flexible",
      effects[effectId] && `action-effect-${effectId}`
    )
  );

  /** Calculate scale count */
  const handleScaleCount = (left: number, width: number) => {
    const curScaleCount = getScaleCountByPixel(left + width, {
      startLeft: safeStartLeft,
      scaleCount,
      scaleWidth: safeScaleWidth,
    });
    if (curScaleCount !== scaleCount) setScaleCount(curScaleCount);
  };

  //#region [rgba(100,120,156,0.08)] Callbacks
  const handleDragStart: RndDragStartCallback = () => {
    onActionMoveStart && onActionMoveStart({ action, row });
  };
  const handleDrag: RndDragCallback = ({ left, width }) => {
    isDragWhenClick.current = true;

    if (onActionMoving) {
      const { start, end } = parserTransformToTime(
        { left, width },
        {
          scaleWidth: safeScaleWidth,
          scale: safeScale,
          startLeft: safeStartLeft,
        }
      );
      const result = onActionMoving({ action, row, start, end });
      if (result === false) return false;
    }
    setDragTransform({ left, width });
    handleScaleCount(left, width);
  };

  const handleDragEnd: RndDragEndCallback = ({ left, width }) => {
    // Calculate time
    const { start, end } = parserTransformToTime(
      { left, width },
      { scaleWidth: safeScaleWidth, scale: safeScale, startLeft: safeStartLeft }
    );

    // Set data
    const rowItem = editorData.find((item) => item.id === row.id);
    if (!rowItem) return;
    const actionItem = rowItem.actions.find((item) => item.id === id);
    if (!actionItem) return;
    actionItem.start = start;
    actionItem.end = end;
    setEditorData([...editorData]);

    // Execute callback
    if (onActionMoveEnd)
      onActionMoveEnd({ action: actionItem, row, start, end });
    setDragTransform(null);
  };

  const handleResizeStart: RndResizeStartCallback = (dir) => {
    onActionResizeStart && onActionResizeStart({ action, row, dir });
  };

  const handleResizing: RndResizeCallback = (dir, { left, width }) => {
    isDragWhenClick.current = true;
    if (onActionResizing) {
      const { start, end } = parserTransformToTime(
        { left, width },
        {
          scaleWidth: safeScaleWidth,
          scale: safeScale,
          startLeft: safeStartLeft,
        }
      );
      const result = onActionResizing({ action, row, start, end, dir });
      if (result === false) return false;
    }
    setDragTransform({ left, width });
    handleScaleCount(left, width);
  };

  const handleResizeEnd: RndResizeEndCallback = (dir, { left, width }) => {
    // Calculate time
    const { start, end } = parserTransformToTime(
      { left, width },
      { scaleWidth: safeScaleWidth, scale: safeScale, startLeft: safeStartLeft }
    );

    // Set data
    const rowItem = editorData.find((item) => item.id === row.id);
    if (!rowItem) return;
    const actionItem = rowItem.actions.find((item) => item.id === id);
    if (!actionItem) return;
    actionItem.start = start;
    actionItem.end = end;
    setEditorData([...editorData]);

    // Trigger callback
    if (onActionResizeEnd)
      onActionResizeEnd({ action: actionItem, row, start, end, dir });
    setDragTransform(null);
  };
  //#endregion

  const nowAction = {
    ...action,
    ...parserTransformToTime(
      { left: transform.left, width: transform.width },
      { startLeft: safeStartLeft, scaleWidth: safeScaleWidth, scale: safeScale }
    ),
  };

  const nowRow: TimelineRow = {
    ...row,
    actions: [...row.actions],
  };
  if (row.actions.includes(action)) {
    nowRow.actions[row.actions.indexOf(action)] = nowAction;
  }

  return (
    <RowDnd
      ref={rowRnd}
      parentRef={scrollContainerRef}
      start={safeStartLeft}
      left={transform.left}
      width={transform.width}
      grid={(gridSnap && gridSize) || DEFAULT_MOVE_GRID}
      snapDistance={
        gridSnap
          ? Math.max((gridSize || DEFAULT_MOVE_GRID) / 2, DEFAULT_SNAP_DISTANCE)
          : DEFAULT_SNAP_DISTANCE
      }
      snapPositions={snapData.assistPositions}
      getBounds={() => {
        return {
          left: leftLimit,
          right: rightLimit,
        };
      }}
      edges={{
        left: !disableDrag && flexible && `.${prefix("action-left-stretch")}`,
        right: !disableDrag && flexible && `.${prefix("action-right-stretch")}`,
      }}
      enableDragging={!disableDrag && movable}
      enableResizing={!disableDrag && flexible}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onResizeStart={handleResizeStart}
      onResize={handleResizing}
      onResizeEnd={handleResizeEnd}
      autoScroll={autoScroll}
      autoScrollSpeed={autoScrollSpeed}
      autoScrollMaxSpeed={autoScrollMaxSpeed}
    >
      <div
        onMouseDown={() => {
          isDragWhenClick.current = false;
        }}
        onClick={(e) => {
          let time: number | undefined;
          if (onClickAction) {
            time = handleTime(e);
            onClickAction(e, { row, action, time: time });
          }
          if (!isDragWhenClick.current && onClickActionOnly) {
            if (time === undefined) time = handleTime(e);
            onClickActionOnly(e, { row, action, time: time });
          }
        }}
        onDoubleClick={(e) => {
          if (onDoubleClickAction) {
            const time = handleTime(e);
            onDoubleClickAction(e, { row, action, time: time });
          }
        }}
        onContextMenu={(e) => {
          if (onContextMenuAction) {
            const time = handleTime(e);
            onContextMenuAction(e, { row, action, time: time });
          }
        }}
        className={classNames}
        style={{ height: rowRenderHeight }}
      >
        {getActionRender && getActionRender(nowAction, nowRow)}
        <div
          className={clsx(prefix("action-left-stretch"))}
          style={{
            touchAction: "none",
            visibility: flexible ? "visible" : "hidden",
            pointerEvents: flexible ? "auto" : "none",
          }}
        />
        <div
          className={prefix("action-right-stretch")}
          style={{
            touchAction: "none",
            visibility: flexible ? "visible" : "hidden",
            pointerEvents: flexible ? "auto" : "none",
          }}
        />
      </div>
    </RowDnd>
  );
};
