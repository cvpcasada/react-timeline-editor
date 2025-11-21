import { DEFAULT_ROW_HEIGHT, DEFAULT_SCALE, DEFAULT_SCALE_SPLIT_COUNT, DEFAULT_SCALE_WIDTH, DEFAULT_START_LEFT, MIN_SCALE_COUNT } from "@/interface/const";
import { type TimelineEditor } from "@/interface/timeline";
import { log } from '@cyca/log';

export function withDefaults(props: TimelineEditor) {
  let {
    editorData = [],
    effects = {},
    scale = DEFAULT_SCALE,
    scaleSplitCount = DEFAULT_SCALE_SPLIT_COUNT,
    scaleWidth = DEFAULT_SCALE_WIDTH,
    startLeft = DEFAULT_START_LEFT,
    minScaleCount,
    maxScaleCount = Infinity,
    rowHeight = DEFAULT_ROW_HEIGHT,
    autoScrollSpeed = 1,
    autoScrollMaxSpeed = 10,
  } = props;

  if (scale <= 0) {
    log.error('Error: scale must be greater than 0!')
    scale = DEFAULT_SCALE;
  }

  if (scaleSplitCount <= 0) {
    log.warn('Warning: scaleSplitCount cannot be less than 1!')
    scaleSplitCount = 1
  }

  if (scaleWidth <= 0) {
    log.warn('Warning: scaleWidth must be greater than 0!');
    scaleWidth = DEFAULT_SCALE_WIDTH;
  }

  if (startLeft < 0) {
    log.warn('Warning: startLeft cannot be less than 0!')
    startLeft = 0
  }

  if (minScaleCount && typeof minScaleCount === 'number') {
    if (minScaleCount < 1) {
      log.warn('Warning: minScaleCount must be greater than 1!')
      minScaleCount = MIN_SCALE_COUNT
    }
    minScaleCount = parseInt(minScaleCount + '');

    if (maxScaleCount < minScaleCount) {
      log.warn('Warning: maxScaleCount cannot be less than minScaleCount!')
      maxScaleCount = minScaleCount
    }
  }

  maxScaleCount = maxScaleCount === Infinity ? Infinity : parseInt(maxScaleCount + '');

  if (rowHeight <= 0) {
    log.warn('Warning: rowHeight must be greater than 0!')
    rowHeight = DEFAULT_ROW_HEIGHT
  }

  const temp = { ...props };
  delete temp['style'];
  return {
    ...temp,
    editorData,
    effects,
    scale,
    scaleSplitCount,
    scaleWidth,
    startLeft,
    minScaleCount,
    maxScaleCount,
    rowHeight,
    autoScrollSpeed,
    autoScrollMaxSpeed,
  }
}
