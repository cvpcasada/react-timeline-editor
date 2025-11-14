import "./styles.css";

import React, { useImperativeHandle, useRef, useState } from "react";
import { PREFIX, START_CURSOR_TIME } from "@/interface/const";
import {
  type TimelineEditor,
  type TimelineRow,
  type TimelineState,
} from "@/interface/timeline";
import { withDefaults } from "@/utils/with-defaults";
import { getScaleCountByRows, parserPixelToTime } from "@/utils/deal-data";
import { EditArea } from "./edit_area/edit-area";
import { TimeArea } from "./time_area/time-area";
import { useMeasure } from "../utils/measured";
import { Cursor } from "./cursor/cursor";
import { ScrollArea } from "radix-ui";
import { ScrollBar } from "./scroll-area";

export function Timeline({
  ref,
  ...props
}: TimelineEditor & {
  ref?: React.RefObject<TimelineState>;
}) {
  const timelineProps = withDefaults(props);
  const domRef = useRef<HTMLDivElement>(null);

  // Scale count - derived from props by default, but can be overridden
  const derivedScaleCount = Math.min(
    timelineProps.maxScaleCount,
    Math.max(
      timelineProps.minScaleCount,
      getScaleCountByRows(timelineProps.editorData, {
        scale: timelineProps.scale,
      })
    )
  );

  const [estimatedScaleCount, setScaleCount] =
    useState<number>(derivedScaleCount);

  const scaleCount = Math.max(derivedScaleCount, estimatedScaleCount);

  // Cursor time
  const [cursorTime, setCursorTime] = useState(START_CURSOR_TIME);

  const cursorTimeRef = useRef(START_CURSOR_TIME);

  const { width, height } = useMeasure({ elementRef: domRef });

  /** Dynamically set scale count - overrides the derived value */
  const handleSetScaleCount = (value: number) => {
    setScaleCount(
      Math.min(
        timelineProps.maxScaleCount,
        Math.max(timelineProps.minScaleCount, value)
      )
    );
  };

  /** Handle editor data changes */
  const handleEditorDataChange = (editorData: TimelineRow[]): void => {
    timelineProps.onChange?.(editorData);
  };

  /** Handle cursor */
  const handleSetCursor = (param: {
    left?: number;
    time?: number;
  }): boolean => {
    let { left, time } = param;

    if (typeof time !== "undefined") {
      setCursorTime(time);
      cursorTimeRef.current = time;
      return true;
    }

    if (typeof left !== "undefined") {
      setCursorTime(
        (cursorTimeRef.current = parserPixelToTime(left, {
          startLeft: timelineProps.startLeft,
          scale: timelineProps.scale,
          scaleWidth: timelineProps.scaleWidth,
        }))
      );

      return true;
    }

    return false;
  };

  // Ref data
  useImperativeHandle(ref, () => ({
    get target() {
      return domRef.current!;
    },
    set time(time: number) {
      handleSetCursor({ time });
    },
    get time() {
      return cursorTimeRef.current;
    },
    setScrollLeft: (val) => {
      if (!domRef.current) return;
      domRef.current.scrollLeft = val;
    },
    setScrollTop: (val) => {
      if (!domRef.current) return;
      domRef.current.scrollTop = val;
    },
  }));

  return (
    <ScrollArea.Root
      style={timelineProps.style}
      className={`${PREFIX} ${
        timelineProps.disableDrag ? PREFIX + "-disable" : ""
      }`}
      data-slot="scroll-area"
    >
      <ScrollArea.Viewport
        data-slot="scroll-area-viewport"
        ref={domRef}
        onScroll={(e) => {
          timelineProps.onScroll?.(e.currentTarget);
        }}
      >
        <TimeArea
          {...timelineProps}
          setCursor={handleSetCursor}
          scaleCount={scaleCount}
          scrollElementRef={domRef}
        />

        <EditArea
          {...timelineProps}
          scrollElementRef={domRef}
          timelineWidth={width}
          timelineHeight={height}
          disableDrag={timelineProps.disableDrag}
          editorData={timelineProps.editorData}
          cursorTime={cursorTime}
          scaleCount={scaleCount}
          setScaleCount={handleSetScaleCount}
          setEditorData={handleEditorDataChange}
        />

        {!timelineProps.hideCursor && (
          <Cursor
            {...timelineProps}
            timelineWidth={width}
            height={height}
            scaleCount={scaleCount}
            setScaleCount={handleSetScaleCount}
            setCursor={handleSetCursor}
            cursorTime={cursorTime}
            editorData={timelineProps.editorData}
            scrollElementRef={domRef}
          />
        )}
      </ScrollArea.Viewport>
      <ScrollBar orientation="horizontal" />
      <ScrollBar orientation="vertical" />
      <ScrollArea.Corner />
    </ScrollArea.Root>
  );
}
