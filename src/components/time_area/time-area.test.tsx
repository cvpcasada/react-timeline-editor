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
import { TimeArea } from "./time-area";

type VirtualizerOptions = {
  count: number;
  estimateSize: (index: number) => number;
};

vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: vi.fn((options: VirtualizerOptions) => ({
    measure: vi.fn(),
    getVirtualItems: () =>
      Array.from({ length: options.count }, (_, index) => {
        const size = options.estimateSize(index);
        return {
          key: index,
          index,
          size,
          start: Array.from({ length: index }, (_item, previousIndex) =>
            options.estimateSize(previousIndex)
          ).reduce((sum, value) => sum + value, 0),
        };
      }),
  })),
}));

describe("TimeArea", () => {
  let root: Root | null = null;
  let host: HTMLDivElement | null = null;

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

  function renderTimeArea(
    props: Partial<React.ComponentProps<typeof TimeArea>> = {}
  ) {
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);

    const setCursor = vi.fn();
    const onClickTimeArea = vi.fn();
    const scrollElementRef = React.createRef<HTMLDivElement | null>();
    scrollElementRef.current = document.createElement("div");

    act(() => {
      root?.render(
        <TimeArea
          scaleSplitCount={2}
          scaleWidth={100}
          startLeft={20}
          scale={2}
          scaleCount={2}
          maxScaleCount={3}
          scrollElementRef={scrollElementRef}
          setCursor={setCursor}
          onClickTimeArea={onClickTimeArea}
          {...props}
        />
      );
    });

    const timeArea = host.querySelector<HTMLElement>(
      ".timeline-editor-time-area"
    );
    if (!timeArea) throw new Error("TimeArea did not render");
    timeArea.getBoundingClientRect = () =>
      ({
        x: 100,
        left: 100,
        right: 320,
        width: 220,
        height: 30,
        top: 0,
        bottom: 30,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    return { timeArea, setCursor, onClickTimeArea };
  }

  function clickAt(element: HTMLElement, clientX: number) {
    act(() => {
      element.dispatchEvent(
        new MouseEvent("click", { bubbles: true, clientX })
      );
    });
  }

  it("clamps clicks before startLeft to time zero", () => {
    const { timeArea, onClickTimeArea, setCursor } = renderTimeArea();

    clickAt(timeArea, 110);

    expect(onClickTimeArea).toHaveBeenCalledWith(
      0,
      expect.objectContaining({ clientX: 110 })
    );
    expect(setCursor).toHaveBeenCalledWith({ time: 0 });
  });

  it("does not set the cursor when the click callback prevents default", () => {
    const { timeArea, setCursor } = renderTimeArea({
      onClickTimeArea: (_time, event) => {
        event.preventDefault();
      },
    });

    clickAt(timeArea, 220);

    expect(setCursor).not.toHaveBeenCalled();
  });

  it("ignores clicks past maxScaleCount", () => {
    const { timeArea, onClickTimeArea, setCursor } = renderTimeArea();

    clickAt(timeArea, 450);

    expect(onClickTimeArea).not.toHaveBeenCalled();
    expect(setCursor).not.toHaveBeenCalled();
  });

  it("renders major scale labels with the custom renderer", () => {
    renderTimeArea({
      getScaleRender: (scale) => <span data-testid="scale">T{scale}</span>,
    });

    expect(host?.textContent).toContain("T0");
    expect(host?.textContent).toContain("T2");
    expect(host?.textContent).toContain("T4");
  });
});
