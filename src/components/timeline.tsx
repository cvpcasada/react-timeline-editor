import React, { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { MIN_SCALE_COUNT, PREFIX, START_CURSOR_TIME } from '@/interface/const';
import { type TimelineEditor, type TimelineRow, type TimelineState } from '@/interface/timeline';
import { checkProps } from '@/utils/check_props';
import { getScaleCountByRows, parserPixelToTime, parserTimeToPixel } from '@/utils/deal_data';
import { Cursor } from './cursor/cursor';
import { EditArea } from './edit_area/edit_area';
import './timeline.less';
import { TimeArea } from './time_area/time_area';
import ScrollSync, { type ScrollSyncHandle } from './scroll_sync';

export const Timeline = React.forwardRef<TimelineState, TimelineEditor>((props, ref) => {
  const checkedProps = checkProps(props);
  const { style } = props;
  let {
    editorData: data,
    scrollTop,
    autoScroll,
    hideCursor,
    disableDrag,
    scale = 1,
    scaleWidth = 160,
    startLeft = 20,
    minScaleCount = 20,
    maxScaleCount = Infinity,
    onChange,
    onScroll: onScrollVertical,
  } = checkedProps;

  const domRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const scrollSync = useRef<ScrollSyncHandle>(null);

  // Editor data
  const [editorData, setEditorData] = useState(data);
  // Scale count
  const [scaleCount, setScaleCount] = useState(MIN_SCALE_COUNT);
  // Cursor time
  const [cursorTime, setCursorTime] = useState(START_CURSOR_TIME);

  // Current timeline width
  const [width, setWidth] = useState(Number.MAX_SAFE_INTEGER);

  /** Dynamically set scale count */
  const handleSetScaleCount = useCallback(
    (value: number) => {
      const data = Math.min(maxScaleCount, Math.max(minScaleCount, value));
      setScaleCount(data);
    },
    [maxScaleCount, minScaleCount],
  );

  /** Listen to data changes */
  useLayoutEffect(() => {
    handleSetScaleCount(getScaleCountByRows(data, { scale }));
    setEditorData(data);
  }, [data, minScaleCount, maxScaleCount, scale, handleSetScaleCount]);

  // deprecated
  useEffect(() => {
    if (scrollTop !== undefined) {
      scrollSync.current?.setScrollState((prev) => ({ ...prev, scrollTop: scrollTop }));
    }
  }, [scrollTop]);

  /** Handle editor data changes */
  const handleEditorDataChange = (editorData: TimelineRow[]): void => {
    onChange?.(editorData);
  };

  /** Handle cursor */
  const handleSetCursor = (param: { left?: number; time?: number }): boolean => {
    let { left, time } = param;
    if (typeof left === 'undefined' && typeof time === 'undefined') return true;

    if (typeof time === 'undefined') {
      left = parserTimeToPixel(time ?? 0, { startLeft, scale, scaleWidth });
      time = parserPixelToTime(left, { startLeft, scale, scaleWidth });
    }

    let result = true;

    result && setCursorTime(time);
    return result;
  };

  /** Set scrollLeft */
  const handleDeltaScrollLeft = (delta: number): void => {
    // Disable auto-scroll when exceeding maximum distance
    if (!scrollSync.current?.state) return;
    const data = scrollSync.current.state.scrollLeft + delta;
    if (data > scaleCount * (scaleWidth - 1) + startLeft - width) return;
    scrollSync.current && scrollSync.current.setScrollState((prev) => ({ ...prev, scrollLeft: Math.max(prev.scrollLeft + delta, 0) }));
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
      scrollSync.current && scrollSync.current.setScrollState((prev) => ({ ...prev, scrollLeft: Math.max(val, 0) }));
    },
    setScrollTop: (val) => {
      scrollSync.current && scrollSync.current.setScrollState((prev) => ({ ...prev, scrollTop: Math.max(val, 0) }));
    },
  }));

  // Listen to timeline area width changes
  useEffect(() => {
    if (areaRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        if (!areaRef.current) return;
        setWidth(areaRef.current.getBoundingClientRect().width);
      });
      resizeObserver.observe(areaRef.current!);
      return () => {
        resizeObserver && resizeObserver.disconnect();
      };
    }
  }, []);

  return (
    <div ref={domRef} style={style} className={`${PREFIX} ${disableDrag ? PREFIX + '-disable' : ''}`}>
      <ScrollSync ref={scrollSync}>
        {({ scrollLeft, scrollTop, onScroll }) => (
          <>
            <TimeArea
              {...checkedProps}
              timelineWidth={width}
              disableDrag={disableDrag}
              setCursor={handleSetCursor}
              cursorTime={cursorTime}
              editorData={editorData}
              scaleCount={scaleCount}
              setScaleCount={handleSetScaleCount}
              onScroll={onScroll}
              scrollLeft={scrollLeft}
            />
            <EditArea
              {...checkedProps}
              timelineWidth={width}
              ref={(ref) => {
                if (ref?.domRef.current) {
                  areaRef.current = ref.domRef.current;
                }
              }}
              disableDrag={disableDrag}
              editorData={editorData}
              cursorTime={cursorTime}
              scaleCount={scaleCount}
              setScaleCount={handleSetScaleCount}
              scrollTop={scrollTop}
              scrollLeft={scrollLeft}
              setEditorData={handleEditorDataChange}
              deltaScrollLeft={autoScroll ? handleDeltaScrollLeft : undefined}
              onScroll={(params) => {
                onScroll(params);
                onScrollVertical?.(params);
              }}
            />
            {!hideCursor && (
              <Cursor
                {...checkedProps}
                timelineWidth={width}
                scrollLeft={scrollLeft}
                scaleCount={scaleCount}
                setScaleCount={handleSetScaleCount}
                setCursor={handleSetCursor}
                cursorTime={cursorTime}
                editorData={editorData}
                areaRef={areaRef}
                scrollSync={scrollSync}
                deltaScrollLeft={autoScroll ? handleDeltaScrollLeft : undefined}
              />
            )}
          </>
        )}
      </ScrollSync>
    </div>
  );
});
