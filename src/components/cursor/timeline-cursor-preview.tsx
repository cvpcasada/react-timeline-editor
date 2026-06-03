import React, { type FC } from "react";
import { prefix } from "@/utils/deal-class-prefix";
import { parserTimeToPixel } from "@/utils/deal-data";
import {
  type TimelineCursorPreviewRenderParams,
  type TimelineRow,
} from "@/interface/timeline";

const HIDDEN_DISTANCE = 2;
const VISIBLE_DISTANCE = 16;
const MAX_OPACITY = 1;

export type TimelineCursorPreviewState =
  | {
      surface: "time-area";
      time: number;
    }
  | {
      surface: "edit-row";
      time: number;
      row: TimelineRow;
    };

export interface TimelineCursorPreviewProps {
  cursorTime: number;
  height: number;
  preview: TimelineCursorPreviewState;
  startLeft?: number;
  scaleWidth?: number;
  scale?: number;
  getTimelineCursorPreviewHeadRender?: (
    params: TimelineCursorPreviewRenderParams
  ) => React.ReactNode;
}

export const TimelineCursorPreview: FC<TimelineCursorPreviewProps> = ({
  cursorTime,
  height,
  preview,
  startLeft,
  scaleWidth,
  scale,
  getTimelineCursorPreviewHeadRender,
}) => {
  const transformOptions = {
    startLeft: startLeft ?? 20,
    scaleWidth: scaleWidth ?? 160,
    scale: scale ?? 1,
  };
  const previewLeft = parserTimeToPixel(preview.time, transformOptions);
  const cursorLeft = parserTimeToPixel(cursorTime, transformOptions);
  const distance = Math.abs(previewLeft - cursorLeft);
  const opacity =
    distance <= HIDDEN_DISTANCE
      ? 0
      : Math.min(
          MAX_OPACITY,
          ((distance - HIDDEN_DISTANCE) /
            (VISIBLE_DISTANCE - HIDDEN_DISTANCE)) *
            MAX_OPACITY
        );

  return (
    <div
      className={prefix("cursor-preview")}
      style={{
        height,
        opacity,
        transform: `translateX(${previewLeft}px) scaleX(0.5)`,
      }}
      aria-hidden="true"
    >
      {getTimelineCursorPreviewHeadRender ? (
        <div className={prefix("cursor-preview-head")}>
          {getTimelineCursorPreviewHeadRender(preview)}
        </div>
      ) : (
        <>
          <svg
            className={prefix("cursor-top")}
            width="8"
            height="12"
            viewBox="0 0 8 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M0 1C0 0.447715 0.447715 0 1 0H7C7.55228 0 8 0.447715 8 1V9.38197C8 9.76074 7.786 10.107 7.44721 10.2764L4.44721 11.7764C4.16569 11.9172 3.83431 11.9172 3.55279 11.7764L0.552786 10.2764C0.214002 10.107 0 9.76074 0 9.38197V1Z"
              fill="currentColor"
            />
          </svg>
        </>
      )}
      <div className={prefix("cursor-area")} />
    </div>
  );
};
