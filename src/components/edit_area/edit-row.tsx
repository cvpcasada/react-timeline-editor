import React, { useCallback, useEffect, useMemo, type FC } from "react";
import { type TimelineRow } from "@/interface/action";
import { type CommonProp } from "@/interface/common-prop";
import {
  DEFAULT_SCALE,
  DEFAULT_SCALE_WIDTH,
  DEFAULT_START_LEFT,
} from "@/interface/const";
import { prefix } from "@/utils/deal-class-prefix";
import { parserPixelToTime, parserTimeToTransform } from "@/utils/deal-data";
import { type SnapGuideLineData } from "./snap-lines";
import { EditAction } from "./edit-action";
import { useVirtualizer } from "@tanstack/react-virtual";

export type EditRowProps = CommonProp & {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  rowData?: TimelineRow;
  rowRenderHeight: number;
  isCollapsed?: boolean;
  style?: React.CSSProperties;
  snapData: SnapGuideLineData;
  setEditorData: (params: TimelineRow[]) => void;
  autoScroll?: boolean;
  onPointerEnter?: React.PointerEventHandler<HTMLDivElement>;
  onPointerLeave?: React.PointerEventHandler<HTMLDivElement>;
};

export const EditRow: FC<EditRowProps> = (props) => {
  const {
    rowData,
    rowRenderHeight,
    isCollapsed = false,
    style = {},
    onClickRow,
    onDoubleClickRow,
    onContextMenuRow,
    scrollContainerRef,
    startLeft,
    scale,
    scaleWidth,
    unstable_rowActionsOverscan,
    getCollapsedRowLabelRender,
  } = props;

  const classNames = ["edit-row"];
  if (rowData?.selected) classNames.push("edit-row-selected");

  // Get default values for optional props
  const safeScale = scale ?? DEFAULT_SCALE;
  const safeScaleWidth = scaleWidth ?? DEFAULT_SCALE_WIDTH;
  const safeStartLeft = startLeft ?? DEFAULT_START_LEFT;

  const handleTime = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): number => {
    if (!scrollContainerRef.current) return 0;
    const elContainer = e.currentTarget! as HTMLElement;
    const rect = elContainer.getBoundingClientRect();

    const position = e.clientX - rect.x;
    const left = position;
    const time = parserPixelToTime(left, {
      startLeft: safeStartLeft,
      scale: safeScale,
      scaleWidth: safeScaleWidth,
    });
    return time;
  };

  const actions = useMemo(
    () =>
      (rowData?.actions ? [...rowData.actions] : []).sort(
        (a, b) => a.start - b.start
      ),
    [rowData]
  );

  const getItemKey = useCallback(
    (index: number) => actions[index]?.id ?? index,
    [actions]
  );

  // oxlint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    horizontal: true,
    count: actions.length,
    getItemKey,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: (index) => {
      if (!actions[index]) return 0;

      let start = index > 0 ? actions[index - 1]!.end : 0;
      let end = actions[index].end;

      if (start > end) return 0;

      let { width } = parserTimeToTransform(
        { start, end },
        {
          startLeft: safeStartLeft,
          scale: safeScale,
          scaleWidth: safeScaleWidth,
        }
      );
      return width;
    },
    overscan: unstable_rowActionsOverscan ?? 5,
  });

  // Remeasure when scale, scaleWidth or startLeft change
  useEffect(
    () => virtualizer.measure(),
    [safeScale, safeScaleWidth, safeStartLeft, virtualizer]
  );

  return (
    <div
      className={`${prefix(...classNames)} ${(rowData?.classNames || []).join(
        " "
      )}`}
      style={style}
      onPointerEnter={props.onPointerEnter}
      onPointerLeave={props.onPointerLeave}
      onClick={(e) => {
        if (rowData && onClickRow) {
          const time = handleTime(e);
          onClickRow(e, { row: rowData, time: time });
        }
      }}
      onDoubleClick={(e) => {
        if (rowData && onDoubleClickRow) {
          const time = handleTime(e);
          onDoubleClickRow(e, { row: rowData, time: time });
        }
      }}
      onContextMenu={(e) => {
        if (rowData && onContextMenuRow) {
          const time = handleTime(e);
          onContextMenuRow(e, { row: rowData, time: time });
        }
      }}
    >
      {rowData && isCollapsed && getCollapsedRowLabelRender && (
        <div className={prefix("collapsed-row-label")} aria-hidden="true">
          {getCollapsedRowLabelRender({
            row: rowData,
            height: rowRenderHeight,
          })}
        </div>
      )}
      {rowData &&
        virtualizer.getVirtualItems().map((virtualEntry) => {
          const action = actions[virtualEntry.index];
          if (!action) throw new Error("Action not found");
          return (
            <EditAction
              key={action.id}
              {...props}
              handleTime={handleTime}
              row={rowData}
              rowRenderHeight={rowRenderHeight}
              action={action}
            />
          );
        })}
    </div>
  );
};
