import { type GestureEvent } from "@/components/row_rnd/gesture-types";
import { useRef } from "react";

const DEFAULT_SPEED = 1;
const MAX_SPEED = 10;
const CRITICAL_SIZE = 10;

export function useAutoScroll(
  target: React.RefObject<HTMLDivElement>,
  autoScrollSpeed: number = DEFAULT_SPEED,
  autoScrollMaxSpeed: number = MAX_SPEED
) {
  const leftBoundRef = useRef(Number.MIN_SAFE_INTEGER);
  const rightBoundRef = useRef(Number.MAX_SAFE_INTEGER);

  const speed = useRef(autoScrollSpeed);
  const frame = useRef<number | undefined>(undefined);

  const initAutoScroll = () => {
    if (target?.current) {
      const { left, width } = target.current.getBoundingClientRect();
      leftBoundRef.current = left;
      rightBoundRef.current = left + width;
    }
  };

  const dealDragAutoScroll = (
    e: GestureEvent,
    deltaScroll?: (delta: number) => void
  ) => {
    // Out of bounds
    if (
      e.clientX >= rightBoundRef.current ||
      e.clientX <= leftBoundRef.current
    ) {
      if (frame.current !== undefined) {
        cancelAnimationFrame(frame.current);
      }
      const over = Math.abs(
        e.clientX >= rightBoundRef.current
          ? e.clientX - rightBoundRef.current
          : e.clientX - leftBoundRef.current
      );
      speed.current = Math.min(
        Math.max(
          Math.ceil(over / CRITICAL_SIZE) * autoScrollSpeed,
          autoScrollSpeed
        ),
        autoScrollMaxSpeed
      );

      const dir = e.clientX >= rightBoundRef.current ? 1 : -1;
      const delta = dir * speed.current;
      const loop = () => {
        deltaScroll && deltaScroll(delta);
        frame.current = requestAnimationFrame(loop);
      };

      frame.current = requestAnimationFrame(loop);
      return false;
    } else {
      if (frame.current !== undefined) {
        cancelAnimationFrame(frame.current);
      }
    }

    return true;
  };

  const dealResizeAutoScroll = (
    e: GestureEvent,
    _dir: "left" | "right",
    deltaScroll?: (delta: number) => void
  ) => {
    if (
      e.clientX >= rightBoundRef.current ||
      e.clientX < leftBoundRef.current
    ) {
      if (frame.current !== undefined) {
        cancelAnimationFrame(frame.current);
      }
      const over = Math.abs(
        e.clientX >= rightBoundRef.current
          ? e.clientX - rightBoundRef.current
          : e.clientX - leftBoundRef.current
      );
      speed.current = Math.min(
        Math.max(
          Math.ceil(over / CRITICAL_SIZE) * autoScrollSpeed,
          autoScrollSpeed
        ),
        autoScrollMaxSpeed
      );

      const direction = e.clientX >= rightBoundRef.current ? 1 : -1;
      const delta = direction * speed.current;
      const loop = () => {
        deltaScroll && deltaScroll(delta);
        frame.current = requestAnimationFrame(loop);
      };

      frame.current = requestAnimationFrame(loop);

      return false;
    } else {
      if (frame.current !== undefined) {
        cancelAnimationFrame(frame.current);
      }
    }
    return true;
  };

  const stopAutoScroll = () => {
    leftBoundRef.current = Number.MIN_SAFE_INTEGER;
    rightBoundRef.current = Number.MAX_SAFE_INTEGER;
    speed.current = autoScrollSpeed;
    if (frame.current !== undefined) {
      cancelAnimationFrame(frame.current);
    }
  };

  return {
    initAutoScroll,
    dealDragAutoScroll,
    dealResizeAutoScroll,
    stopAutoScroll,
  };
}
