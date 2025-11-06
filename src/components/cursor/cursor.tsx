import "./cursor.less";

import React, { type FC, useEffect, useRef } from "react";
import { type CommonProp } from "@/interface/common_prop";
import { prefix } from "@/utils/deal_class_prefix";
import { parserPixelToTime, parserTimeToPixel } from "@/utils/deal_data";
import { RowDnd } from "@/components/row_rnd/row_rnd";
import { type RowRndApi } from "@/components/row_rnd/row_rnd_interface";
import { type ScrollSyncHandle } from "@/components/scroll_sync";

/** Animation timeline component parameters */
export type CursorProps = CommonProp & {
  /** Scroll distance from left */
  scrollLeft: number;
  /** Set cursor position */
  setCursor: (param: { left?: number; time?: number }) => boolean;
  /** Timeline area DOM ref */
  areaRef: React.RefObject<HTMLDivElement | null>;
  /** Set scroll left */
  deltaScrollLeft?: (delta: number) => void;
  /** Scroll sync ref (TODO: This data is used to temporarily fix scrollLeft synchronization issue when dragging) */
  scrollSync: React.RefObject<ScrollSyncHandle | null>;
};

export const Cursor: FC<CursorProps> = ({
  disableDrag,
  cursorTime,
  setCursor,
  startLeft,
  timelineWidth,
  scaleWidth,
  scale,
  scrollLeft,
  scrollSync,
  areaRef,
  maxScaleCount,
  deltaScrollLeft,
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
        }) - scrollLeft
      );
    }
  }, [cursorTime, startLeft, scaleWidth, scale, scrollLeft]);

  const leftStart = startLeft ?? 20;
  const width = scaleWidth ?? 160;
  const scaleValue = scale ?? 1;
  const maxCount = maxScaleCount ?? Infinity;

  return (
    <RowDnd
      start={leftStart}
      ref={rowRnd}
      parentRef={areaRef}
      bounds={{
        left: 0,
        right: Math.min(
          timelineWidth,
          maxCount * width + leftStart - scrollLeft
        ),
      }}
      deltaScrollLeft={deltaScrollLeft}
      enableDragging={!disableDrag}
      enableResizing={false}
      onDragStart={() => {
        onCursorDragStart && onCursorDragStart(cursorTime);
        draggingLeft.current =
          parserTimeToPixel(cursorTime, {
            startLeft: leftStart,
            scaleWidth: width,
            scale: scaleValue,
          }) - scrollLeft;
        rowRnd.current?.updateLeft(draggingLeft.current);
      }}
      onDragEnd={() => {
        if (typeof draggingLeft.current !== "undefined") {
          const time = parserPixelToTime(draggingLeft.current + scrollLeft, {
            startLeft: leftStart,
            scale: scaleValue,
            scaleWidth: width,
          });
          setCursor({ time });
          onCursorDragEnd && onCursorDragEnd(time);
        }
        draggingLeft.current = undefined;
      }}
      onDrag={({ left }, scroll = 0) => {
        if (!scrollSync.current?.state) return false;
        const currentScrollLeft = scrollSync.current.state.scrollLeft;

        if (!scroll || currentScrollLeft === 0) {
          // When dragging, if current left < left min, set value to left min
          if (left < leftStart - currentScrollLeft)
            draggingLeft.current = leftStart - currentScrollLeft;
          else draggingLeft.current = left;
        } else {
          // When auto-scrolling, if current left < left min, set value to left min
          if (
            typeof draggingLeft.current !== "undefined" &&
            draggingLeft.current < leftStart - currentScrollLeft - scroll
          ) {
            draggingLeft.current = leftStart - currentScrollLeft - scroll;
          }
        }
        if (typeof draggingLeft.current !== "undefined") {
          rowRnd.current?.updateLeft(draggingLeft.current);
          const time = parserPixelToTime(
            draggingLeft.current + currentScrollLeft,
            { startLeft: leftStart, scale: scaleValue, scaleWidth: width }
          );
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
            fill="#5297FF"
          />
        </svg>
        <div className={prefix("cursor-area")} />
      </div>
    </RowDnd>
  );
};
