// @vitest-environment happy-dom

import React, { useImperativeHandle } from "react";
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
import { type CommonProp } from "@/interface/common-prop";
import {
  type RowRndApi,
  type RowRndProps,
} from "@/components/row_rnd/row-rnd-interface";
import { Cursor, type CursorProps } from "./cursor";

type CapturedRowDndProps = RowRndProps & {
  children?: React.ReactNode;
  ref?: React.RefObject<RowRndApi | null>;
};

const rowDndMock = vi.hoisted(() => ({
  props: null as CapturedRowDndProps | null,
  left: 0,
  width: 0,
}));

vi.mock("@/components/row_rnd/row-rnd", async () => {
  const ReactModule = await import("react");
  return {
    RowDnd: (props: CapturedRowDndProps) => {
      rowDndMock.props = props;
      useImperativeHandle(props.ref, () => ({
        updateLeft: (left) => {
          rowDndMock.left = left;
        },
        updateWidth: (width) => {
          rowDndMock.width = width;
        },
        getLeft: () => rowDndMock.left,
        getWidth: () => rowDndMock.width,
      }));
      return ReactModule.createElement(
        "div",
        { "data-testid": "row-dnd" },
        props.children
      );
    },
  };
});

describe("Cursor", () => {
  let root: Root | null = null;
  let host: HTMLDivElement | null = null;

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    rowDndMock.props = null;
    rowDndMock.left = 0;
    rowDndMock.width = 0;
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

  function renderCursor(props: Partial<CursorProps> = {}) {
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);

    const setCursor = vi.fn(() => true);
    const scrollElement = document.createElement("div");
    scrollElement.scrollLeft = 40;
    const scrollElementRef = { current: scrollElement };
    const commonProps: CommonProp = {
      editorData: [],
      effects: {},
      scale: 2,
      scaleWidth: 100,
      scaleSplitCount: 4,
      startLeft: 20,
      scaleCount: 3,
      cursorTime: 4,
      timelineWidth: 400,
      maxScaleCount: 5,
      setScaleCount: vi.fn(),
    };

    act(() => {
      root?.render(
        <Cursor
          {...commonProps}
          height={80}
          setCursor={setCursor}
          scrollElementRef={scrollElementRef}
          {...props}
        />
      );
    });

    if (!rowDndMock.props) {
      throw new Error("Cursor did not render RowDnd");
    }

    return {
      rowDnd: rowDndMock.props,
      setCursor,
    };
  }

  it("positions the cursor from cursorTime using the active scale settings", () => {
    renderCursor();

    expect(rowDndMock.left).toBe(220);
  });

  it("only forwards snap positions while cursor snapping is enabled", () => {
    const snapPositions = [{ value: 120, actionId: "clip" }];

    const disabled = renderCursor({ cursorSnap: false, snapPositions });
    expect(disabled.rowDnd.snapPositions).toEqual([]);

    const enabled = renderCursor({ cursorSnap: true, snapPositions });
    expect(enabled.rowDnd.snapPositions).toBe(snapPositions);
  });

  it("converts drag movement into cursor time callbacks", () => {
    const onCursorDragStart = vi.fn();
    const onCursorDrag = vi.fn();
    const onCursorDragEnd = vi.fn();
    const { rowDnd, setCursor } = renderCursor({
      onCursorDragStart,
      onCursorDrag,
      onCursorDragEnd,
    });

    rowDndMock.left = 320;

    act(() => {
      rowDnd.onDragStart?.();
      rowDnd.onDrag?.({ lastLeft: 320, left: 420, lastWidth: 0, width: 0 });
      rowDnd.onDragEnd?.({ left: 520, width: 0 });
    });

    expect(onCursorDragStart).toHaveBeenCalledWith(6);
    expect(onCursorDrag).toHaveBeenCalledWith(8);
    expect(onCursorDragEnd).toHaveBeenCalledWith(10);
    expect(setCursor).toHaveBeenCalledWith({ time: 8 });
    expect(setCursor).toHaveBeenCalledWith({ time: 10 });
  });

  it("bounds dragging by rendered timeline width before max scale count", () => {
    const { rowDnd } = renderCursor();

    expect(rowDnd.getBounds?.()).toEqual({ left: 0, right: 320 });
  });

  it("disables dragging when timeline dragging is disabled", () => {
    const { rowDnd } = renderCursor({ disableDrag: true });

    expect(rowDnd.enableDragging).toBe(false);
    expect(rowDnd.enableResizing).toBe(false);
  });
});
