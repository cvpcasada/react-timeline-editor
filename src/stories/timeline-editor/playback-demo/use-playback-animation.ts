import { useEffect, useEffectEvent, useRef } from "react";
import type { TimelineState } from "@/index";

interface UsePlaybackAnimationArgs {
  timelineStateRef: React.RefObject<TimelineState | null>;
  playbackSpeed?: number;
  isPlaying: boolean;
}

/**
 * Custom hook for managing playback animation with stable cursor positioning
 * Separates cursor updates (high-frequency, full frame rate) from scroll updates (capped at ~60fps)
 * to ensure smooth cursor movement even during active scrolling
 */
export function usePlaybackAnimation({
  timelineStateRef,
  playbackSpeed = 1,
  isPlaying,
}: UsePlaybackAnimationArgs) {
  const animationFrameRef = useRef<number | null>(null);
  const scrollTimerRef = useRef<number | null>(null);

  // Use wall-clock time for stable cursor positioning across frame rate variations
  const playbackStartTimeRef = useRef<number>(0);
  const playbackStartTimelineTimeRef = useRef<number>(0);

  // Track last scroll position to avoid redundant scrolls
  const lastScrollPositionRef = useRef<number>(0);

  // Cache props in refs to avoid closure issues
  const latestProps = useEffectEvent(() => ({
    playbackSpeed,
  }));

  useEffect(() => {
    if (!isPlaying) {
      // Cleanup on pause
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (scrollTimerRef.current !== null) {
        clearInterval(scrollTimerRef.current);
        scrollTimerRef.current = null;
      }
      return;
    }

    const propsRef = latestProps();

    // Initialize playback timing based on wall-clock time
    // This ensures stable cursor positioning regardless of frame time variations
    playbackStartTimeRef.current = performance.now();
    playbackStartTimelineTimeRef.current = timelineStateRef.current?.time ?? 0;
    lastScrollPositionRef.current = 0;

    /**
     * Separate animation loop for cursor position only
     * This ensures smooth, jitter-free cursor movement at frame rate
     */
    const animateCursor = (currentTime: number) => {
      const editorState = timelineStateRef.current;
      if (!editorState) return;

      // Calculate expected time based on elapsed wall-clock time since playback started
      // This approach is immune to frame time variations and provides stable cursor positioning
      const elapsedSeconds =
        (currentTime - playbackStartTimeRef.current) / 1000;
      const newTime =
        playbackStartTimelineTimeRef.current +
        elapsedSeconds * propsRef.playbackSpeed;

      editorState.time = Math.max(0, newTime); // Ensure time doesn't go negative

      animationFrameRef.current = requestAnimationFrame(animateCursor);
    };

    /**
     * Separate scroll update loop running at ~60fps
     * Decoupled from cursor updates to prevent scroll operations from affecting cursor rendering
     */
    const updateScroll = () => {
      const editorState = timelineStateRef.current;
      if (!editorState) return;

      const scrollElement = editorState.target;
      if (!scrollElement) return;

      const cursorPixelPosition = editorState.getTimePixelPosition();

      const viewportWidth = scrollElement.clientWidth;
      const currentScrollLeft = scrollElement.scrollLeft;
      const visibleLeft = currentScrollLeft;
      const visibleRight = currentScrollLeft + viewportWidth;

      const paddingPixels = 20;

      // Calculate how far out of bounds the cursor is
      const distanceFromLeftBound =
        visibleLeft + paddingPixels - cursorPixelPosition;
      const distanceFromRightBound =
        cursorPixelPosition - (visibleRight - paddingPixels);

      // Only scroll if cursor is significantly out of bounds (beyond threshold)
      let shouldScroll = false;
      let targetScrollLeft = currentScrollLeft;

      if (distanceFromLeftBound > 0) {
        // Cursor is too far left, scroll to show it with padding
        shouldScroll = true;
        targetScrollLeft = Math.max(0, cursorPixelPosition - paddingPixels);
      } else if (distanceFromRightBound > 0) {
        // Cursor is too far right, scroll to show it with padding
        shouldScroll = true;
        targetScrollLeft = cursorPixelPosition - viewportWidth + paddingPixels;
      }

      // Only perform scroll if position has actually changed (avoid redundant scrolls)
      if (
        shouldScroll &&
        Math.abs(targetScrollLeft - lastScrollPositionRef.current) > 1
      ) {
        lastScrollPositionRef.current = targetScrollLeft;
        scrollElement.scrollTo({
          left: targetScrollLeft,
          behavior: "auto",
        });
      }
      scrollTimerRef.current = requestAnimationFrame(updateScroll);
    };

    animationFrameRef.current = requestAnimationFrame(animateCursor);
    scrollTimerRef.current = requestAnimationFrame(updateScroll);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (scrollTimerRef.current !== null) {
        cancelAnimationFrame(scrollTimerRef.current);
        scrollTimerRef.current = null;
      }
    };
  }, [timelineStateRef, isPlaying]);
}
