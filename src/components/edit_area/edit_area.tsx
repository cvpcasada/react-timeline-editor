import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { type TimelineRow } from "@/interface/action";
import { type CommonProp } from "@/interface/common_prop";
import { type EditData } from "@/interface/timeline";
import { type OnScrollParams } from "@/interface/timeline";
import { prefix } from "@/utils/deal_class_prefix";
import { parserTimeToPixel } from "@/utils/deal_data";
import { DragLines } from "./drag_lines";
import "./edit_area.less";
import { EditRow } from "./edit_row";
import { useDragLine } from "./hooks/use_drag_line";
import mergeRefs from "@/utils/merge_refs";

export type EditAreaProps = CommonProp & {
  /** Timeline height */
  timelineHeight: number;

  /** Scroll distance from left */
  scrollLeft: number;
  /** Scroll distance from top */
  scrollTop: number;
  /** Scroll callback for synchronized scrolling */
  onScroll: (params: OnScrollParams) => void;
  /** Set editor data */
  setEditorData: (params: TimelineRow[]) => void;
  /** Set scroll left */
  deltaScrollLeft?: (scrollLeft: number) => void;
};

export const EditArea = ({
  ref,
  ...props
}: EditAreaProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
  const editAreaRef = useRef<HTMLDivElement>(null);

  const {
    dragLineData,
    initDragLine,
    updateDragLine,
    disposeDragLine,
    defaultGetAssistPosition,
    defaultGetMovePosition,
  } = useDragLine();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef(-1);

  const handleInitDragLine: EditData["onActionMoveStart"] = (data) => {
    if (props.dragLine) {
      const assistActionIds =
        props.getAssistDragLineActionIds &&
        props.getAssistDragLineActionIds({
          action: data.action,
          row: data.row,
          editorData: props.editorData,
        });
      const currentScaleWidth = props.scaleWidth ?? 160;
      const currentScale = props.scale ?? 1;
      const currentStartLeft = props.startLeft ?? 20;
      const currentHideCursor = props.hideCursor ?? false;
      const cursorLeft = parserTimeToPixel(props.cursorTime, {
        scaleWidth: currentScaleWidth,
        scale: currentScale,
        startLeft: currentStartLeft,
      });
      const assistPositions = defaultGetAssistPosition({
        editorData: props.editorData,
        assistActionIds,
        action: data.action,
        row: data.row,
        scale: currentScale,
        scaleWidth: currentScaleWidth,
        startLeft: currentStartLeft,
        hideCursor: currentHideCursor,
        cursorLeft,
      });
      initDragLine({ assistPositions });
    }
  };

  const handleUpdateDragLine: EditData["onActionMoving"] = (data) => {
    if (props.dragLine) {
      const currentScaleWidth = props.scaleWidth ?? 160;
      const currentScale = props.scale ?? 1;
      const currentStartLeft = props.startLeft ?? 20;
      const movePositions = defaultGetMovePosition({
        ...data,
        startLeft: currentStartLeft,
        scaleWidth: currentScaleWidth,
        scale: currentScale,
      });
      updateDragLine({ movePositions });
    }
  };

  // Get total height
  let totalHeight = 0;
  // Height list
  const defaultRowHeight = props.rowHeight ?? 32;
  const heights = props.editorData.map((row) => {
    const itemHeight = row.rowHeight || defaultRowHeight;
    totalHeight += itemHeight;
    return itemHeight;
  });

  if (totalHeight < props.timelineHeight) {
    heights.push(props.timelineHeight - totalHeight);
  }

  const currentScaleWidth = props.scaleWidth ?? 160;
  const currentStartLeft = props.startLeft ?? 20;
  // const currentRowHeight = rowHeight ?? 32;
  const contentWidth = Math.max(
    props.scaleCount * currentScaleWidth + currentStartLeft,
    props.timelineWidth
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: heights.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: (index) => heights[index] ?? defaultRowHeight,
    overscan: 10,
  });

  useLayoutEffect(() => {
    heightRef.current = props.timelineHeight;
    if (heightRef.current !== props.timelineHeight && heightRef.current >= 0) {
      // Defer re-measurement
      rowVirtualizer.measure();
    }
  }, [props.timelineHeight, rowVirtualizer]);

  // Sync external scrollTop and scrollLeft
  useLayoutEffect(() => {
    if (scrollContainerRef.current) {
      if (props.scrollTop !== undefined) {
        scrollContainerRef.current.scrollTop = props.scrollTop;
      }
      if (props.scrollLeft !== undefined) {
        scrollContainerRef.current.scrollLeft = props.scrollLeft;
      }
    }
  }, [props.scrollTop, props.scrollLeft]);

  // Remeasure when editorData changes
  useEffect(() => {
    rowVirtualizer.measure();
  }, [props.editorData, rowVirtualizer]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    props.onScroll({
      clientHeight: el.clientHeight,
      clientWidth: el.clientWidth,
      scrollHeight: el.scrollHeight,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
      scrollWidth: el.scrollWidth,
    });
  };

  return (
    <div ref={mergeRefs(editAreaRef, ref)} className={prefix("edit-area")}>
      <div
        className={prefix("edit-area-virtual")}
        ref={scrollContainerRef}
        style={{
          width: props.timelineWidth,
          height: props.timelineHeight,
          overflow: "auto",
        }}
        onScroll={handleScroll}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: contentWidth,
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = props.editorData[virtualRow.index];
            return (
              <EditRow
                {...props}
                key={virtualRow.key}
                rowData={row}
                dragLineData={dragLineData}
                scrollContainerRef={scrollContainerRef}
                scrollLeft={props.scrollLeft}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: contentWidth,
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  backgroundPositionX: `0, ${props.startLeft ?? 20}px`,
                  backgroundSize: `${props.startLeft ?? 20}px, ${
                    props.scaleWidth ?? 160
                  }px`,
                }}
                onActionMoveStart={(data) => {
                  handleInitDragLine(data);
                  return (
                    props.onActionMoveStart && props.onActionMoveStart(data)
                  );
                }}
                onActionResizeStart={(data) => {
                  handleInitDragLine(data);
                  return (
                    props.onActionResizeStart && props.onActionResizeStart(data)
                  );
                }}
                onActionMoving={(data) => {
                  handleUpdateDragLine(data);
                  return props.onActionMoving && props.onActionMoving(data);
                }}
                onActionResizing={(data) => {
                  handleUpdateDragLine(data);
                  return props.onActionResizing && props.onActionResizing(data);
                }}
                onActionResizeEnd={(data) => {
                  disposeDragLine();
                  return (
                    props.onActionResizeEnd && props.onActionResizeEnd(data)
                  );
                }}
                onActionMoveEnd={(data) => {
                  disposeDragLine();
                  return props.onActionMoveEnd && props.onActionMoveEnd(data);
                }}
              />
            );
          })}
        </div>
      </div>
      {props.dragLine && (
        <DragLines scrollLeft={props.scrollLeft} {...dragLineData} />
      )}
    </div>
  );
};
