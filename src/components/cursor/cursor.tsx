import React, { type FC, useEffect, useRef } from "react";
import { type CommonProp } from "@/interface/common-prop";
import { prefix } from "@/utils/deal-class-prefix";
import { parserPixelToTime, parserTimeToPixel } from "@/utils/deal-data";
import { RowDnd } from "@/components/row_rnd/row-rnd";
import {
  type RowRndApi,
  type SnapPosition,
} from "@/components/row_rnd/row-rnd-interface";
import { DEFAULT_SNAP_DISTANCE } from "@/interface/const";

/** Animation timeline component parameters */
export type CursorProps = CommonProp & {
  height: number;
  /** Set cursor position */
  setCursor: (param: { left?: number; time?: number }) => boolean;
  /** Timeline area DOM ref */
  scrollElementRef: React.RefObject<HTMLDivElement | null>;
  /** Enable cursor snap to action endpoints when dragging */
  cursorSnap?: boolean;
  /** Snap positions */
  snapPositions?: SnapPosition[];
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
  cursorSnap,
  autoScrollSpeed,
  autoScrollMaxSpeed,
  snapPositions = [],
}) => {
  const rowRnd = useRef<RowRndApi>(null);

  // Define constants early for use in calculations
  const leftStart = startLeft ?? 20;
  const width = scaleWidth ?? 160;
  const scaleValue = scale ?? 1;

  // Filter snap positions if cursorSnap is enabled
  const activeSnapPositions = !cursorSnap ? [] : snapPositions;

  useEffect(() => {
    if (rowRnd.current) {
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
      autoScrollSpeed={autoScrollSpeed}
      autoScrollMaxSpeed={autoScrollMaxSpeed}
      enableDragging={!disableDrag}
      enableResizing={false}
      snapPositions={activeSnapPositions}
      snapDistance={DEFAULT_SNAP_DISTANCE}
      snapOrigin="left"
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

        // Calculate time the same way as click event: use absolute position directly
        // The click event uses e.clientX - rect.x which gives absolute position within timeline
        const time = parserPixelToTime(initialLeft, {
          startLeft: leftStart,
          scale: scaleValue,
          scaleWidth: width,
        });
        onCursorDragStart && onCursorDragStart(time);
      }}
      onDragEnd={({ left }) => {
        // Calculate time the same way as click event: use absolute position directly
        const time = parserPixelToTime(left, {
          startLeft: leftStart,
          scale: scaleValue,
          scaleWidth: width,
        });
        setCursor({ time });
        onCursorDragEnd && onCursorDragEnd(time);
      }}
      onDrag={({ left }) => {
        // Calculate time the same way as click event: use absolute position directly
        // The click event uses e.clientX - rect.x which gives absolute position within timeline
        // left is absolute position (same coordinate system as click event)
        const time = parserPixelToTime(left, {
          startLeft: leftStart,
          scale: scaleValue,
          scaleWidth: width,
        });
        setCursor({ time });
        onCursorDrag && onCursorDrag(time);
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
