import { describe, expect, it } from "vite-plus/test";
import {
  getScaleCountByPixel,
  getScaleCountByRows,
  parserPixelToTime,
  parserTimeToPixel,
  parserTimeToTransform,
  parserTransformToTime,
} from "./deal-data";

describe("timeline coordinate conversions", () => {
  const transform = {
    startLeft: 17,
    scale: 2.5,
    scaleWidth: 73,
  };

  it("round-trips time through pixels with non-default scale settings", () => {
    const time = 12.375;
    const pixel = parserTimeToPixel(time, transform);

    expect(parserPixelToTime(pixel, transform)).toBeCloseTo(time, 12);
  });

  it("round-trips action bounds through left and width", () => {
    const bounds = { start: 3.25, end: 9.75 };
    const rendered = parserTimeToTransform(bounds, transform);

    expect(parserTransformToTime(rendered, transform)).toEqual({
      start: expect.closeTo(bounds.start, 12),
      end: expect.closeTo(bounds.end, 12),
    });
  });
});

describe("timeline scale counts", () => {
  it("keeps the configured minimum when content is shorter than the viewport", () => {
    expect(
      getScaleCountByPixel(32, {
        startLeft: 20,
        scaleWidth: 160,
        scaleCount: 20,
      })
    ).toBe(20);
  });

  it("rounds up to include the longest action plus padding", () => {
    expect(
      getScaleCountByRows(
        [
          {
            id: "track",
            actions: [{ id: "clip", start: 1, end: 4.01, effectId: "video" }],
          },
        ],
        { scale: 2, pad: 1 }
      )
    ).toBe(4);
  });
});
