import { type TimelineAction, type TimelineRow } from "@/interface/action";
import { ADD_SCALE_COUNT } from "@/interface/const";

/** Convert time to pixels */
export function parserTimeToPixel(
  data: number,
  param: {
    startLeft: number;
    scale: number;
    scaleWidth: number;
  }
) {
  const { startLeft, scale, scaleWidth } = param;
  return startLeft + (data / scale) * scaleWidth;
}

/** Convert pixels to time */
export function parserPixelToTime(
  data: number,
  param: {
    startLeft: number;
    scale: number;
    scaleWidth: number;
  }
) {
  const { startLeft, scale, scaleWidth } = param;
  return ((data - startLeft) / scaleWidth) * scale;
}

/** Convert position + width to start + end */
export function parserTransformToTime(
  data: {
    left: number;
    width: number;
  },
  param: {
    startLeft: number;
    scale: number;
    scaleWidth: number;
  }
) {
  const { left, width } = data;
  const start = parserPixelToTime(left, param);
  const end = parserPixelToTime(left + width, param);
  return {
    start,
    end,
  };
}

/** Convert start + end to position + width */
export function parserTimeToTransform(
  data: {
    start: number;
    end: number;
  },
  param: {
    startLeft: number;
    scale: number;
    scaleWidth: number;
  }
) {
  const { start, end } = data;
  const left = parserTimeToPixel(start, param);
  const width = parserTimeToPixel(end, param) - left;
  return {
    left,
    width,
  };
}

/** Get scale count based on data */
export function getScaleCountByRows(data: TimelineRow[], param: { scale: number, pad?: number }) {
  let max = 0;
  data.forEach((row) => {
    row.actions.forEach((action) => {
      max = Math.max(max, action.end);
    });
  });
  const count = Math.ceil(max / param.scale);
  return count + (param.pad ?? ADD_SCALE_COUNT);
}

/** Get current scale count based on time */
export function getScaleCountByPixel(
  data: number,
  param: {
    startLeft: number;
    scaleWidth: number;
    scaleCount: number;
  }
) {
  const { startLeft, scaleWidth } = param;
  const count = Math.ceil((data - startLeft) / scaleWidth);
  return Math.max(count + ADD_SCALE_COUNT, param.scaleCount);
}

/** Get position set of all times for actions */
export function parserActionsToPositions(
  actions: TimelineAction[],
  param: {
    startLeft: number;
    scale: number;
    scaleWidth: number;
  }
) {
  const positions: number[] = [];
  actions.forEach((item) => {
    positions.push(parserTimeToPixel(item.start, param));
    positions.push(parserTimeToPixel(item.end, param));
  });
  return positions;
}
