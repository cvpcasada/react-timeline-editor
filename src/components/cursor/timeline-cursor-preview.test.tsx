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
import { TimelineCursorPreview } from "./timeline-cursor-preview";

describe("TimelineCursorPreview", () => {
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

  function renderPreview(
    props: Partial<React.ComponentProps<typeof TimelineCursorPreview>> = {}
  ) {
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);

    act(() => {
      root?.render(
        <TimelineCursorPreview
          cursorTime={1}
          height={120}
          preview={{ surface: "time-area", time: 2 }}
          startLeft={20}
          scaleWidth={100}
          scale={1}
          {...props}
        />
      );
    });

    const preview = host.querySelector<HTMLElement>(
      ".timeline-editor-cursor-preview"
    );
    if (!preview) throw new Error("TimelineCursorPreview did not render");
    return preview;
  }

  it("fades out near the real cursor", () => {
    const preview = renderPreview({
      cursorTime: 1,
      preview: { surface: "time-area", time: 1.1 },
    });

    expect(preview.style.opacity).toBe("0");
  });

  it("renders at normal preview opacity away from the real cursor", () => {
    const preview = renderPreview({
      cursorTime: 1,
      preview: { surface: "time-area", time: 2 },
    });

    expect(preview.style.opacity).toBe("0.55");
  });

  it("renders the default preview marker", () => {
    renderPreview();

    expect(host?.querySelector(".timeline-editor-cursor-top")).not.toBeNull();
    expect(
      host?.querySelector(".timeline-editor-cursor-preview-head")
    ).toBeNull();
  });

  it("renders custom head content inside the built-in head", () => {
    renderPreview({
      getTimelineCursorPreviewHeadRender: (params) => (
        <span data-testid="head">{params.time.toFixed(1)}s</span>
      ),
    });

    expect(host?.querySelector("[data-testid='head']")?.textContent).toBe(
      "2.0s"
    );
  });
});
