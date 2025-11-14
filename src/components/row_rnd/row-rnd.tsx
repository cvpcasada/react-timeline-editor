import { type GestureEvent } from "./gesture-types";
import React, {
  useEffect,
  useImperativeHandle,
  useRef
} from "react";
import {
  DEFAULT_SNAP_DISTANCE,
  DEFAULT_MOVE_GRID,
  DEFAULT_START_LEFT,
} from "@/interface/const";
import { useAutoScroll } from "./hooks/use-auto-scroll";
import { Interactable } from "./interactable";
import {
  type Direction,
  type RowRndApi,
  type RowRndProps,
} from "./row-rnd-interface";

// Helper function to parse dataset values
const parseDatasetValue = (
  value: string | undefined,
  defaultValue = 0
): number => {
  return value ? parseFloat(value) : defaultValue;
};

// Helper function to calculate snap position
const calculateSnap = (
  position: number,
  snapPositions: number[],
  snapDistance: number,
  minDis: number = Number.MAX_SAFE_INTEGER
): { snap: number; minDis: number } => {
  let snap = position;
  let currentMinDis = minDis;

  for (const item of snapPositions) {
    const dis = Math.abs(item - position);
    if (dis < snapDistance && dis < currentMinDis) {
      snap = item;
      currentMinDis = dis;
    }
  }

  return { snap, minDis: currentMinDis };
};

