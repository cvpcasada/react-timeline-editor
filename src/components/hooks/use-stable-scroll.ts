import { useLayoutEffect, useRef } from "react";
import { parserTimeToPixel } from "@/utils/deal-data";

interface UseStableScrollOptions {
  /** Reference to the scrollable DOM element */
  scrollElementRef: React.RefObject<HTMLDivElement | null>;
  /** Current scale value */
  scale: number;
  /** Current scale width in pixels */
  scaleWidth: number;
  /** Start left offset */
  startLeft: number;
  /** Reference to the cursor time (the reference point for stability) */
  cursorTimeRef: React.RefObject<number>;
}

// todo: IDEA, to fix the clamping/overshoot issue, we can temporarily increate the scrollElement width

/**
 * Hook to maintain scroll position stability when scale or scaleWidth changes.
 * Uses the cursor time as a reference point to keep it visually stable.
 */
export function useStableScroll({
  scrollElementRef,
  scale,
  scaleWidth,
  startLeft,
  cursorTimeRef,
}: UseStableScrollOptions) {
  // Track previous scale and scaleWidth to detect changes
  const prevScaleRef = useRef<number | null>(null);
  const prevScaleWidthRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const scrollElement = scrollElementRef.current;
    if (
      prevScaleRef.current !== null &&
      prevScaleWidthRef.current !== null &&
      scrollElement &&
      (prevScaleRef.current !== scale ||
        prevScaleWidthRef.current !== scaleWidth)
    ) {
      const currentScrollLeft = scrollElement.scrollLeft;
      const cursorTime = cursorTimeRef.current;

      // Calculate cursor's pixel position with old scale/scaleWidth
      const oldCursorPixelPosition = parserTimeToPixel(cursorTime, {
        startLeft,
        scale: prevScaleRef.current,
        scaleWidth: prevScaleWidthRef.current,
      });

      // Calculate cursor's pixel position with new scale/scaleWidth
      const newCursorPixelPosition = parserTimeToPixel(cursorTime, {
        startLeft,
        scale,
        scaleWidth,
      });

      // Calculate the cursor's visual position relative to viewport (before change)
      const cursorVisualPosition = oldCursorPixelPosition - currentScrollLeft;

      // Calculate desired scroll position to keep the cursor visually stable
      let desiredScrollLeft = newCursorPixelPosition - cursorVisualPosition;

      scrollElement.scrollLeft = desiredScrollLeft;
    }

    // Update refs for next render
    prevScaleRef.current = scale;
    prevScaleWidthRef.current = scaleWidth;
  }, [scale, scaleWidth, startLeft, scrollElementRef, cursorTimeRef]);
}
