import React, { useEffect, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { type TimelineRow } from '@/interface/action';
import { type CommonProp } from '@/interface/common_prop';
import { type EditData } from '@/interface/timeline';
import { type OnScrollParams } from '@/interface/timeline';
import { prefix } from '@/utils/deal_class_prefix';
import { parserTimeToPixel } from '@/utils/deal_data';
import { DragLines } from './drag_lines';
import './edit_area.less';
import { EditRow } from './edit_row';
import { useDragLine } from './hooks/use_drag_line';
import { Measured } from '@/components/measured';

export type EditAreaProps = CommonProp & {
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

/** Edit area ref data */
export interface EditAreaState {
  domRef: React.RefObject<HTMLDivElement | null>;
}

interface EditAreaContentProps extends EditAreaProps {
  width: number;
  height: number;
  editAreaRef: React.RefObject<HTMLDivElement | null>;
}

const EditAreaContent: React.FC<EditAreaContentProps> = ({
  width,
  height,
  editAreaRef,
  editorData,
  rowHeight,
  scaleWidth,
  scaleCount,
  setScaleCount,
  startLeft,
  scrollLeft,
  scrollTop,
  scale,
  dragLine,
  getAssistDragLineActionIds,
  onActionMoveEnd,
  onActionMoveStart,
  onActionMoving,
  onActionResizeEnd,
  onActionResizeStart,
  onActionResizing,
  onScroll,
  cursorTime,
  hideCursor,
  setEditorData,
  deltaScrollLeft,
  timelineWidth,
  // Pass remaining CommonProp fields
  getActionRender,
  getScaleRender,
  onClickRow,
  onDoubleClickRow,
  onContextMenuRow,
  onClickAction,
  onClickActionOnly,
  onDoubleClickAction,
  onContextMenuAction,
  onCursorDragStart,
  onCursorDragEnd,
  onCursorDrag,
  onClickTimeArea,
  gridSnap,
  effects,
}) => {
  const { dragLineData, initDragLine, updateDragLine, disposeDragLine, defaultGetAssistPosition, defaultGetMovePosition } = useDragLine();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef(-1);

  const handleInitDragLine: EditData['onActionMoveStart'] = (data) => {
    if (dragLine) {
      const assistActionIds =
        getAssistDragLineActionIds &&
        getAssistDragLineActionIds({
          action: data.action,
          row: data.row,
          editorData,
        });
      const currentScaleWidth = scaleWidth ?? 160;
      const currentScale = scale ?? 1;
      const currentStartLeft = startLeft ?? 20;
      const currentHideCursor = hideCursor ?? false;
      const cursorLeft = parserTimeToPixel(cursorTime, { scaleWidth: currentScaleWidth, scale: currentScale, startLeft: currentStartLeft });
      const assistPositions = defaultGetAssistPosition({
        editorData,
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

  const handleUpdateDragLine: EditData['onActionMoving'] = (data) => {
    if (dragLine) {
      const currentScaleWidth = scaleWidth ?? 160;
      const currentScale = scale ?? 1;
      const currentStartLeft = startLeft ?? 20;
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
  const defaultRowHeight = rowHeight ?? 32;
  const heights = editorData.map((row) => {
    const itemHeight = row.rowHeight || defaultRowHeight;
    totalHeight += itemHeight;
    return itemHeight;
  });
  if (totalHeight < height) {
    heights.push(height - totalHeight);
    if (heightRef.current !== height && heightRef.current >= 0) {
      // Defer re-measurement
      setTimeout(() => {
        rowVirtualizer.measure();
      });
    }
  }
  heightRef.current = height;

  const currentScaleWidth = scaleWidth ?? 160;
  const currentStartLeft = startLeft ?? 20;
  // const currentRowHeight = rowHeight ?? 32;
  const contentWidth = Math.max(scaleCount * currentScaleWidth + currentStartLeft, width);

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: heights.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: (index) => heights[index] ?? defaultRowHeight,
    overscan: 10,
  });

  // Sync external scrollTop and scrollLeft
  useLayoutEffect(() => {
    if (scrollContainerRef.current) {
      if (scrollTop !== undefined) {
        scrollContainerRef.current.scrollTop = scrollTop;
      }
      if (scrollLeft !== undefined) {
        scrollContainerRef.current.scrollLeft = scrollLeft;
      }
    }
  }, [scrollTop, scrollLeft]);

  // Remeasure when editorData changes
  useEffect(() => {
    rowVirtualizer.measure();
  }, [editorData, rowVirtualizer]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    onScroll({
      clientHeight: el.clientHeight,
      clientWidth: el.clientWidth,
      scrollHeight: el.scrollHeight,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
      scrollWidth: el.scrollWidth,
    });
  };

  return (
    <>
      <div
        ref={scrollContainerRef}
        style={{ width, height, overflow: 'auto' }}
        onScroll={handleScroll}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: contentWidth,
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = editorData[virtualRow.index];
            return (
              <EditRow
                scaleCount={scaleCount}
                setScaleCount={setScaleCount}
                cursorTime={cursorTime}
                editorData={editorData}
                rowHeight={rowHeight}
                scaleWidth={scaleWidth}
                startLeft={startLeft}
                scale={scale}
                hideCursor={hideCursor}
                timelineWidth={timelineWidth}
                getActionRender={getActionRender}
                getScaleRender={getScaleRender}
                onClickRow={onClickRow}
                onDoubleClickRow={onDoubleClickRow}
                onContextMenuRow={onContextMenuRow}
                onClickAction={onClickAction}
                onClickActionOnly={onClickActionOnly}
                onDoubleClickAction={onDoubleClickAction}
                onContextMenuAction={onContextMenuAction}
                onCursorDragStart={onCursorDragStart}
                onCursorDragEnd={onCursorDragEnd}
                onCursorDrag={onCursorDrag}
                onClickTimeArea={onClickTimeArea}
                gridSnap={gridSnap}
                effects={effects}
                setEditorData={setEditorData}
                deltaScrollLeft={deltaScrollLeft}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: contentWidth,
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  backgroundPositionX: `0, ${startLeft ?? 20}px`,
                  backgroundSize: `${startLeft ?? 20}px, ${scaleWidth ?? 160}px`,
                }}
                areaRef={editAreaRef}
                key={virtualRow.key}
                rowData={row}
                dragLineData={dragLineData}
                onActionMoveStart={(data) => {
                  handleInitDragLine(data);
                  return onActionMoveStart && onActionMoveStart(data);
                }}
                onActionResizeStart={(data) => {
                  handleInitDragLine(data);
                  return onActionResizeStart && onActionResizeStart(data);
                }}
                onActionMoving={(data) => {
                  handleUpdateDragLine(data);
                  return onActionMoving && onActionMoving(data);
                }}
                onActionResizing={(data) => {
                  handleUpdateDragLine(data);
                  return onActionResizing && onActionResizing(data);
                }}
                onActionResizeEnd={(data) => {
                  disposeDragLine();
                  return onActionResizeEnd && onActionResizeEnd(data);
                }}
                onActionMoveEnd={(data) => {
                  disposeDragLine();
                  return onActionMoveEnd && onActionMoveEnd(data);
                }}
                scrollLeft={scrollLeft}
              />
            );
          })}
        </div>
      </div>
      {dragLine && <DragLines scrollLeft={scrollLeft} {...dragLineData} />}
    </>
  );
};

export const EditArea = React.forwardRef<EditAreaState, EditAreaProps>((props, ref) => {
  const editAreaRef = useRef<HTMLDivElement>(null);

  // Ref data
  useImperativeHandle(ref, () => ({
    get domRef() {
      return editAreaRef;
    },
  }));

  return (
    <Measured
      ref={editAreaRef}
      className={prefix('edit-area')}
      render={({ width, height }) => (
        <EditAreaContent
          {...props}
          width={width}
          height={height}
          editAreaRef={editAreaRef}
        />
      )}
    />
  );
});
