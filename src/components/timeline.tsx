import "./index.css";

import React, {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { MIN_SCALE_COUNT, PREFIX, START_CURSOR_TIME } from "@/interface/const";
import {
  type TimelineEditor,
  type TimelineRow,
  type TimelineState,
} from "@/interface/timeline";
import { checkProps } from "@/utils/check-props";
import { getScaleCountByRows, parserPixelToTime } from "@/utils/deal-data";
import { EditArea } from "./edit_area/edit-area";
import { TimeArea } from "./time_area/time-area";
import { Measured, useMeasure } from "./measured";
import { Cursor } from "./cursor/cursor";

export const Timeline = React.forwardRef<TimelineState, TimelineEditor>(
  (props, ref) => {
    const checkedProps = checkProps(props);
    const { style } = props;
    let {
      editorData: data,
      hideCursor,
      disableDrag,
      scale = 1,
      scaleWidth = 160,
      startLeft = 20,
      minScaleCount = 20,
      maxScaleCount = Infinity,
      onChange,
      onScroll,
    } = checkedProps;

    const domRef = useRef<HTMLDivElement>(null);

    // Editor data
    const [editorData, setEditorData] = useState(data);
    // Scale count
    const [scaleCount, setScaleCount] = useState(MIN_SCALE_COUNT);
    // Cursor time
    const [cursorTime, setCursorTime] = useState(START_CURSOR_TIME);

    /** Dynamically set scale count */
    const handleSetScaleCount = useCallback(
      (value: number) => {
        const data = Math.min(maxScaleCount, Math.max(minScaleCount, value));
        setScaleCount(data);
      },
      [maxScaleCount, minScaleCount]
    );

    /** Listen to data changes */
    useLayoutEffect(() => {
      handleSetScaleCount(getScaleCountByRows(data, { scale }));
      setEditorData(data);
    }, [data, minScaleCount, maxScaleCount, scale, handleSetScaleCount]);

    /** Handle editor data changes */
    const handleEditorDataChange = (editorData: TimelineRow[]): void => {
      onChange?.(editorData);
    };

    /** Handle cursor */
    const handleSetCursor = (param: {
      left?: number;
      time?: number;
    }): boolean => {
      let { left, time } = param;

      if (typeof time !== "undefined") {
        setCursorTime(time);
        return true;
      }

      if (typeof left !== "undefined") {
        setCursorTime(
          parserPixelToTime(left, { startLeft, scale, scaleWidth })
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
        return cursorTime;
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
      <Measured
        ref={domRef}
        style={style}
        className={`${PREFIX} ${disableDrag ? PREFIX + "-disable" : ""}`}
        onScroll={(e) => {
          onScroll?.(e.currentTarget);
        }}
        render={({ width, height }) => (
          <>
            <TimeArea
              {...checkedProps}
              setCursor={handleSetCursor}
              scaleCount={scaleCount}
              scrollElementRef={domRef}
            />

            <EditArea
              {...checkedProps}
              scrollElementRef={domRef}
              timelineWidth={width}
              timelineHeight={height}
              disableDrag={disableDrag}
              editorData={editorData}
              cursorTime={cursorTime}
              scaleCount={scaleCount}
              setScaleCount={handleSetScaleCount}
              setEditorData={handleEditorDataChange}
            />

            {!hideCursor && (
              <Cursor
                {...checkedProps}
                timelineWidth={width}
                scaleCount={scaleCount}
                setScaleCount={handleSetScaleCount}
                setCursor={handleSetCursor}
                cursorTime={cursorTime}
                editorData={editorData}
                scrollElementRef={domRef}
              />
            )}
          </>
        )}
      />
    );
  }
);
