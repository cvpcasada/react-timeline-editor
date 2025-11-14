import * as React from 'react';
import { type TimelineAction, type TimelineRow } from './action';
import { type TimelineEffect } from './effect';
export * from './action';
export * from './effect';

export interface EditData {
  /**
   * @description Timeline editing data
   */
  editorData: TimelineRow[];
  /**
   * @description Timeline action effects map
   */
  effects: Record<string, TimelineEffect>;
  /**
   * @description Single scale mark range (>0)
   * @default 1
   */
  scale?: number;
  /**
   * @description Minimum number of scales (>=1)
   * @default 20
   */
  minScaleCount?: number;
  /**
   * @description Maximum number of scales (>=minScaleCount)
   * @default Infinity
   */
  maxScaleCount?: number;
  /**
   * @description Number of subdivision units per scale (>0 integer)
   * @default 10
   */
  scaleSplitCount?: number;
  /**
   * @description Display width of a single scale (>0, unit: px)
   * @default 160
   */
  scaleWidth?: number;
  /**
   * @description Distance from the left where the scale starts (>=0, unit: px)
   * @default 20
   */
  startLeft?: number;
  /**
   * @description Default height of each editing row (>0, unit: px)
   * @default 32
   */
  rowHeight?: number;
  /**
   * @description Whether to enable grid snap
   * @default false
   */
  gridSnap?: boolean;
  /**
   * @description Enable snap
   * @default false
   */
  snap?: boolean;
  /**
   * @description Whether to hide cursor
   * @default false
   */
  hideCursor?: boolean;
  /**
   * @description Disable dragging in all action areas
   * @default false
   */
  disableDrag?: boolean;
  /**
   * @description Custom action area rendering
   */
  getActionRender?: (action: TimelineAction, row: TimelineRow) => React.ReactNode;
  /**
   * @description Custom scale rendering
   */
  getScaleRender?: (scale: number) => React.ReactNode;
  /**
   * @description Start move callback
   */
  onActionMoveStart?: (params: { action: TimelineAction; row: TimelineRow }) => void;
  /**
   * @description Move callback (return false to prevent movement)
   */
  onActionMoving?: (params: { action: TimelineAction; row: TimelineRow; start: number; end: number }) => void | boolean;
  /**
   * @description Move end callback (return false to prevent onChange trigger)
   */
  onActionMoveEnd?: (params: { action: TimelineAction; row: TimelineRow; start: number; end: number }) => void;
  /**
   * @description Start resize callback
   */
  onActionResizeStart?: (params: { action: TimelineAction; row: TimelineRow; dir: 'right' | 'left' }) => void;
  /**
   * @description Resize callback (return false to prevent resize)
   */
  onActionResizing?: (params: { action: TimelineAction; row: TimelineRow; start: number; end: number; dir: 'right' | 'left' }) => void | boolean;
  /**
   * @description Resize end callback (return false to prevent onChange trigger)
   */
  onActionResizeEnd?: (params: { action: TimelineAction; row: TimelineRow; start: number; end: number; dir: 'right' | 'left' }) => void;
  /**
   * @description Click row callback
   */
  onClickRow?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      row: TimelineRow;
      time: number;
    },
  ) => void;
  /**
   * @description Click action callback
   */
  onClickAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: TimelineAction;
      row: TimelineRow;
      time: number;
    },
  ) => void;
  /**
   * @description Click action callback (not executed when drag is triggered)
   */
  onClickActionOnly?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: TimelineAction;
      row: TimelineRow;
      time: number;
    },
  ) => void;
  /**
   * @description Double click row callback
   */
  onDoubleClickRow?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      row: TimelineRow;
      time: number;
    },
  ) => void;
  /**
   * @description Double click action callback
   */
  onDoubleClickAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: TimelineAction;
      row: TimelineRow;
      time: number;
    },
  ) => void;
  /**
   * @description Right click row callback
   */
  onContextMenuRow?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      row: TimelineRow;
      time: number;
    },
  ) => void;
  /**
   * @description Right click action callback
   */
  onContextMenuAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: TimelineAction;
      row: TimelineRow;
      time: number;
    },
  ) => void;
  /**
   * @description Get the list of action ids to show assist drag lines, calculated at move/resize start, defaults to all actions except the currently moving action
   */
  getAssistDragLineActionIds?: (params: { action: TimelineAction; editorData: TimelineRow[]; row: TimelineRow }) => string[];
  /**
   * @description Cursor drag start event
   */
  onCursorDragStart?: (time: number) => void;
  /**
   * @description Cursor drag end event
   */
  onCursorDragEnd?: (time: number) => void;
  /**
   * @description Cursor drag event
   */
  onCursorDrag?: (time: number) => void;
  /**
   * @description Click time area event, return false to prevent setting time
   */
  onClickTimeArea?: (time: number, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => boolean | undefined;
}

export interface TimelineState {
  /** DOM node */
  target: HTMLElement;
  /** Set current playback time */
  set time(time: number);
  /** Get current playback time */
  get time(): number;
  /** Set scroll left */
  setScrollLeft: (val: number) => void;
  /** Set scroll top */
  setScrollTop: (val: number) => void;
}

/**
 * Animation editor parameters
 * @export
 * @interface TimelineProp
 */
export interface TimelineEditor extends EditData {
  /**
   * @description Editing area scroll callback (used to control synchronization with editing row scrolling)
   */
  onScroll?: (params: EventTarget & HTMLDivElement) => void;
  /**
   * @description Whether to enable auto scroll when dragging
   * @default false
   */
  autoScroll?: boolean;
  /**
   * @description Custom timeline style
   */
  style?: React.CSSProperties;
  /**
   * @description Whether to auto re-render (update tick when data changes or cursor time changes)
   * @default true
   */
  autoReRender?: boolean;
  /**
   * @description Data change callback, triggered after action end changes data (return false to prevent automatic engine synchronization, used to reduce performance overhead)
   */
  onChange?: (editorData: TimelineRow[]) => void | boolean;
}
