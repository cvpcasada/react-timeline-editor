import { parserPixelToTime } from '@/utils/deal_data';
import { type FC, useEffect, useLayoutEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { type CommonProp } from '@/interface/common_prop';
import { type OnScrollParams } from '@/interface/timeline';
import { prefix } from '@/utils/deal_class_prefix';
import './time_area.less';
import { Measured } from '@/components/measured';

/** Animation timeline component parameters */
export type TimeAreaProps = CommonProp & {
  /** Scroll distance from left */
  scrollLeft: number;
  /** Scroll callback for synchronized scrolling */
  onScroll?: (params: OnScrollParams) => void;
  /** Set cursor position */
  setCursor: (param: { left?: number; time?: number }) => void;
};

/** Animation timeline component */
export const TimeArea: FC<TimeAreaProps> = ({ setCursor, maxScaleCount, hideCursor, scale, scaleWidth, scaleCount, scaleSplitCount, startLeft, scrollLeft, onClickTimeArea, getScaleRender }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  /** Whether to show sub-scale marks */
  const showUnit = (scaleSplitCount ?? 0) > 0;

  /** Get column width */
  const getColumnWidth = (index: number): number => {
    const splitCount = scaleSplitCount ?? 1;
    const width = scaleWidth ?? 160;
    const left = startLeft ?? 20;
    switch (index) {
      case 0:
        return left;
      default:
        return showUnit ? width / splitCount : width;
    }
  };

  const columnCount = showUnit ? scaleCount * (scaleSplitCount ?? 1) + 1 : scaleCount;

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    horizontal: true,
    count: columnCount,
    getScrollElement: () => parentRef.current,
    estimateSize: getColumnWidth,
    overscan: 10,
  });

  // Sync external scrollLeft
  useLayoutEffect(() => {
    if (parentRef.current && scrollLeft !== undefined) {
      parentRef.current.scrollLeft = scrollLeft;
    }
  }, [scrollLeft]);

  // Remeasure when scaleWidth or startLeft change
  useEffect(() => {
    virtualizer.measure();
  }, [scaleWidth, startLeft, virtualizer]);

  return (
    <Measured
      className={prefix('time-area')}
      render={({ width, height }) => (
        <>
          <div
            className={prefix('time-area-virtual')}
            ref={parentRef}
            style={{
              width,
              height,
              overflowX: 'hidden',
              overflowY: 'hidden',
            }}
          >
            <div
              style={{
                width: `${virtualizer.getTotalSize()}px`,
                height: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualColumn) => {
                const columnIndex = virtualColumn.index;
                const splitCount = scaleSplitCount ?? 1;
                const scaleValue = scale ?? 1;
                const isShowScale = showUnit ? columnIndex % splitCount === 0 : true;
                const classNames = ['time-unit'];
                if (isShowScale) classNames.push('time-unit-big');
                const item = (showUnit ? columnIndex / splitCount : columnIndex) * scaleValue;

                return (
                  <div
                    key={virtualColumn.key}
                    data-index={virtualColumn.index}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: `${virtualColumn.size}px`,
                      transform: `translateX(${virtualColumn.start}px)`,
                    }}
                    className={prefix(...classNames)}
                  >
                    {isShowScale && <div className={prefix('time-unit-scale')}>{getScaleRender ? getScaleRender(item) : item}</div>}
                  </div>
                );
              })}
            </div>
          </div>
          <div
            style={{ width, height }}
            onClick={(e) => {
              if (hideCursor) return;
              const leftStart = startLeft ?? 20;
              const widthValue = scaleWidth ?? 160;
              const scaleValue = scale ?? 1;
              const maxCount = maxScaleCount ?? Infinity;
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const position = e.clientX - rect.x;
              const left = Math.max(position + scrollLeft, leftStart);
              if (left > maxCount * widthValue + leftStart - scrollLeft) return;

              const time = parserPixelToTime(left, { startLeft: leftStart, scale: scaleValue, scaleWidth: widthValue });
              const result = onClickTimeArea && onClickTimeArea(time, e);
              if (result === false) return; // Prevent setting time when returning false
              setCursor({ time });
            }}
            className={prefix('time-area-interact')}
          ></div>
        </>
      )}
    />
  );
};
