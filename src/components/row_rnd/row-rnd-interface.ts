import { type GestureEvent } from "./gesture-types";

// Type aliases for compatibility with existing code
export type DragEvent = GestureEvent;
export type ResizeEvent = GestureEvent;

type EventData = {
  lastLeft: number;
  left: number;
  lastWidth: number;
  width: number;
};

export type RndDragStartCallback = () => void;
export type RndDragCallback = (
  data: EventData,
  scrollDelta?: number
) => boolean | void;
export type RndDragEndCallback = (
  data: Pick<EventData, "left" | "width">
) => void;

export type Direction = "left" | "right";
export type RndResizeStartCallback = (dir: Direction) => void;
export type RndResizeCallback = (
  dir: Direction,
  data: EventData
) => boolean | void;
export type RndResizeEndCallback = (
  dir: Direction,
  data: Pick<EventData, "left" | "width">
) => void;

export interface RowRndApi {
  updateWidth: (size: number) => void;
  updateLeft: (left: number) => void;
  getLeft: () => number;
  getWidth: () => number;
}

export type SnapPosition = {
  value: number;
  rowId?: string;
  actionId?: string;
} | number;

export interface RowRndProps {
  width?: number;
  left?: number;
  grid?: number;
  start?: number;
  getBounds?: () => { left: number; right: number };
  edges?: { left: false | string; right: false | string };

  onResizeStart?: RndResizeStartCallback;
  onResize?: RndResizeCallback;
  onResizeEnd?: RndResizeEndCallback;
  onDragStart?: RndDragStartCallback;
  onDrag?: RndDragCallback;
  onDragEnd?: RndDragEndCallback;
  parentRef?: React.RefObject<HTMLDivElement | null>;

  children?: React.ReactNode;

  enableResizing?: boolean;
  enableDragging?: boolean;
  snapPositions?: SnapPosition[];
  snapDistance?: number;
  snapOrigin?: "left" | "right" | "center" | "leading";
  /**
   * @description Whether to enable auto scroll when dragging/resizing near boundaries
   * @default true
   */
  autoScroll?: boolean;
  autoScrollSpeed?: number;
  autoScrollMaxSpeed?: number;
}
