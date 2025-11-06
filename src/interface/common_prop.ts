import { type EditData } from "@/interface/timeline";

/** Common component parameters */
export interface CommonProp extends EditData {
  /** Number of scales */
  scaleCount: number;
  /** Set the number of scales */
  setScaleCount: (scaleCount: number) => void;
  /** Cursor time */
  cursorTime: number;
  /** Current timeline width */
  timelineWidth: number;
}
