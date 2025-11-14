import { type FC } from "react";
import { prefix } from "@/utils/deal-class-prefix";

export interface SnapGuideLineData {
  isMoving: boolean;
  movePositions: number[];
  assistPositions: number[];
}

export type SnapGuideLineProps = SnapGuideLineData;

/** Drag auxiliary lines */
export const SnapGuideLines: FC<SnapGuideLineProps> = ({
  isMoving,
  movePositions = [],
  assistPositions = [],
}) => {
  return (
    <div className={prefix("snap-line-container")}>
      {isMoving &&
        movePositions
          .filter((item) => assistPositions.includes(item))
          .map((linePos, index) => {
            return (
              <div
                key={index}
                className={prefix("snap-line")}
                style={{ left: linePos }}
              />
            );
          })}
    </div>
  );
};
