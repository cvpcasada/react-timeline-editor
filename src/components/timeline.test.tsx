// @vitest-environment happy-dom

import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";
import { type CursorProps } from "./cursor/cursor";
import { type TimelineCursorPreviewProps } from "./cursor/timeline-cursor-preview";
import { type EditAreaProps } from "./edit_area/edit-area";
import { type TimeArea } from "./time_area/time-area";
import { Timeline } from "./timeline";
import { type TimelineState } from "@/interface/timeline";

type TimeAreaProps = React.ComponentProps<typeof TimeArea>;

const childMocks = vi.hoisted(() => ({
  timeAreaProps: null as TimeAreaProps | null,
  editAreaProps: null as EditAreaProps | null,
  cursorProps: null as CursorProps | null,
  timelineCursorPreviewProps: null as TimelineCursorPreviewProps | null,
}));

vi.mock("../utils/measured", () => ({
  useMeasure: () => ({ width: 500, height: 120 }),
}));

vi.mock("radix-ui", async () => {
  const ReactModule = await import("react");
  return {
    ScrollArea: {
      Root: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) =>
        ReactModule.createElement("div", props, children),
      Viewport: ({
        children,
        ref,
        ...props
      }: React.HTMLAttributes<HTMLDivElement> & {
        ref?: React.Ref<HTMLDivElement>;
      }) => ReactModule.createElement("div", { ...props, ref }, children),
      Corner: () => ReactModule.createElement("div", { "data-corner": true }),
    },
  };
});

vi.mock("./scroll-area", async () => {
  const ReactModule = await import("react");
  return {
    ScrollBar: ({ orientation }: { orientation: string }) =>
      ReactModule.createElement("div", { "data-scrollbar": orientation }),
  };
});

vi.mock("./time_area/time-area", async () => {
  const ReactModule = await import("react");
  return {
    TimeArea: (props: TimeAreaProps) => {
      childMocks.timeAreaProps = props;
      return ReactModule.createElement("div", { "data-testid": "time-area" });
    },
  };
});

vi.mock("./edit_area/edit-area", async () => {
  const ReactModule = await import("react");
  return {
    EditArea: (props: EditAreaProps) => {
      childMocks.editAreaProps = props;
      return ReactModule.createElement("div", { "data-testid": "edit-area" });
    },
  };
});

vi.mock("./cursor/cursor", async () => {
  const ReactModule = await import("react");
  return {
    Cursor: (props: CursorProps) => {
      childMocks.cursorProps = props;
      return ReactModule.createElement("div", { "data-testid": "cursor" });
    },
  };
});

vi.mock("./cursor/timeline-cursor-preview", async () => {
  const ReactModule = await import("react");
  return {
    TimelineCursorPreview: (props: TimelineCursorPreviewProps) => {
      childMocks.timelineCursorPreviewProps = props;
      return ReactModule.createElement("div", {
        "data-testid": "timeline-cursor-preview",
      });
    },
  };
});

