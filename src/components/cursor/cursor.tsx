import React, { type FC, useEffect, useRef } from "react";
import { type CommonProp } from "@/interface/common-prop";
import { prefix } from "@/utils/deal-class-prefix";
import { parserPixelToTime, parserTimeToPixel } from "@/utils/deal-data";
import { RowDnd } from "@/components/row_rnd/row-rnd";
import { type RowRndApi } from "@/components/row_rnd/row-rnd-interface";

/** Animation timeline component parameters */
export type CursorProps = CommonProp & {
  height: number;
  /** Set cursor position */
  setCursor: (param: { left?: number; time?: number }) => boolean;
  /** Timeline area DOM ref */
  scrollElementRef: React.RefObject<HTMLDivElement | null>;
};

export const Cursor: FC<CursorProps> = ({
  disableDrag,
  cursorTime,
  setCursor,
  startLeft,
  scaleWidth,
  scale,
  scaleCount,
  scaleSplitCount,
  scrollElementRef,
  maxScaleCount,
  onCursorDragStart,
  onCursorDrag,
  onCursorDragEnd,
}) => {
  const rowRnd = useRef<RowRndApi>(null);
  const draggingLeft = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (typeof draggingLeft.current === "undefined" && rowRnd.current) {
      // When not dragging, update cursor scale based on props
      const left = startLeft ?? 20;
      const width = scaleWidth ?? 160;
      const scaleValue = scale ?? 1;
      rowRnd.current.updateLeft(
        parserTimeToPixel(cursorTime, {
          startLeft: left,
          scaleWidth: width,
          scale: scaleValue,
        })
      );
    }
  }, [cursorTime, startLeft, scaleWidth, scale]);

  const leftStart = startLeft ?? 20;
  const width = scaleWidth ?? 160;
  const scaleValue = scale ?? 1;
  const maxCount = maxScaleCount ?? Infinity;

  const showUnit = (scaleSplitCount ?? 0) > 0;
  const splitCount = scaleSplitCount ?? 1;
  const columnCount = showUnit
    ? scaleCount * (scaleSplitCount ?? 1) + 1
    : scaleCount;

  const left = startLeft ?? 20;

  const totalWidth =
    (showUnit ? width / splitCount : width) * (columnCount - 1) + left;

  return (
    <RowDnd
      start={leftStart}
      ref={rowRnd}
      parentRef={scrollElementRef}
      getBounds={() => {
        return {
          left: 0,
          right: Math.min(
            totalWidth,
            maxCount * width +
              leftStart -
              (scrollElementRef.current?.scrollLeft ?? 0)
          ),
        };
      }}
      autoScroll
      enableDragging={!disableDrag}
      enableResizing={false}
      onDragStart={() => {
        // Get initial position from the cursor element
        // getLeft() returns absolute position (same coordinate system as parserTimeToPixel)
        const initialLeft =
          rowRnd.current?.getLeft() ??
          parserTimeToPixel(cursorTime, {
            startLeft: leftStart,
            scaleWidth: width,
            scale: scaleValue,
          });

        draggingLeft.current = initialLeft;

        // Calculate time the same way as click event: use absolute position directly
        // The click event uses e.clientX - rect.x which gives absolute position within timeline
        const time = parserPixelToTime(initialLeft, {
          startLeft: leftStart,
          scale: scaleValue,
          scaleWidth: width,
        });
        onCursorDragStart && onCursorDragStart(time);
        rowRnd.current?.updateLeft(initialLeft);
      }}
      onDragEnd={() => {
        if (typeof draggingLeft.current !== "undefined") {
          // Calculate time the same way as click event: use absolute position directly
          // draggingLeft.current is absolute position (same coordinate system as click event)
          const time = parserPixelToTime(draggingLeft.current, {
            startLeft: leftStart,
            scale: scaleValue,
            scaleWidth: width,
          });
          setCursor({ time });
          onCursorDragEnd && onCursorDragEnd(time);
        }
        draggingLeft.current = undefined;
      }}
      onDrag={({ left }, scrollDelta = 0) => {
        let currentScrollLeft = scrollElementRef.current?.scrollLeft ?? 0;
        const scrollElement = scrollElementRef.current;
        const viewportWidth = scrollElement?.clientWidth ?? 0;

        // Handle scroll compensation when auto-scroll is active
        if (scrollDelta !== 0) {
          // When auto-scrolling, compensate the cursor position by adding scrollDelta
          if (typeof draggingLeft.current !== "undefined") {
            draggingLeft.current += scrollDelta;

            // Ensure cursor stays visible within viewport
            // draggingLeft.current is relative to the scrollable content
            // It's visible if it's between currentScrollLeft and currentScrollLeft + viewportWidth
            const minVisibleLeft = currentScrollLeft;
            const maxVisibleLeft = currentScrollLeft + viewportWidth;

            // Keep cursor within visible bounds with a small margin
            const margin = 10; // pixels margin from edges
            if (draggingLeft.current < minVisibleLeft + margin) {
              draggingLeft.current = minVisibleLeft + margin;
            } else if (draggingLeft.current > maxVisibleLeft - margin) {
              draggingLeft.current = maxVisibleLeft - margin;
            }

            // Also ensure cursor stays within logical bounds
            if (draggingLeft.current < leftStart - currentScrollLeft) {
              draggingLeft.current = leftStart - currentScrollLeft;
            }
          } else {
            // Initialize draggingLeft if not set yet
            draggingLeft.current = left + scrollDelta;
            // Ensure it's visible
            const minVisibleLeft = currentScrollLeft;
            const maxVisibleLeft = currentScrollLeft + viewportWidth;
            const margin = 10;
            if (draggingLeft.current < minVisibleLeft + margin) {
              draggingLeft.current = minVisibleLeft + margin;
            } else if (draggingLeft.current > maxVisibleLeft - margin) {
              draggingLeft.current = maxVisibleLeft - margin;
            }
          }
        } else {
          // Normal drag (no auto-scroll)
          // When dragging, if current left < left min, set value to left min
          if (left < leftStart - currentScrollLeft)
            draggingLeft.current = leftStart - currentScrollLeft;
          else draggingLeft.current = left;

          // Ensure cursor stays visible in viewport during normal drag
          if (scrollElement && viewportWidth > 0) {
            const minVisibleLeft = currentScrollLeft;
            const maxVisibleLeft = currentScrollLeft + viewportWidth;
            const margin = 10;

            if (draggingLeft.current < minVisibleLeft + margin) {
              draggingLeft.current = minVisibleLeft + margin;
            } else if (draggingLeft.current > maxVisibleLeft - margin) {
              draggingLeft.current = maxVisibleLeft - margin;
            }
          }
        }

        if (typeof draggingLeft.current !== "undefined") {
          rowRnd.current?.updateLeft(draggingLeft.current);
          // Calculate time the same way as click event: use absolute position directly
          // The click event uses e.clientX - rect.x which gives absolute position within timeline
          // draggingLeft.current is absolute position (same coordinate system as click event)
          const time = parserPixelToTime(draggingLeft.current, {
            startLeft: leftStart,
            scale: scaleValue,
            scaleWidth: width,
          });
          setCursor({ time });
          onCursorDrag && onCursorDrag(time);
        }
        return false;
      }}
    >
      <div className={prefix("cursor")}>
        <svg
          className={prefix("cursor-top")}
          width="8"
          height="12"
          viewBox="0 0 8 12"
          fill="none"
        >
          <path
            d="M0 1C0 0.447715 0.447715 0 1 0H7C7.55228 0 8 0.447715 8 1V9.38197C8 9.76074 7.786 10.107 7.44721 10.2764L4.44721 11.7764C4.16569 11.9172 3.83431 11.9172 3.55279 11.7764L0.552786 10.2764C0.214002 10.107 0 9.76074 0 9.38197V1Z"
            fill="currentColor"
          />
        </svg>
        <div className={prefix("cursor-area")} />
      </div>
    </RowDnd>
  );
};
