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
import { type EditActionProps } from "./edit-action";
import { EditRow, type EditRowProps } from "./edit-row";

type VirtualizerOptions = {
  count: number;
  estimateSize: (index: number) => number;
  getItemKey: (index: number) => React.Key;
};

const editActionMock = vi.hoisted(() => ({
  props: [] as EditActionProps[],
}));

vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: vi.fn((options: VirtualizerOptions) => ({
    measure: vi.fn(),
    getVirtualItems: () =>
      Array.from({ length: options.count }, (_item, index) => ({
        key: options.getItemKey(index),
        index,
        size: options.estimateSize(index),
        start: 0,
      })),
  })),
}));

vi.mock("./edit-action", async () => {
  const ReactModule = await import("react");
  return {
    EditAction: (props: EditActionProps) => {
      editActionMock.props.push(props);
      return ReactModule.createElement("div", {
        "data-action-id": props.action.id,
      });
    },
  };
});

describe("EditRow", () => {
  let root: Root | null = null;
  let host: HTMLDivElement | null = null;

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    editActionMock.props = [];
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

  function renderEditRow(props: Partial<EditRowProps> = {}) {
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);

    const scrollContainerRef = React.createRef<HTMLDivElement | null>();
    scrollContainerRef.current = document.createElement("div");
    const commonProps: CommonProp = {
      editorData: [],
      effects: { video: { id: "video" } },
      scale: 2,
      scaleWidth: 100,
      startLeft: 20,
      scaleCount: 4,
      cursorTime: 0,
      timelineWidth: 500,
      setScaleCount: vi.fn(),
    };
    const onClickRow = vi.fn();
    const onPointerMoveRow = vi.fn();
    const onDoubleClickRow = vi.fn();
    const onContextMenuRow = vi.fn();

    act(() => {
      root?.render(
        <EditRow
          {...commonProps}
          rowData={{
            id: "row",
            selected: true,
            classNames: ["custom-row"],
            actions: [
              { id: "late", start: 3, end: 4, effectId: "video" },
              { id: "early", start: 1, end: 2, effectId: "video" },
            ],
          }}
          rowRenderHeight={32}
          style={{ height: 32 }}
          snapData={{ isMoving: false, movePositions: [], assistPositions: [] }}
          setEditorData={vi.fn()}
          scrollContainerRef={scrollContainerRef}
          onClickRow={onClickRow}
          onPointerMoveRow={onPointerMoveRow}
          onDoubleClickRow={onDoubleClickRow}
          onContextMenuRow={onContextMenuRow}
          {...props}
        />
      );
    });

    const rowElement = host.querySelector<HTMLElement>(
      ".timeline-editor-edit-row"
    );
    if (!rowElement) throw new Error("EditRow did not render");
    rowElement.getBoundingClientRect = () =>
      ({
        x: 100,
        left: 100,
        right: 600,
        width: 500,
        height: 32,
        top: 0,
        bottom: 32,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    return {
      rowElement,
      onClickRow,
      onPointerMoveRow,
      onDoubleClickRow,
      onContextMenuRow,
    };
  }

  function dispatchMouse(element: HTMLElement, type: string, clientX: number) {
    act(() => {
      element.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX }));
    });
  }

  function dispatchPointer(element: HTMLElement, type: string, clientX: number) {
    act(() => {
      element.dispatchEvent(
        new PointerEvent(type, { bubbles: true, clientX })
      );
    });
  }

  it("sorts actions by start time before rendering virtual entries", () => {
    const { rowElement } = renderEditRow();

    expect(rowElement.className).toContain("timeline-editor-edit-row-selected");
    expect(rowElement.className).toContain("custom-row");
    expect(editActionMock.props.map((props) => props.action.id)).toEqual([
      "early",
      "late",
    ]);
  });

  it("converts row click positions into timeline time", () => {
    const { rowElement, onClickRow } = renderEditRow();

    dispatchMouse(rowElement, "click", 270);

    expect(onClickRow).toHaveBeenCalledWith(
      expect.objectContaining({ clientX: 270 }),
      expect.objectContaining({ time: 3 })
    );
  });

  it("converts row pointer movement into timeline time", () => {
    const { rowElement, onPointerMoveRow } = renderEditRow();

    dispatchPointer(rowElement, "pointermove", 270);

    expect(onPointerMoveRow).toHaveBeenCalledWith(
      expect.objectContaining({ clientX: 270 }),
      expect.objectContaining({ time: 3 })
    );
  });

  it("routes double click and context menu through the same time conversion", () => {
    const { rowElement, onDoubleClickRow, onContextMenuRow } = renderEditRow();

    dispatchMouse(rowElement, "dblclick", 320);
    dispatchMouse(rowElement, "contextmenu", 370);

    expect(onDoubleClickRow).toHaveBeenCalledWith(
      expect.objectContaining({ clientX: 320 }),
      expect.objectContaining({ time: 4 })
    );
    expect(onContextMenuRow).toHaveBeenCalledWith(
      expect.objectContaining({ clientX: 370 }),
      expect.objectContaining({ time: 5 })
    );
  });

  it("renders custom empty row content when the row has no actions", () => {
    const emptyRender = vi.fn(({ row, height }) => (
      <span data-testid="empty-row">
        {row.id}:{height}
      </span>
    ));

    const { rowElement } = renderEditRow({
      rowData: {
        id: "empty",
        actions: [],
      },
      rowRenderHeight: 44,
      getEmptyRowRender: emptyRender,
    });

    expect(emptyRender).toHaveBeenCalledWith({
      row: { id: "empty", actions: [] },
      height: 44,
    });
    expect(
      rowElement.querySelector("[data-testid='empty-row']")?.textContent
    ).toBe("empty:44");
  });

  it("does not render custom empty row content when the row has actions", () => {
    const emptyRender = vi.fn();

    const { rowElement } = renderEditRow({ getEmptyRowRender: emptyRender });

    expect(emptyRender).not.toHaveBeenCalled();
    expect(rowElement.querySelector(".timeline-editor-empty-row")).toBeNull();
  });

  it("renders an action preview above empty row content without adding it to actions", () => {
    const previewRender = vi.fn(({ action, row, height }) => (
      <span data-testid="action-preview">
        {row.id}:{action.id}:{height}
      </span>
    ));

    const { rowElement } = renderEditRow({
      rowData: { id: "empty", actions: [] },
      rowRenderHeight: 44,
      getEmptyRowRender: () => <span data-testid="empty-row">empty</span>,
      actionPreview: {
        rowId: "empty",
        action: { id: "preview", start: 2, end: 3.5, effectId: "video" },
      },
      getActionPreviewRender: previewRender,
    });

    const empty = rowElement.querySelector("[data-testid='empty-row']");
    const preview = rowElement.querySelector<HTMLElement>(
      ".timeline-editor-action-preview"
    );

    expect(empty).not.toBeNull();
    expect(preview).not.toBeNull();
    expect(preview?.style.transform).toBe("translateX(120px)");
    expect(preview?.style.width).toBe("75px");
    expect(preview?.style.height).toBe("44px");
    expect(rowElement.textContent).toContain("empty");
    expect(rowElement.textContent).toContain("empty:preview:44");
    expect(previewRender).toHaveBeenCalledWith({
      row: { id: "empty", actions: [] },
      action: { id: "preview", start: 2, end: 3.5, effectId: "video" },
      height: 44,
    });
    expect(editActionMock.props).toEqual([]);
  });

  it("does not render an action preview for a different row", () => {
    const previewRender = vi.fn();
    const { rowElement } = renderEditRow({
      actionPreview: {
        rowId: "other",
        action: { id: "preview", start: 2, end: 3, effectId: "video" },
      },
      getActionPreviewRender: previewRender,
    });

    expect(previewRender).not.toHaveBeenCalled();
    expect(
      rowElement.querySelector(".timeline-editor-action-preview")
    ).toBeNull();
  });
});
