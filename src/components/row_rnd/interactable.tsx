import { useDrag } from "@use-gesture/react";
import React, { type FC, useLayoutEffect, useRef } from "react";
import { Slot } from "radix-ui";
import { type GestureEvent } from "./gesture-types";

interface DraggableOptions {
  lockAxis?: "x" | "y";
  onstart?: (e: GestureEvent) => void;
  onmove?: (e: GestureEvent) => void;
  onend?: (e: GestureEvent) => void;
  cursorChecker?: () => string;
}

interface ResizableOptions {
  axis?: "x" | "y";
  invert?: string;
  edges?: {
    left?: false | string;
    right?: false | string;
    top?: string;
    bottom?: string;
  };
  onstart?: (e: GestureEvent) => void;
  onmove?: (e: GestureEvent) => void;
  onend?: (e: GestureEvent) => void;
}

/**
 * Helper function to create a GestureEvent from gesture state
 */
const createGestureEvent = (
  target: HTMLElement,
  delta: [number, number],
  xy: [number, number],
  edges?: GestureEvent["edges"],
  deltaRect?: GestureEvent["deltaRect"]
): GestureEvent => ({
  target,
  dx: delta[0],
  dy: delta[1],
  clientX: xy[0],
  clientY: xy[1],
  ...(edges && { edges }),
  ...(deltaRect && { deltaRect }),
});

/**
 * Helper function to check if an event target is a resize handle
 */
const isResizeHandle = (
  eventTarget: HTMLElement | null,
  leftHandle: HTMLElement | null,
  rightHandle: HTMLElement | null
): boolean => {
  if (!eventTarget) return false;
  return (
    eventTarget === leftHandle ||
    eventTarget === rightHandle ||
    (leftHandle?.contains(eventTarget) ?? false) ||
    (rightHandle?.contains(eventTarget) ?? false)
  );
};

type InteractableProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  draggable: boolean;
  resizable: boolean;
  draggableOptions: DraggableOptions;
  resizableOptions: ResizableOptions;
  ref?: React.RefObject<HTMLElement | null>;
};

export const Interactable: FC<InteractableProps> = ({
  children,
  style,
  draggable,
  resizable,
  draggableOptions,
  resizableOptions,
  ref,
}) => {
  const draggableOptionsRef = useRef<DraggableOptions | undefined>(undefined);
  const resizableOptionsRef = useRef<ResizableOptions | undefined>(undefined);

  const leftResizeHandleRef = useRef<HTMLDivElement | null>(null);
  const rightResizeHandleRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    draggableOptionsRef.current = draggableOptions;
    resizableOptionsRef.current = resizableOptions;

    // Update resize handle refs when options change
    if (!ref?.current) return;

    const currentLeftSelector = resizableOptions?.edges?.left;
    const currentRightSelector = resizableOptions?.edges?.right;

    const node = ref.current;

    if (currentLeftSelector) {
      leftResizeHandleRef.current = node.querySelector(
        currentLeftSelector
      ) as HTMLDivElement | null;
    }

    if (currentRightSelector) {
      rightResizeHandleRef.current = node.querySelector(
        currentRightSelector
      ) as HTMLDivElement | null;
    }
  }, [draggableOptions, ref, resizableOptions]);

  // Setup drag gesture using @use-gesture/react
  useDrag(
    ({ active, delta, xy, event, first, last }) => {
      const node = ref?.current;
      if (!node) return;

      // Ignore drag events if they originate from a resize handle
      if (
        isResizeHandle(
          event?.target as HTMLElement | null,
          leftResizeHandleRef.current,
          rightResizeHandleRef.current
        )
      ) {
        return;
      }

      const gestureEvent = createGestureEvent(
        node,
        delta as [number, number],
        xy as [number, number]
      );

      if (first) {
        draggableOptionsRef.current?.onstart?.(gestureEvent);
      } else if (last) {
        draggableOptionsRef.current?.onend?.(gestureEvent);
      } else if (active) {
        draggableOptionsRef.current?.onmove?.(gestureEvent);
      }
    },
    {
      enabled: draggable,
      axis: draggableOptions?.lockAxis === "x" ? "x" : undefined,
      pointer: { capture: true },
      target: ref,
      threshold: 0,
    }
  );

  // Setup left resize gesture
  useDrag(
    ({ active, delta, xy, first, last }) => {
      const node = ref?.current;
      if (!node) return;

      const gestureEvent = createGestureEvent(
        node,
        delta as [number, number],
        xy as [number, number],
        { left: true },
        { left: delta[0] }
      );

      if (first) {
        resizableOptionsRef.current?.onstart?.(gestureEvent);
      } else if (last) {
        resizableOptionsRef.current?.onend?.(gestureEvent);
      } else if (active) {
        resizableOptionsRef.current?.onmove?.(gestureEvent);
      }
    },
    {
      enabled: resizable,
      target: leftResizeHandleRef,
      pointer: { capture: true },
      threshold: 0,
    }
  );

  // Setup right resize gesture
  useDrag(
    ({ active, delta, xy, first, last }) => {
      const node = ref?.current;
      if (!node) return;

      const gestureEvent = createGestureEvent(
        node,
        delta as [number, number],
        xy as [number, number],
        { right: true },
        { right: delta[0] }
      );

      if (first) {
        resizableOptionsRef.current?.onstart?.(gestureEvent);
      } else if (last) {
        resizableOptionsRef.current?.onend?.(gestureEvent);
      } else if (active) {
        resizableOptionsRef.current?.onmove?.(gestureEvent);
      }
    },
    {
      enabled: resizable,
      target: rightResizeHandleRef,
      pointer: { capture: true },
      threshold: 0,
    }
  );

  return (
    <Slot.Root
      ref={ref}
      style={{ ...(draggable ? { touchAction: "none" } : {}), ...style }}
      draggable={false}
    >
      {children}
    </Slot.Root>
  );
};
