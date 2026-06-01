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
import { type CommonProp } from "@/interface/common-prop";
import { type EditRowProps } from "./edit-row";
import { EditArea, type EditAreaProps } from "./edit-area";

const editRowMock = vi.hoisted(() => ({
  props: [] as EditRowProps[],
}));

vi.mock("./edit-row", async () => {
  const ReactModule = await import("react");
  return {
    EditRow: (props: EditRowProps) => {
      editRowMock.props.push(props);
      return ReactModule.createElement("div", {
        "data-row-id": props.rowData?.id,
        onPointerEnter: props.onPointerEnter,
        onPointerLeave: props.onPointerLeave,
        style: props.style,
      });
    },
  };
});

describe("EditArea", () => {
  let root: Root | null = null;
  let host: HTMLDivElement | null = null;

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    editRowMock.props = [];
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

  function renderEditArea(props: Partial<EditAreaProps> = {}) {
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);

    const commonProps: CommonProp = {
      editorData: [
        {
          id: "collapsed",
          collapsed: { height: 12 },
          actions: [{ id: "clip", start: 1, end: 2, effectId: "video" }],
        },
        { id: "normal", actions: [] },
      ],
      effects: { video: { id: "video" } },
      scale: 1,
      scaleWidth: 100,
      scaleSplitCount: 10,
      startLeft: 20,
      scaleCount: 4,
      cursorTime: 3,
      timelineWidth: 500,
      setScaleCount: vi.fn(),
    };
    const areaRef = React.createRef<HTMLDivElement | null>();
    const setHoveredRowId = vi.fn();
    const clearHoveredRowId = vi.fn();
    const setLockedRowId = vi.fn();
    const onActionMoveStart = vi.fn(() => "move-start");
    const onActionMoveEnd = vi.fn(() => "move-end");

    act(() => {
      root?.render(
        <EditArea
          ref={areaRef}
          {...commonProps}
          timelineHeight={120}
          setEditorData={vi.fn()}
          scrollElementRef={React.createRef<HTMLDivElement | null>()}
          snap
          snapPositions={[
            { value: 120, actionId: "clip", rowId: "collapsed" },
            { value: 320, actionId: "peer", rowId: "normal" },
          ]}
          rowLayouts={[
            { row: commonProps.editorData[0]!, top: 0, height: 12 },
            { row: commonProps.editorData[1]!, top: 12, height: 40 },
          ]}
          rowLayoutsTotalHeight={52}
          setHoveredRowId={setHoveredRowId}
          clearHoveredRowId={clearHoveredRowId}
          setLockedRowId={setLockedRowId}
          onActionMoveStart={onActionMoveStart}
          onActionMoveEnd={onActionMoveEnd}
          {...props}
        />
      );
    });

    if (!areaRef.current) throw new Error("EditArea did not attach its ref");

    return {
      area: areaRef.current,
      setHoveredRowId,
      clearHoveredRowId,
      setLockedRowId,
      onActionMoveStart,
      onActionMoveEnd,
    };
  }

  it("sizes the edit surface by the larger of content width and viewport width", () => {
    const { area } = renderEditArea();

    expect(area.style.width).toBe("500px");
    expect(area.style.height).toBe("52px");
    expect(area.style.backgroundPositionX).toBe("0, 20px");
    expect(area.style.backgroundSize).toBe("20px, 100px");
    expect(editRowMock.props.map((props) => props.style?.transform)).toEqual([
      "translateY(0px)",
      "translateY(12px)",
    ]);
  });

  it("tracks hover only for collapsible rows", () => {
    const { setHoveredRowId, clearHoveredRowId } = renderEditArea();

    act(() => {
      editRowMock.props[0]?.onPointerEnter?.(
        {} as React.PointerEvent<HTMLDivElement>
      );
      editRowMock.props[1]?.onPointerEnter?.(
        {} as React.PointerEvent<HTMLDivElement>
      );
      editRowMock.props[0]?.onPointerLeave?.(
        {} as React.PointerEvent<HTMLDivElement>
      );
    });

    expect(setHoveredRowId).toHaveBeenCalledTimes(1);
    expect(setHoveredRowId).toHaveBeenCalledWith("collapsed");
    expect(clearHoveredRowId).toHaveBeenCalledWith("collapsed");
  });

  it("locks a collapsed row for action movement and unlocks on completion", () => {
    const { setLockedRowId, onActionMoveStart, onActionMoveEnd } =
      renderEditArea();
    const action = editRowMock.props[0]?.rowData?.actions[0];
    const row = editRowMock.props[0]?.rowData;
    if (!action || !row) throw new Error("missing captured row data");

    let startResult: unknown;
    let endResult: unknown;
    act(() => {
      startResult = editRowMock.props[0]?.onActionMoveStart?.({ action, row });
      endResult = editRowMock.props[0]?.onActionMoveEnd?.({
        action,
        row,
        start: 2,
        end: 3,
      });
    });

    expect(startResult).toBe("move-start");
    expect(endResult).toBe("move-end");
    expect(setLockedRowId).toHaveBeenNthCalledWith(1, "collapsed");
    expect(setLockedRowId).toHaveBeenNthCalledWith(2, null);
    expect(onActionMoveStart).toHaveBeenCalledWith({ action, row });
    expect(onActionMoveEnd).toHaveBeenCalledWith({
      action,
      row,
      start: 2,
      end: 3,
    });
  });
});
