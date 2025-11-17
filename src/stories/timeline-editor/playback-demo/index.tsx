/* eslint-disable @typescript-eslint/no-explicit-any */
import { Timeline, type TimelineState } from "@/index";

import { useEffect, useRef, useState, type RefObject } from "react";
import "./index.less";
import { mockData, mockEffect } from "./mock";
import { parserTimeToPixel } from "@/utils/deal-data";
import { useMeasure } from "@/utils/measured";
import { MotionProp } from "./motion-prop";
import type { MotionValue } from "motion";
import { useMotionValueEvent } from "motion/react";

const defaultEditorData = structuredClone(mockData);

const PlaybackDemo = (args: {
  visibleTimeSecs: number;
  playbackSpeed?: number;
}) => {
  const [data, setData] = useState(defaultEditorData);

  const ref = useRef<TimelineState>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useMeasure({ elementRef: containerRef });

  const startLeft = 20;

  return (
    <div className="timeline-editor-example-playback-demo">
      <MotionProp
        value={args.visibleTimeSecs}
        maxValue={600}
        render={(i, motionVal) => {
          const value = calculateScale(i, (width || 800) - startLeft * 2);

          return (
            <div ref={containerRef}>
              <SetTimelineAnimatingClassState
                timelineStateRef={ref}
                motionValue={motionVal}
              />
              <PlaybackControls
                timelineStateRef={ref}
                scale={value.scale}
                scaleWidth={value.scaleWidth}
                startLeft={startLeft}
                playbackSpeed={args.playbackSpeed}
              />
              <Timeline
                ref={ref}
                {...args}
                scale={value.scale}
                // minScaleCount={3999}
                // {...(isAnimating ? { minScaleCount: 3999 } : {})}
                scaleWidth={value.scaleWidth}
                startLeft={startLeft}
                onChange={setData}
                editorData={data}
                effects={mockEffect}
                hideCursor={false}
                getScaleRender={(timeInSecs) => {
                  const hours = Math.floor(timeInSecs / 3600);
                  const minutes = Math.floor((timeInSecs % 3600) / 60);
                  const seconds = Math.floor(timeInSecs % 60);

                  if (hours > 0) {
                    return (
                      <div>
                        {hours.toString().padStart(2, "0")}:
                        {minutes.toString().padStart(2, "0")}:
                        {seconds.toString().padStart(2, "0")}
                      </div>
                    );
                  }
                  return (
                    <div>
                      {minutes.toString().padStart(2, "0")}:
                      {seconds.toString().padStart(2, "0")}
                    </div>
                  );
                }}
                autoScroll
              />
            </div>
          );
        }}
      />
    </div>
  );
};

export { PlaybackDemo };

/**
 * allowed scale values: {1, 2, 3, 4, 5, 10, 20, 30, ...}
 * i.e., 1..5, then multiples of 10.
 */
const SCALES = (() => {
  const scales: number[] = [];
  for (let s = 1; s <= 5; s += 1) scales.push(s);
  for (let s = 10; s <= 50; s += 10) scales.push(s);
  for (let s = 60; s <= 3600; s += 60) scales.push(s);
  return scales;
})();

function binarySearch<T, Q>(
  haystack: T[],
  needle: Q,
  comparator: (a: T, b: Q, index?: number, haystack?: T[]) => any,
  hintIndex?: number,
  low?: number,
  high?: number
): number {
  let mid, cmp;

  if (low === undefined) low = 0;
  else {
    low = low | 0;
    if (low < 0 || low >= haystack.length)
      throw new RangeError("invalid lower bound");
  }

  if (high === undefined) high = haystack.length - 1;
  else {
    high = high | 0;
    if (high < low || high >= haystack.length)
      throw new RangeError("invalid upper bound");
  }

  // If a hint index is provided, adjust the search range to center around it
  if (hintIndex !== undefined) {
    hintIndex = hintIndex | 0;
    if (hintIndex >= 0 && hintIndex < haystack.length) {
      if (hintIndex < low) low = hintIndex;
      else if (hintIndex > high) high = hintIndex;
    }
  }

  while (low <= high) {
    mid = low + ((high - low) >>> 1);
    cmp = +comparator(haystack[mid]!, needle, mid, haystack);

    if (cmp < 0.0) low = mid + 1;
    else if (cmp > 0.0) high = mid - 1;
    else return mid;
  }

  return ~low;
}

function binarySearchIndex<T>(
  arr: T[],
  getter: (item: T) => number,
  searchEntry: number
) {
  return binarySearch(arr, searchEntry, (evt: T, t: number) => getter(evt) - t);
}

function binarySearchIndexLte<T>(
  arr: T[],
  getter: (item: T) => number,
  searchEntry: number
) {
  let index = binarySearchIndex(arr, getter, searchEntry);
  return index < 0 ? Math.abs(index) - 2 : index;
}

