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
import { useSnap, type UseSnapProps, type UseSnapReturn } from "./use-snap";

function UseSnapHarness({
  apiRef,
  props,
}: {
  apiRef: React.RefObject<UseSnapReturn | null>;
  props: UseSnapProps;
}) {
  apiRef.current = useSnap(props);
  return null;
}

describe("useSnap", () => {
  let root: Root | null = null;
  let host: HTMLDivElement | null = null;

  const currentAction: TimelineAction = {
    id: "current",
    start: 1,
    end: 2,
    effectId: "clip",
  };
  const peerAction: TimelineAction = {
    id: "peer",
    start: 3,
    end: 4,
    effectId: "clip",
  };
  const otherAction: TimelineAction = {
    id: "other",
    start: 5,
    end: 6,
    effectId: "clip",
  };
  const row: TimelineRow = {
    id: "row",
    actions: [currentAction, peerAction, otherAction],
  };

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
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

  function renderHook(props: Partial<UseSnapProps> = {}) {
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);

    const apiRef = React.createRef<UseSnapReturn | null>();
    const baseProps: UseSnapProps = {
      snap: true,
      hideCursor: false,
      cursorTime: 7,
      scaleWidth: 100,
      scale: 1,
      startLeft: 10,
      editorData: [row],
      snapPositions: [
        { value: 110, actionId: currentAction.id, rowId: row.id },
        { value: 210, actionId: currentAction.id, rowId: row.id },
        { value: 310, actionId: peerAction.id, rowId: row.id },
        { value: 510, actionId: otherAction.id, rowId: row.id },
      ],
      ...props,
    };

    const rerender = (nextProps: Partial<UseSnapProps>) => {
      act(() => {
        root?.render(
          <UseSnapHarness
            apiRef={apiRef}
            props={{ ...baseProps, ...nextProps }}
          />
        );
      });
    };

    rerender({});

    if (!apiRef.current) {
      throw new Error("useSnap harness did not expose its API");
    }

    return { apiRef, rerender };
  }

  it("excludes the active action and appends the visible cursor position", () => {
    const { apiRef } = renderHook();

    act(() => {
      apiRef.current?.handleInitSnap({ action: currentAction, row });
    });

    expect(apiRef.current?.snapData).toEqual({
      isMoving: true,
      movePositions: [],
      assistPositions: [310, 510, 710],
    });
  });

  it("honors assist-action filtering and hidden cursor state", () => {
    const { apiRef } = renderHook({
      hideCursor: true,
      getAssistDragLineActionIds: () => [peerAction.id],
    });

    act(() => {
      apiRef.current?.handleInitSnap({ action: currentAction, row });
    });

    expect(apiRef.current?.snapData.assistPositions).toEqual([310]);
  });

  it("clears assist positions when snap is disabled mid-drag", () => {
    const { apiRef, rerender } = renderHook();

    act(() => {
      apiRef.current?.handleInitSnap({ action: currentAction, row });
    });
    expect(apiRef.current?.snapData.assistPositions).toEqual([310, 510, 710]);

    rerender({ snap: false });

    expect(apiRef.current?.snapData).toEqual({
      isMoving: true,
      movePositions: [],
      assistPositions: [],
    });
  });

  it("tracks only the actively resized edge", () => {
    const { apiRef } = renderHook();

    act(() => {
      apiRef.current?.handleInitSnap({ action: currentAction, row });
      apiRef.current?.handleUpdateSnap({
        action: currentAction,
        row,
        start: 2,
        end: 5,
        dir: "right",
      });
    });

    expect(apiRef.current?.snapData.movePositions).toEqual([510]);
  });
});
