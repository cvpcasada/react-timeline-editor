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
import { RowDnd } from "./row-rnd";
import { type RowRndApi, type RowRndProps } from "./row-rnd-interface";

type GestureState = {
  active?: boolean;
  first?: boolean;
  last?: boolean;
  delta: [number, number];
  xy: [number, number];
  event?: { target: EventTarget | null };
};

type GestureCall = {
  handler: (state: GestureState) => void;
};

const gestureMock = vi.hoisted(() => ({
  calls: [] as GestureCall[],
}));

vi.mock("@use-gesture/react", () => ({
  useDrag: vi.fn((handler: GestureCall["handler"]) => {
    gestureMock.calls.push({ handler });
  }),
}));

describe("RowDnd", () => {
  let roots: Root[] = [];

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    gestureMock.calls = [];
  });

  afterEach(() => {
    for (const root of roots) {
      act(() => {
        root.unmount();
      });
    }
    document.body.replaceChildren();
    roots = [];
    vi.unstubAllGlobals();
  });

  function renderRowDnd(props: Partial<RowRndProps> = {}) {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    roots.push(root);

    const apiRef = React.createRef<RowRndApi | null>();
    const parentRef = React.createRef<HTMLDivElement | null>();
    parentRef.current = document.createElement("div");

    act(() => {
      root.render(
        <RowDnd
          ref={apiRef}
          parentRef={parentRef}
          left={20}
          width={50}
          grid={10}
          autoScroll={false}
          edges={{ left: ".left-handle", right: ".right-handle" }}
          {...props}
        >
          <div className="clip">
            <span className="left-handle" />
            <span className="right-handle" />
          </div>
        </RowDnd>
      );
    });

    const element = host.querySelector<HTMLElement>(".clip");
    if (!element) throw new Error("RowDnd did not render its child element");

    const drag = gestureMock.calls[0];
    const leftResize = gestureMock.calls[1];
    const rightResize = gestureMock.calls[2];
    if (!drag || !leftResize || !rightResize || !apiRef.current) {
      throw new Error("RowDnd did not register the expected gesture handlers");
    }

    return {
      api: apiRef.current,
      element,
      drag,
      leftResize,
      rightResize,
    };
  }

  function dragBy(call: GestureCall, element: HTMLElement, dx: number) {
    act(() => {
      call.handler({
        active: true,
        delta: [dx, 0],
        xy: [0, 0],
        event: { target: element },
      });
    });
  }

  it("keeps data-left and --translate-x synchronized for external overlays", () => {
    const { api, element } = renderRowDnd({ left: 37, width: 84 });

    expect(element.dataset.left).toBe("37");
    expect(element.style.getPropertyValue("--translate-x")).toBe("37px");
    expect(element.dataset.width).toBe("84");

    act(() => {
      api.updateLeft(0);
      api.updateWidth(12);
    });

    expect(api.getLeft()).toBe(0);
    expect(api.getWidth()).toBe(12);
    expect(element.dataset.left).toBe("0");
    expect(element.style.getPropertyValue("--translate-x")).toBe("0px");
    expect(element.dataset.width).toBe("12");
  });

  it("snaps a rightward drag by the leading edge without stretching width", () => {
    const onDrag = vi.fn();
    const { element, drag } = renderRowDnd({
      snapDistance: 8,
      snapPositions: [95],
      onDrag,
    });

    dragBy(drag, element, 30);

    expect(onDrag).toHaveBeenCalledWith(
      { lastLeft: 20, left: 45, lastWidth: 50, width: 50 },
      undefined
    );
    expect(element.dataset.left).toBe("45");
    expect(element.dataset.width).toBe("50");
  });

  it("clamps drag movement to the right bound", () => {
    const { element, drag } = renderRowDnd({
      getBounds: () => ({ left: 0, right: 80 }),
    });

    dragBy(drag, element, 50);

    expect(element.dataset.left).toBe("30");
  });

  it("does not commit movement when onDrag vetoes the update", () => {
    const onDragEnd = vi.fn();
    const { element, drag } = renderRowDnd({
      onDrag: () => false,
      onDragEnd,
    });

    dragBy(drag, element, 30);
    act(() => {
      drag.handler({
        last: true,
        delta: [0, 0],
        xy: [0, 0],
        event: { target: element },
      });
    });

    expect(element.dataset.left).toBe("20");
    expect(onDragEnd).toHaveBeenCalledWith({ left: 20, width: 50 });
  });

  it("refuses right resize updates that would invert the action", () => {
    const onResize = vi.fn();
    const { element, rightResize } = renderRowDnd({ onResize });

    act(() => {
      rightResize.handler({
        active: true,
        delta: [-70, 0],
        xy: [0, 0],
      });
    });

    expect(onResize).not.toHaveBeenCalled();
    expect(element.dataset.width).toBe("50");
  });
});
