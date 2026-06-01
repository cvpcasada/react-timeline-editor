// @vitest-environment happy-dom

import React, { useImperativeHandle } from "react";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";
import { useAutoScroll } from "./use-auto-scroll";

type AutoScrollApi = ReturnType<typeof useAutoScroll>;

function AutoScrollHarness({
  apiRef,
  targetRef,
}: {
  apiRef: React.RefObject<AutoScrollApi | null>;
  targetRef: React.RefObject<HTMLDivElement>;
}) {
  const api = useAutoScroll(targetRef, 2, 10);
  useImperativeHandle(apiRef, () => api);
  return null;
}

describe("useAutoScroll", () => {
  let root: Root | null = null;
  let host: HTMLDivElement | null = null;
  let frames: FrameRequestCallback[] = [];

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    frames = [];
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback: FrameRequestCallback) => {
        frames.push(callback);
        return frames.length;
      })
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    host?.remove();
    root = null;
    host = null;
    vi.unstubAllGlobals();
  });

  function renderHarness() {
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);

    const target = document.createElement("div");
    target.getBoundingClientRect = () =>
      ({
        left: 10,
        right: 110,
        width: 100,
        height: 20,
        top: 0,
        bottom: 20,
        x: 10,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    const targetRef: React.RefObject<HTMLDivElement> = { current: target };
    const apiRef = React.createRef<AutoScrollApi | null>();

    act(() => {
      root?.render(<AutoScrollHarness apiRef={apiRef} targetRef={targetRef} />);
    });

    if (!apiRef.current) {
      throw new Error("auto scroll harness did not expose its API");
    }

    return apiRef.current;
  }

  it("keeps edge scrolling moving when the pointer is barely outside bounds", () => {
    const api = renderHarness();
    const deltaScroll = vi.fn();

    api.initAutoScroll();
    const shouldContinue = api.dealDragAutoScroll(
      {
        target: document.createElement("div"),
        dx: 0,
        dy: 0,
        clientX: 111,
        clientY: 0,
      },
      deltaScroll
    );

    expect(shouldContinue).toBe(false);
    expect(frames).toHaveLength(1);

    frames[0]?.(0);

    expect(deltaScroll).toHaveBeenCalledWith(2);
  });

  it("allows normal drag handling while the pointer stays inside bounds", () => {
    const api = renderHarness();
    const deltaScroll = vi.fn();

    api.initAutoScroll();
    const shouldContinue = api.dealDragAutoScroll(
      {
        target: document.createElement("div"),
        dx: 0,
        dy: 0,
        clientX: 60,
        clientY: 0,
      },
      deltaScroll
    );

    expect(shouldContinue).toBe(true);
    expect(deltaScroll).not.toHaveBeenCalled();
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });
});
