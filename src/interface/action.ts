/**
 * Basic parameters of action
 * @export
 * @interface TimelineAction
 */
export interface TimelineAction {
  /** Action id */
  id: string;
  /** Action start time */
  start: number;
  /** Action end time */
  end: number;
  /** Effect ID corresponding to the action */
  effectId: string;

  /** Whether the action is selected */
  selected?: boolean;
  /** Whether the action is resizable */
  flexible?: boolean;
  /** Whether the action is movable */
  movable?: boolean;
  /** Whether the action is disabled */
  disable?: boolean;

  /** Minimum start time limit for the action */
  minStart?: number;
  /** Maximum end time limit for the action */
  maxEnd?: number;
}

/**
 * Basic parameters of action row
 * @export
 * @interface TimelineRow
 */
export interface TimelineRow {
  /** Action row id */
  id: string;
  /** List of actions in the row */
  actions: TimelineAction[];
  /** Custom row height */
  rowHeight?: number;
  /** Whether the row is selected */
  selected?: boolean;
  /** Extended class names of the row */
  classNames?: string[];
}
