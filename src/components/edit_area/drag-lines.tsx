import { type FC } from "react";
import { prefix } from "@/utils/deal-class-prefix";

export interface DragLineData {
  isMoving: boolean;
  movePositions: number[];
  assistPositions: number[];
}

export type DragLineProps = DragLineData;

/** Drag auxiliary lines */
export const DragLines: FC<DragLineProps> = ({
  isMoving,
  movePositions = [],
  assistPositions = [],
}) => {
  return (
    <div className={prefix("drag-line-container")}>
      {isMoving &&
        movePositions
          .filter((item) => assistPositions.includes(item))
          .map((linePos, index) => {
            return (
              <div
                key={index}
                className={prefix("drag-line")}
                style={{ left: linePos }}
              />
            );
          })}
    </div>
  );
};
