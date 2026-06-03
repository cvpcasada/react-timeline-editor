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
import { type TimelineAction, type TimelineRow } from "@/interface/action";
import { type CommonProp } from "@/interface/common-prop";
import { type RowRndProps } from "@/components/row_rnd/row-rnd-interface";
import { EditAction, type EditActionProps } from "./edit-action";

type CapturedRowDndProps = RowRndProps & { children?: React.ReactNode };

const rowDndMock = vi.hoisted(() => ({
  props: null as CapturedRowDndProps | null,
  parentClick: null as React.MouseEventHandler<HTMLDivElement> | null,
}));

vi.mock("@/components/row_rnd/row-rnd", async () => {
  const ReactModule = await import("react");
  return {
    RowDnd: (props: CapturedRowDndProps) => {
      rowDndMock.props = props;
      return ReactModule.createElement(
        "div",
        { "data-testid": "row-dnd", onClick: rowDndMock.parentClick },
        props.children
      );
    },
  };
});

describe("EditAction", () => {
  let root: Root | null = null;
  let host: HTMLDivElement | null = null;

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    rowDndMock.props = null;
    rowDndMock.parentClick = null;
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

  function renderEditAction(props: Partial<EditActionProps> = {}) {
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);

    const action: TimelineAction = {
      id: "clip",
      start: 1,
      end: 3,
      effectId: "video",
      minStart: 0.5,
      maxEnd: 5,
    };
    const row: TimelineRow = { id: "row", actions: [action] };
    const editorData: TimelineRow[] = [row];
    const setEditorData = vi.fn();
    const setScaleCount = vi.fn();
    const commonProps: CommonProp = {
      editorData,
      effects: { video: { id: "video" } },
      scale: 1,
      scaleWidth: 100,
      scaleSplitCount: 10,
      startLeft: 20,
      scaleCount: 4,
      maxScaleCount: 6,
      cursorTime: 0,
      timelineWidth: 600,
      setScaleCount,
    };

    act(() => {
      root?.render(
        <EditAction
          {...commonProps}
          row={row}
          rowRenderHeight={32}
          action={action}
          snapData={{ isMoving: false, movePositions: [], assistPositions: [] }}
          setEditorData={setEditorData}
          handleTime={() => 0}
          scrollContainerRef={React.createRef<HTMLDivElement | null>()}
          {...props}
        />
      );
    });

    if (!rowDndMock.props) {
      throw new Error("EditAction did not render RowDnd");
    }

    return {
      action,
      row,
      editorData,
      setEditorData,
      setScaleCount,
      rowDnd: rowDndMock.props,
    };
  }

  it("passes pixel bounds derived from minStart, maxEnd, and maxScaleCount", () => {
    const { rowDnd } = renderEditAction();

    expect(rowDnd.getBounds?.()).toEqual({ left: 70, right: 520 });
  });

  it("converts drag pixels to times and expands the scale count during preview", () => {
    const onActionMoving = vi.fn();
    const { action, row, rowDnd, setScaleCount } = renderEditAction({
      onActionMoving,
    });

    let result: boolean | void = undefined;
    act(() => {
      result = rowDnd.onDrag?.({
        lastLeft: 120,
        left: 360,
        lastWidth: 200,
        width: 180,
      });
    });

    expect(result).toBeUndefined();
    expect(onActionMoving).toHaveBeenCalledWith({
      action,
      row,
      start: 3.4,
      end: 5.2,
    });
    expect(setScaleCount).toHaveBeenCalledWith(8);
  });

  it("does not preview movement when onActionMoving vetoes the drag", () => {
    const { rowDnd, setScaleCount } = renderEditAction({
      onActionMoving: () => false,
    });

    let result: boolean | void = undefined;
    act(() => {
      result = rowDnd.onDrag?.({
        lastLeft: 120,
        left: 360,
        lastWidth: 200,
        width: 180,
      });
    });

    expect(result).toBe(false);
    expect(setScaleCount).not.toHaveBeenCalled();
  });

  it("does not bubble the post-drag click to row handlers", () => {
    const onRowClick = vi.fn();
    const onClickAction = vi.fn();
    rowDndMock.parentClick = onRowClick;
    const { rowDnd } = renderEditAction({
      onClickAction,
    });
    const actionElement = host?.querySelector<HTMLElement>(
      ".timeline-editor-action"
    );
    if (!actionElement) throw new Error("EditAction did not render action");

    act(() => {
      rowDnd.onDrag?.({
        lastLeft: 120,
        left: 140,
        lastWidth: 200,
        width: 200,
      });
    });
    act(() => {
      actionElement.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onClickAction).toHaveBeenCalledOnce();
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("commits drag-end times into editor data and publishes a new row array", () => {
    const onActionMoveEnd = vi.fn();
    const { action, row, editorData, rowDnd, setEditorData } = renderEditAction(
      {
        onActionMoveEnd,
      }
    );

    act(() => {
      rowDnd.onDragEnd?.({ left: 220, width: 150 });
    });

    expect(action.start).toBe(2);
    expect(action.end).toBe(3.5);
    expect(setEditorData).toHaveBeenCalledWith([...editorData]);
    expect(setEditorData.mock.calls[0]?.[0]).not.toBe(editorData);
    expect(onActionMoveEnd).toHaveBeenCalledWith({
      action,
      row,
      start: 2,
      end: 3.5,
    });
  });

  it("renders temporary action times while a resize preview is active", () => {
    const { rowDnd } = renderEditAction({
      getActionRender: (action) => (
        <span data-testid="rendered-time">
          {action.start}:{action.end}
        </span>
      ),
    });

    act(() => {
      rowDnd.onResize?.("right", {
        lastLeft: 120,
        left: 120,
        lastWidth: 200,
        width: 320,
      });
    });

    expect(host?.textContent).toContain("1:4.2");
  });
});