describe("Timeline", () => {
  let root: Root | null = null;
  let host: HTMLDivElement | null = null;

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    childMocks.timeAreaProps = null;
    childMocks.editAreaProps = null;
    childMocks.cursorProps = null;
    childMocks.timelineCursorPreviewProps = null;
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    host?.remove();
    root = null;
    host = null;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function renderTimeline(
    props: Partial<React.ComponentProps<typeof Timeline>> = {}
  ) {
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    const ref = React.createRef<TimelineState | null>();
    const onChange = vi.fn();

    act(() => {
      root?.render(
        <Timeline
          ref={ref}
          editorData={[
            {
              id: "default",
              collapsed: { height: 12, expandedByDefault: true },
              actions: [{ id: "clip", start: 1, end: 2, effectId: "video" }],
            },
            {
              id: "collapsed",
              collapsed: { height: 10 },
              actions: [{ id: "peer", start: 3, end: 4, effectId: "video" }],
            },
          ]}
          effects={{ video: { id: "video" } }}
          scale={1}
          scaleWidth={100}
          startLeft={20}
          rowHeight={40}
          collapsedRowHeight={10}
          onChange={onChange}
          {...props}
        />
      );
    });

    if (
      !ref.current ||
      !childMocks.editAreaProps ||
      !childMocks.timeAreaProps
    ) {
      throw new Error("Timeline did not render expected child components");
    }

    return {
      ref,
      onChange,
      viewport: ref.current.target,
    };
  }

  it("derives scale count, row layouts, and snap positions for child surfaces", () => {
    renderTimeline();

    expect(childMocks.timeAreaProps?.scaleCount).toBe(5);
    expect(childMocks.editAreaProps?.scaleCount).toBe(5);
    expect(
      childMocks.editAreaProps?.rowLayouts.map((layout) => layout.height)
    ).toEqual([40, 10]);
    expect(childMocks.editAreaProps?.rowLayoutsTotalHeight).toBe(50);
    expect(childMocks.editAreaProps?.snapPositions).toEqual([
      { value: 120, actionId: "clip" },
      { value: 220, actionId: "clip" },
      { value: 320, actionId: "peer" },
      { value: 420, actionId: "peer" },
    ]);
    expect(childMocks.cursorProps?.height).toBe(120);
  });

  it("wires edit-area data changes to onChange", () => {
    const { onChange } = renderTimeline();
    const nextData = [{ id: "next", actions: [] }];

    act(() => {
      childMocks.editAreaProps?.setEditorData(nextData);
    });

    expect(onChange).toHaveBeenCalledWith(nextData);
  });

  it("passes valid action preview props through to the edit area", () => {
    const getActionPreviewRender = vi.fn();

    renderTimeline({
      actionPreview: {
        rowId: "default",
        action: { id: "preview", start: 2, end: 3, effectId: "video" },
      },
      getActionPreviewRender,
    });

    expect(childMocks.editAreaProps?.actionPreview).toEqual({
      rowId: "default",
      action: { id: "preview", start: 2, end: 3, effectId: "video" },
    });
    expect(childMocks.editAreaProps?.getActionPreviewRender).toBe(
      getActionPreviewRender
    );
    expect(console.warn).not.toHaveBeenCalledWith(
      expect.stringContaining("actionPreview rowId")
    );
  });

  it("warns once per missing action preview row id", () => {
    renderTimeline({
      actionPreview: {
        rowId: "missing",
        action: { id: "preview", start: 2, end: 3, effectId: "video" },
      },
    });

    expect(console.warn).toHaveBeenCalledWith(
      'Warning: actionPreview rowId "missing" does not match any timeline row.'
    );

    act(() => {
      root?.render(
        <Timeline
          editorData={[{ id: "default", actions: [] }]}
          effects={{ video: { id: "video" } }}
          actionPreview={{
            rowId: "missing",
            action: { id: "preview", start: 2, end: 3, effectId: "video" },
          }}
        />
      );
    });

    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it("exposes imperative time and scroll APIs", () => {
    const { ref, viewport } = renderTimeline();
    Object.defineProperty(viewport, "clientWidth", { value: 300 });
    Object.defineProperty(viewport, "scrollWidth", { value: 1000 });
    const scrollTo = vi.fn();
    viewport.scrollTo = scrollTo;

    act(() => {
      ref.current?.setTime(2);
    });

    expect(ref.current?.getTime()).toBe(2);
    expect(ref.current?.getTimePixelPosition()).toBe(220);

    act(() => {
      ref.current?.setScrollLeft(25);
      ref.current?.setScrollTop(15);
    });

    expect(ref.current?.scrollLeft).toBe(25);
    expect(ref.current?.scrollTop).toBe(15);

    act(() => {
      ref.current?.scrollToTime(4, { block: "start", offset: 10 });
    });

    expect(scrollTo).toHaveBeenCalledWith({
      left: 410,
      behavior: "instant",
    });
  });

  it("omits the cursor surface when hideCursor is enabled", () => {
    renderTimeline({ hideCursor: true });

    expect(childMocks.cursorProps).toBeNull();
  });

  it("shows the timeline cursor preview from time-area pointer movement when opted in", () => {
    renderTimeline({ showTimelineCursorPreview: true });

    act(() => {
      childMocks.timeAreaProps?.onTimelineCursorPreviewPointerMove?.({
        surface: "time-area",
        time: 2,
      });
    });

    expect(childMocks.timelineCursorPreviewProps?.preview).toEqual({
      surface: "time-area",
      time: 2,
    });
    expect(childMocks.timelineCursorPreviewProps?.height).toBe(120);
  });

  it("enables the timeline cursor preview when a custom head renderer is provided", () => {
    const getTimelineCursorPreviewHeadRender = vi.fn();
    renderTimeline({ getTimelineCursorPreviewHeadRender });

    act(() => {
      childMocks.editAreaProps?.onTimelineCursorPreviewPointerMove?.({
        surface: "edit-row",
        row: { id: "default", actions: [] },
        time: 3,
      });
    });

    expect(
      childMocks.timelineCursorPreviewProps?.getTimelineCursorPreviewHeadRender
    ).toBe(getTimelineCursorPreviewHeadRender);
    expect(childMocks.timelineCursorPreviewProps?.preview).toEqual({
      surface: "edit-row",
      row: { id: "default", actions: [] },
      time: 3,
    });
  });

  it("lets explicit false disable the timeline cursor preview", () => {
    renderTimeline({
      showTimelineCursorPreview: false,
      getTimelineCursorPreviewHeadRender: vi.fn(),
    });

    act(() => {
      childMocks.timeAreaProps?.onTimelineCursorPreviewPointerMove?.({
        surface: "time-area",
        time: 2,
      });
    });

    expect(childMocks.timelineCursorPreviewProps).toBeNull();
  });
});