function calculateScale(
  timeInSecs: number,
  totalWidth: number
): { scale: number; scaleWidth: number } {
  const MIN_SCALE_WIDTH = 100;

  // Calculate the valid scale range based on scaleWidth constraints
  const minScale = (MIN_SCALE_WIDTH * timeInSecs) / totalWidth;
  const bestScaleIndex = binarySearchIndexLte(
    SCALES,
    (scale) => scale,
    minScale
  );
  const bestScale = bestScaleIndex >= 0 ? SCALES[bestScaleIndex]! : SCALES[0]!;

  const scaleWidth = (totalWidth * bestScale) / timeInSecs;
  return { scale: bestScale, scaleWidth: Math.ceil(scaleWidth * 1e4) / 1e4 };
}

function PlaybackControls(args: {
  timelineStateRef: React.RefObject<TimelineState | null>;
  scale: number;
  scaleWidth: number;
  startLeft: number;
  playbackSpeed?: number;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const propsRef = useRef<{
    scale: number;
    scaleWidth: number;
    startLeft: number;
    playbackSpeed: number;
  }>({
    scale: args.scale,
    scaleWidth: args.scaleWidth,
    startLeft: args.startLeft,
    playbackSpeed: args.playbackSpeed ?? 1,
  });

  useEffect(() => {
    propsRef.current = {
      scale: args.scale,
      scaleWidth: args.scaleWidth,
      startLeft: args.startLeft,
      playbackSpeed: args.playbackSpeed ?? 1,
    };
  }, [args.playbackSpeed, args.scale, args.scaleWidth, args.startLeft]);

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const animate = (currentTime: number) => {
      const editorState = args.timelineStateRef.current;
      if (!editorState) {
        setIsPlaying(false);
        return;
      }

      const deltaTime = (currentTime - lastTimeRef.current) / 1000; // Convert to seconds
      lastTimeRef.current = currentTime;

      // Advance time based on playback speed
      const currentTimeValue = editorState.time;
      const newTime =
        currentTimeValue + deltaTime * propsRef.current.playbackSpeed;

      editorState.time = Math.max(0, newTime); // Ensure time doesn't go negative

      // Use a more stable scroll approach: check bounds in next frame
      const scrollElement = editorState.target;
      if (!scrollElement) return;

      const cursorPixelPosition = parserTimeToPixel(newTime, {
        startLeft: propsRef.current.startLeft,
        scale: propsRef.current.scale,
        scaleWidth: propsRef.current.scaleWidth,
      });

      const viewportWidth = scrollElement.clientWidth;
      const currentScrollLeft = scrollElement.scrollLeft;
      const visibleLeft = currentScrollLeft;
      const visibleRight = currentScrollLeft + viewportWidth;

      const paddingPixels = 50;

      // Calculate how far out of bounds the cursor is
      const distanceFromLeftBound =
        visibleLeft + paddingPixels - cursorPixelPosition;
      const distanceFromRightBound =
        cursorPixelPosition - (visibleRight - paddingPixels);

      // Only scroll if cursor is significantly out of bounds (beyond threshold)
      if (distanceFromLeftBound > 0) {
        // Cursor is too far left, scroll to show it with padding
        const targetScrollLeft = Math.max(
          0,
          cursorPixelPosition - paddingPixels
        );
        scrollElement.scrollTo({
          left: targetScrollLeft,
          behavior: "auto",
        });
      } else if (distanceFromRightBound > 0) {
        // Cursor is too far right, scroll to show it with padding
        const targetScrollLeft =
          cursorPixelPosition - viewportWidth + paddingPixels;
        scrollElement.scrollTo({
          left: targetScrollLeft,
          behavior: "auto",
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [args.timelineStateRef, isPlaying]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleForward = () => {
    const editorState = args.timelineStateRef.current;
    if (!editorState) return;

    const currentTime = editorState.time;
    // eslint-disable-next-line react-hooks/immutability
    editorState.time = currentTime + 5;
  };

  const handleBackward = () => {
    const editorState = args.timelineStateRef.current;
    if (!editorState) return;

    const currentTime = editorState.time;
    // eslint-disable-next-line react-hooks/immutability
    editorState.time = Math.max(0, currentTime - 5);
  };

  return (
    <div className="playback-controls">
      <button onClick={handleBackward}>⏪ -5s</button>
      {isPlaying ? (
        <button onClick={handlePause}>⏸ Pause</button>
      ) : (
        <button onClick={handlePlay}>▶ Play</button>
      )}
      <button onClick={handleForward}>⏩ +5s</button>
    </div>
  );
}

function SetTimelineAnimatingClassState(props: {
  timelineStateRef: RefObject<TimelineState | null>;
  motionValue: MotionValue<number>;
}) {
  useMotionValueEvent(props.motionValue, "animationStart", () => {
    props.timelineStateRef.current?.target.classList.add("animating");
  });
  useMotionValueEvent(props.motionValue, "animationComplete", () => {
    props.timelineStateRef.current?.target.classList.remove("animating");
  });

  return null;
}
