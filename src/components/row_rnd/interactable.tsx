import { DragGesture } from '@use-gesture/vanilla';
import React, { type FC, type ReactElement, useEffect, useEffectEvent, useRef } from 'react';
import { type GestureEvent } from './gesture.types';
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

  useEffect(() => {
    draggableOptionsRef.current = draggableOptions;
    resizableOptionsRef.current = resizableOptions;
  }, [draggableOptions, resizableOptions]);

  const setInteractions = useEffectEvent(() => {
    if (!nodeRef.current) return;

    // Setup drag gesture
    if (draggable && draggableOptionsRef.current) {
      dragGestureRef.current = new DragGesture(
        nodeRef.current,
        (state) => {
          const { active, delta, xy, event, first, last } = state;

          // Ignore drag events if they originate from a resize handle
          const eventTarget = event?.target as HTMLElement;
          if (
            eventTarget &&
            (eventTarget === leftResizeHandleRef.current ||
              eventTarget === rightResizeHandleRef.current ||
              (leftResizeHandleRef.current && leftResizeHandleRef.current.contains(eventTarget)) ||
              (rightResizeHandleRef.current && rightResizeHandleRef.current.contains(eventTarget)))
          ) {
            return;
          }
          const gestureEvent: GestureEvent = {
            target: nodeRef.current!,
            dx: delta[0],
            dy: delta[1],
            clientX: xy[0],
            clientY: xy[1],
          };

          if (first) {
            // Start event - movement is 0 at start
            draggableOptionsRef.current?.onstart?.(gestureEvent);
          } else if (last) {
            // End event
            draggableOptionsRef.current?.onend?.(gestureEvent);
          } else if (active) {
            // Move event - calculate delta from last position
            draggableOptionsRef.current?.onmove?.(gestureEvent);
          }
        },
        {
          axis: draggableOptionsRef.current?.lockAxis === 'x' ? 'x' : undefined,
          pointer: { capture: true },
        },
      );
    }

    // Setup resize gestures
    if (resizable && resizableOptionsRef.current?.edges) {
      // Left resize
      if (resizableOptionsRef.current.edges.left) {
        if (!leftResizeHandleRef.current) {
          leftResizeHandleRef.current = nodeRef.current!.querySelector(resizableOptionsRef.current.edges.left) as HTMLDivElement;
        }

        leftResizeGestureRef.current = new DragGesture(
          leftResizeHandleRef.current,
          (state) => {
            const { active, delta, xy, first, last } = state;

            const gestureEvent: GestureEvent = {
              target: nodeRef.current!,
              dx: delta[0],
              dy: 0,
              clientX: xy[0],
              clientY: xy[1],
              edges: { left: true },
              deltaRect: { left: delta[0] },
            };

            if (last) {
              // End event
              resizableOptionsRef.current?.onend?.(gestureEvent);
            } else if (first) {
              // Start event
              resizableOptionsRef.current?.onstart?.(gestureEvent);
            } else if (active) {
              // Move event
              resizableOptionsRef.current?.onmove?.(gestureEvent);
            }
          },
          { pointer: { capture: true } },
        );
      }

      // Right resize
      if (resizableOptionsRef.current.edges.right) {
        if (!rightResizeHandleRef.current) {
          rightResizeHandleRef.current = nodeRef.current!.querySelector(resizableOptionsRef.current.edges.right) as HTMLDivElement;
        }

        rightResizeGestureRef.current = new DragGesture(
          rightResizeHandleRef.current,
          (state) => {
            const { active, delta, xy, first, last } = state;

            const gestureEvent: GestureEvent = {
              target: nodeRef.current!,
              dx: delta[0],
              dy: 0,
              clientX: xy[0],
              clientY: xy[1],
              edges: { right: true },
              deltaRect: { right: delta[0] },
            };

            if (last) {
              // End event
              resizableOptionsRef.current?.onend?.(gestureEvent);
            } else if (first) {
              // Start event
              resizableOptionsRef.current?.onstart?.(gestureEvent);
            } else if (active) {
              // Move event
              resizableOptionsRef.current?.onmove?.(gestureEvent);
            }
          },
          { pointer: { capture: true } },
        );
      }
    }
  });

  useEffect(() => {
    if (!nodeRef.current) return;

    // Clean up old gestures
    dragGestureRef.current?.destroy();
    leftResizeGestureRef.current?.destroy();
    rightResizeGestureRef.current?.destroy();

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
  }, [draggable, resizable, interactRef]);

  // eslint-disable-next-line react-hooks/refs
  return slot({ children, ref: nodeRef, draggable: false, style: { ...(draggable && { touchAction: 'none' }) } });
};
