import { DragGesture } from '@use-gesture/vanilla';
import React, { type FC, type ReactElement, useEffect, useEffectEvent, useRef } from 'react';
import { type GestureEvent } from './gesture-types';
import { slot } from '@/components/slot';

interface DraggableOptions {
  lockAxis?: 'x' | 'y';
  onstart?: (e: GestureEvent) => void;
  onmove?: (e: GestureEvent) => void;
  onend?: (e: GestureEvent) => void;
  cursorChecker?: () => string;
}

interface ResizableOptions {
  axis?: 'x' | 'y';
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
 * Wrapper object to maintain compatibility with code expecting Interactable interface
 */
interface InteractableWrapper {
  target?: HTMLElement;
  unset: () => void;
}

/**
 * Helper function to create a GestureEvent from gesture state
 */
const createGestureEvent = (
  target: HTMLElement,
  delta: [number, number],
  xy: [number, number],
  edges?: GestureEvent['edges'],
  deltaRect?: GestureEvent['deltaRect'],
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
  rightHandle: HTMLElement | null,
): boolean => {
  if (!eventTarget) return false;
  return (
    eventTarget === leftHandle ||
    eventTarget === rightHandle ||
    (leftHandle?.contains(eventTarget) ?? false) ||
    (rightHandle?.contains(eventTarget) ?? false)
  );
};

export const InteractComp: FC<{
  interactRef?: React.RefObject<InteractableWrapper | undefined>;
  draggable: boolean;
  draggableOptions: DraggableOptions;
  resizable: boolean;
  resizableOptions: ResizableOptions;
  children: ReactElement;
}> = ({ children, interactRef, draggable, resizable, draggableOptions, resizableOptions }) => {
  const nodeRef = useRef<HTMLElement>(null);
  const draggableOptionsRef = useRef<DraggableOptions | undefined>(undefined);
  const resizableOptionsRef = useRef<ResizableOptions | undefined>(undefined);

  const dragGestureRef = useRef<DragGesture | undefined>(undefined);
  const leftResizeGestureRef = useRef<DragGesture | undefined>(undefined);
  const rightResizeGestureRef = useRef<DragGesture | undefined>(undefined);

  const leftResizeHandleRef = useRef<HTMLDivElement | null>(null);
  const rightResizeHandleRef = useRef<HTMLDivElement | null>(null);
  const leftResizeSelectorRef = useRef<string | false | undefined>(undefined);
  const rightResizeSelectorRef = useRef<string | false | undefined>(undefined);

  useEffect(() => {
    draggableOptionsRef.current = draggableOptions;
    resizableOptionsRef.current = resizableOptions;
  }, [draggableOptions, resizableOptions]);

  const setInteractions = useEffectEvent(() => {
    const node = nodeRef.current;
    if (!node) return;

    // Clean up old gestures before creating new ones
    dragGestureRef.current?.destroy();
    leftResizeGestureRef.current?.destroy();
    rightResizeGestureRef.current?.destroy();

    // Reset gesture refs
    dragGestureRef.current = undefined;
    leftResizeGestureRef.current = undefined;
    rightResizeGestureRef.current = undefined;

    // Query resize handles if selectors have changed
    const currentLeftSelector = resizableOptionsRef.current?.edges?.left;
    const currentRightSelector = resizableOptionsRef.current?.edges?.right;

    if (currentLeftSelector !== leftResizeSelectorRef.current) {
      leftResizeSelectorRef.current = currentLeftSelector;
      leftResizeHandleRef.current = currentLeftSelector
        ? (node.querySelector(currentLeftSelector) as HTMLDivElement | null)
        : null;
    }

    if (currentRightSelector !== rightResizeSelectorRef.current) {
      rightResizeSelectorRef.current = currentRightSelector;
      rightResizeHandleRef.current = currentRightSelector
        ? (node.querySelector(currentRightSelector) as HTMLDivElement | null)
        : null;
    }

    // Setup drag gesture
    if (draggable && draggableOptionsRef.current) {
      dragGestureRef.current = new DragGesture(
        node,
        (state) => {
          const { active, delta, xy, event, first, last } = state;

          // Ignore drag events if they originate from a resize handle
          if (isResizeHandle(event?.target as HTMLElement | null, leftResizeHandleRef.current, rightResizeHandleRef.current)) {
            return;
          }

          const gestureEvent = createGestureEvent(node, delta, xy);

          if (first) {
            draggableOptionsRef.current?.onstart?.(gestureEvent);
          } else if (last) {
            draggableOptionsRef.current?.onend?.(gestureEvent);
          } else if (active) {
            draggableOptionsRef.current?.onmove?.(gestureEvent);
          }
        },
        {
          axis: draggableOptionsRef.current?.lockAxis === 'x' ? 'x' : undefined,
          threshold: 0,
          pointer: { capture: true },
        },
      );
    }

    // Setup resize gestures
    const options = resizableOptionsRef.current;
    if (resizable && options?.edges) {
      const edges = options.edges;

      // Left resize
      if (edges.left && leftResizeHandleRef.current) {
        leftResizeGestureRef.current = new DragGesture(
          leftResizeHandleRef.current,
          (state) => {
            const { active, delta, xy, first, last } = state;

            const gestureEvent = createGestureEvent(
              node,
              delta,
              xy,
              { left: true },
              { left: delta[0] },
            );

            if (first) {
              options.onstart?.(gestureEvent);
            } else if (last) {
              options.onend?.(gestureEvent);
            } else if (active) {
              options.onmove?.(gestureEvent);
            }
          },
          { pointer: { capture: true }, threshold: 0 },
        );
      }

      // Right resize
      if (edges.right && rightResizeHandleRef.current) {
        rightResizeGestureRef.current = new DragGesture(
          rightResizeHandleRef.current,
          (state) => {
            const { active, delta, xy, first, last } = state;

            const gestureEvent = createGestureEvent(
              node,
              delta,
              xy,
              { right: true },
              { right: delta[0] },
            );

            if (first) {
              options.onstart?.(gestureEvent);
            } else if (last) {
              options.onend?.(gestureEvent);
            } else if (active) {
              options.onmove?.(gestureEvent);
            }
          },
          { pointer: { capture: true }, threshold: 0 },
        );
      }
    }
  });

  useEffect(() => {
    if (!nodeRef.current) return;

    const interactableWrapper: InteractableWrapper = {
      target: nodeRef.current,
      unset: () => {
        dragGestureRef.current?.destroy();
        leftResizeGestureRef.current?.destroy();
        rightResizeGestureRef.current?.destroy();
      },
    };

    if (interactRef) {
      interactRef.current = interactableWrapper;
    }

    setInteractions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggable, resizable]);

  return slot({ children, ref: nodeRef, draggable: false, style: { ...(draggable && { touchAction: 'none' }) } });
};
