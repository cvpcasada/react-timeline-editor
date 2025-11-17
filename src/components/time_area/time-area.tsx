import { parserPixelToTime } from "@/utils/deal-data";
import { Activity, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { prefix } from "@/utils/deal-class-prefix";

interface TimeAreaProps {
  scaleSplitCount?: number;
  scaleWidth?: number;
  startLeft?: number;
  scaleCount: number;
  maxScaleCount?: number;
  scale?: number;
  scrollElementRef: React.RefObject<HTMLDivElement | null>;
  onClickTimeArea?: (time: number, e: React.MouseEvent<HTMLDivElement>) => void;
  setCursor: (param: { left?: number; time: number }) => void;
  getScaleRender?: (scale: number) => React.ReactNode;
}

export function TimeArea({
  scaleSplitCount,
  scaleWidth,
  startLeft,
  scaleCount,
  maxScaleCount,
  scale,
  scrollElementRef,
  onClickTimeArea,
  setCursor,
  getScaleRender,
}: TimeAreaProps) {
  const splitCount = scaleSplitCount ?? 1;
  const width = scaleWidth ?? 160;
  const left = startLeft ?? 20;

  /** Whether to show sub-scale marks */
  const showUnit = (scaleSplitCount ?? 0) > 0;

  const columnCount = showUnit
    ? scaleCount * (scaleSplitCount ?? 1) + 1
    : scaleCount;

  const totalWidth =
    (showUnit ? width / splitCount : width) * (columnCount - 1) + left;

  const getColumnWidth = (index: number): number => {
    switch (index) {
      case 0:
        return left;
      default:
        return showUnit ? width / splitCount : width;
    }
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    horizontal: true,
    count: columnCount,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: getColumnWidth,
    overscan: 10,
  });

  useEffect(
    () => virtualizer.measure(),
    [scale, scaleWidth, startLeft, virtualizer]
  );

  return (
    <div
      style={{ width: `${totalWidth}px` }}
      className={prefix("time-area")}
      onClick={(e) => {
        // if (hideCursor) return;
        const leftStart = startLeft ?? 20;
        const widthValue = scaleWidth ?? 160;
        const scaleValue = scale ?? 1;
        const maxCount = maxScaleCount ?? Infinity;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const position = e.clientX - rect.x;
        const left = Math.max(position, leftStart);
        if (left > maxCount * widthValue + leftStart) return;

        const time = parserPixelToTime(left, {
          startLeft: leftStart,
          scale: scaleValue,
          scaleWidth: widthValue,
        });
        onClickTimeArea && onClickTimeArea(time, e);

        if (e.defaultPrevented) return; // Prevent setting time when prevented from onClickTimeArea
        setCursor({ time });
      }}
    >
      {virtualizer.getVirtualItems().map((virtualColumn) => {
        const columnIndex = virtualColumn.index;
        const splitCount = scaleSplitCount ?? 1;
        const scaleValue = scale ?? 1;
        const isShowScale = showUnit ? columnIndex % splitCount === 0 : true;

        const classNames = [
          prefix("time-unit"),
          isShowScale ? prefix("time-unit-big") : prefix("time-unit-small"),
        ];

        const item =
          (showUnit ? columnIndex / splitCount : columnIndex) * scaleValue;

        return (
          <div
            key={virtualColumn.key}
            data-index={virtualColumn.index}
            style={{
              width: `${virtualColumn.size}px`,
              transform: `translateX(${virtualColumn.start}px)`,
            }}
            className={classNames.join(" ")}
          >
            <Activity mode={isShowScale ? "visible" : "hidden"}>
              <div className={prefix("time-unit-scale")}>
                {getScaleRender?.(item) ?? item}
              </div>
            </Activity>
          </div>
        );
      })}
    </div>
  );
}