export const RowDnd = React.forwardRef<RowRndApi, RowRndProps>(
  (
    {
      children,
      edges,
      left,
      width,

      start = DEFAULT_START_LEFT,
      grid = DEFAULT_MOVE_GRID,
      getBounds = () => ({
        left: Number.MIN_SAFE_INTEGER,
        right: Number.MAX_SAFE_INTEGER,
      }),
      enableResizing = true,
      enableDragging = true,
      snapDistance = DEFAULT_SNAP_DISTANCE,
      snapPositions = [],
      onResizeStart,
      onResize,
      onResizeEnd,
      onDragStart,
      onDragEnd,
      onDrag,
      parentRef,
      autoScroll = true,
    },
    ref
  ) => {
    const interactableRef = useRef<HTMLElement>(null);
    const deltaX = useRef(0);
    const isSnap = useRef(false);
    const {
      initAutoScroll,
      stopAutoScroll,
      dealDragAutoScroll,
      dealResizeAutoScroll,
    } = useAutoScroll(parentRef as React.RefObject<HTMLDivElement>);

    //#region [rgba(100,120,156,0.08)] Assignment related APIs
    const handleUpdateLeft = (left: number, reset = true) => {
      if (!interactableRef.current) return;
      if (reset) deltaX.current = 0;
      const target = interactableRef.current;
      target.style.left = `${left}px`;
      target.dataset.left = String(left);
    };

    const handleUpdateWidth = (width: number, reset = true) => {
      if (!interactableRef.current) return;
      if (reset) deltaX.current = 0;
      const target = interactableRef.current;
      target.style.width = `${width}px`;
      target.dataset.width = String(width);
    };

    const handleGetLeft = () => {
      if (!interactableRef.current) return 0;
      return parseDatasetValue(interactableRef.current.dataset.left);
    };

    const handleGetWidth = () => {
      if (!interactableRef.current) return 0;
      return parseDatasetValue(interactableRef.current.dataset.width);
    };

    useEffect(() => {
      if (!interactableRef.current) return;
      const target = interactableRef.current;
      handleUpdateWidth(
        typeof width === "undefined" ? target.offsetWidth : width,
        false
      );
    }, [width]);

    useEffect(() => {
      handleUpdateLeft(left || 0, false);
    }, [left]);

    useImperativeHandle(ref, () => ({
      updateLeft: (left) => handleUpdateLeft(left || 0, false),
      updateWidth: (width) => handleUpdateWidth(width, false),
      getLeft: handleGetLeft,
      getWidth: handleGetWidth,
    }));
    //#endregion

    //#region [rgba(188,188,120,0.05)] Callback APIs
    const handleMoveStart = () => {
      deltaX.current = 0;
      isSnap.current = false;
      initAutoScroll();
      onDragStart?.();
    };

    const move = (param: {
      preLeft: number;
      preWidth: number;
      scrollDelta?: number;
    }) => {
      const { preLeft, preWidth, scrollDelta } = param;
      // Compensate element position when scrolling
      if (scrollDelta) {
        deltaX.current += scrollDelta;
      }
      const distance = isSnap.current ? snapDistance : grid;
      if (Math.abs(deltaX.current) < distance) return;

      const count = Math.trunc(deltaX.current / distance);
      let curLeft = preLeft + count * distance;

      // Control snap - check the leading edge based on movement direction
      const movingRight = deltaX.current > 0;
      const checkPosition = movingRight ? curLeft + preWidth : curLeft;
      const { snap: snapPosition } = calculateSnap(
        checkPosition,
        snapPositions,
        snapDistance
      );

      if (snapPosition !== checkPosition) {
        isSnap.current = true;
        // Adjust curLeft based on which edge snapped
        curLeft = movingRight ? snapPosition - preWidth : snapPosition;
      } else {
        // Control grid
        const offset = curLeft - start;
        if (offset % grid !== 0) {
          curLeft = start + grid * Math.round(offset / grid);
        }
        isSnap.current = false;
      }
      deltaX.current = deltaX.current % distance;

      // Control bounds - cache getBounds result
      const bounds = getBounds();
      if (curLeft < bounds.left) {
        curLeft = bounds.left;
      } else if (curLeft + preWidth > bounds.right) {
        curLeft = bounds.right - preWidth;
      }

      if (onDrag) {
        const ret = onDrag(
          {
            lastLeft: preLeft,
            left: curLeft,
            lastWidth: preWidth,
            width: preWidth,
          },
          scrollDelta
        );
        if (ret === false) return;
      }

      handleUpdateLeft(curLeft, false);
    };

    const handleMove = (e: GestureEvent) => {
      const target = e.target;
      const preLeft = parseDatasetValue(target.dataset.left);
      const preWidth = parseDatasetValue(target.dataset.width);

      deltaX.current += e.dx;

      // Handle auto-scroll if enabled
      if (autoScroll && parentRef?.current) {
        const deltaScroll = (delta: number) => {
          if (!parentRef?.current || !interactableRef.current) return;
          parentRef.current.scrollLeft += delta;
          // Read current position from dataset to compensate element position
          const currentTarget = interactableRef.current;
          const currentLeft = parseDatasetValue(currentTarget.dataset.left);
          const currentWidth = parseDatasetValue(currentTarget.dataset.width);
          // Compensate element position to follow scroll
          move({
            preLeft: currentLeft,
            preWidth: currentWidth,
            scrollDelta: delta,
          });
        };

        const shouldContinue = dealDragAutoScroll(e, deltaScroll);
        if (!shouldContinue) {
          return; // Auto-scroll is handling the movement
        }
      }

      move({ preLeft, preWidth });
    };

    const handleMoveStop = (e: GestureEvent) => {
      deltaX.current = 0;
      isSnap.current = false;
      stopAutoScroll();

      const target = e.target;
      onDragEnd?.({
        left: parseDatasetValue(target.dataset.left),
        width: parseDatasetValue(target.dataset.width),
      });
    };

    const handleResizeStart = (e: GestureEvent) => {
      deltaX.current = 0;
      isSnap.current = false;
      initAutoScroll();

      const dir: Direction = e.edges?.right ? "right" : "left";
      onResizeStart?.(dir);
    };

    const resize = (param: {
      preLeft: number;
      preWidth: number;
      dir: "left" | "right";
      scrollDelta?: number;
    }) => {
      const { dir, preWidth, preLeft, scrollDelta } = param;
      // Compensate element position when scrolling
      if (scrollDelta) {
        deltaX.current += scrollDelta;
      }
      const distance = isSnap.current ? snapDistance : grid;

      if (Math.abs(deltaX.current) < distance) return;

      const bounds = getBounds();

      if (dir === "left") {
        // Drag left side
        const count = Math.trunc(deltaX.current / distance);
        let curLeft = preLeft + count * distance;

        // Control snap
        const { snap } = calculateSnap(
          curLeft,
          snapPositions,
          snapDistance
        );

        if (snap !== curLeft) {
          isSnap.current = true;
          curLeft = snap;
        } else {
          // Control grid
          const offset = curLeft - start;
          if (offset % grid !== 0) {
            curLeft = start + grid * Math.round(offset / grid);
          }
          isSnap.current = false;
        }
        deltaX.current = deltaX.current % distance;

        // Control bounds
        if (curLeft < bounds.left) curLeft = bounds.left;
        const tempRight = preLeft + preWidth;
        const curWidth = tempRight - curLeft;

        // Lock component if resize exceeds the other end (right edge)
        if (curLeft >= tempRight) {
          return; // Don't move the component
        }

        if (onResize) {
          const ret = onResize("left", {
            lastLeft: preLeft,
            lastWidth: preWidth,
            left: curLeft,
            width: curWidth,
          });
          if (ret === false) return;
        }

        handleUpdateLeft(curLeft, false);
        handleUpdateWidth(curWidth, false);
      } else {
        // Drag right side
        const count = Math.trunc(deltaX.current / distance);
        let curWidth = preWidth + count * distance;
        const rightEdge = preLeft + curWidth;

        // Control snap
        const { snap } = calculateSnap(
          rightEdge,
          snapPositions,
          snapDistance
        );

        if (snap !== rightEdge) {
          isSnap.current = true;
          curWidth = snap - preLeft;
        } else {
          // Control grid
          let tempRight = preLeft + curWidth;
          const offset = tempRight - start;
          if (offset % grid !== 0) {
            tempRight = start + grid * Math.round(offset / grid);
            curWidth = tempRight - preLeft;
          }
          isSnap.current = false;
        }
        deltaX.current = deltaX.current % distance;

        // Control bounds
        if (preLeft + curWidth > bounds.right) {
          curWidth = bounds.right - preLeft;
        }

        // Lock component if resize exceeds the other end (left edge)
        if (curWidth <= 0) {
          return; // Don't move the component
        }

        if (onResize) {
          const ret = onResize("right", {
            lastLeft: preLeft,
            lastWidth: preWidth,
            left: preLeft,
            width: curWidth,
          });
          if (ret === false) return;
        }

        handleUpdateWidth(curWidth, false);
      }
    };

    const handleResize = (e: GestureEvent) => {
      const target = e.target;
      const dir = e.edges?.left ? "left" : "right";

      const preLeft = parseDatasetValue(target.dataset.left);
      const preWidth = parseDatasetValue(target.dataset.width);

      deltaX.current +=
        dir === "left" ? e.deltaRect?.left || 0 : e.deltaRect?.right || 0;

      // Handle auto-scroll if enabled
      if (autoScroll && parentRef?.current) {
        const deltaScroll = (delta: number) => {
          if (!parentRef?.current || !interactableRef.current) return;
          parentRef.current.scrollLeft += delta;
          // Read current position from dataset to compensate element position
          const currentTarget = interactableRef.current;
          const currentLeft = parseDatasetValue(currentTarget.dataset.left);
          const currentWidth = parseDatasetValue(currentTarget.dataset.width);
          // Compensate element position to follow scroll
          resize({
            preLeft: currentLeft,
            preWidth: currentWidth,
            dir,
            scrollDelta: delta,
          });
        };

        const shouldContinue = dealResizeAutoScroll(e, dir, deltaScroll);
        if (!shouldContinue) {
          return; // Auto-scroll is handling the movement
        }
      }

      resize({ preLeft, preWidth, dir });
    };

    const handleResizeStop = (e: GestureEvent) => {
      deltaX.current = 0;
      isSnap.current = false;
      stopAutoScroll();

      const target = e.target;
      const dir: Direction = e.edges?.right ? "right" : "left";
      onResizeEnd?.(dir, {
        left: parseDatasetValue(target.dataset.left),
        width: parseDatasetValue(target.dataset.width),
      });
    };
    //#endregion

    return (
      <Interactable
        style={{ left, width }}
        ref={interactableRef}
        draggable={enableDragging}
        resizable={enableResizing}
        draggableOptions={{
          lockAxis: "x",
          onmove: handleMove,
          onstart: handleMoveStart,
          onend: handleMoveStop,
          cursorChecker: () => "",
        }}
        resizableOptions={{
          axis: "x",
          invert: "none",
          edges,
          onmove: handleResize,
          onstart: handleResizeStart,
          onend: handleResizeStop,
        }}
      >
        {children}
      </Interactable>
    );
  }
);
