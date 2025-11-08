/**
 * Custom gesture event types to replace interactjs types
 * Compatible with both drag and resize interactions
 */

export interface GestureEvent {
  /** The target element */
  target: HTMLElement;

  /** Delta X movement in pixels */
  dx: number;

  /** Delta Y movement in pixels */
  dy: number;

  /** Client X coordinate in viewport */
  clientX: number;

  /** Client Y coordinate in viewport */
  clientY: number;

  /** Edges object for resize events (which edge is being dragged) */
  edges?: {
    left?: boolean;
    right?: boolean;
    top?: boolean;
    bottom?: boolean;
  };

  /** Delta rectangle changes for resize events */
  deltaRect?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
}
