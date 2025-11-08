import { Timeline, type TimelineAction, type TimelineRow } from "@/index";

import { useState } from "react";
import "./index.less";
import { mockData, mockEffect } from "./mock";
const defaultEditorData = structuredClone(mockData);

interface MoveAndScaleCallbacksProps {
  onActionResizing: (params: {
    action: TimelineAction;
    dir: "right" | "left";
  }) => void;
  onActionResizeStart: (params: {
    action: TimelineAction;
    dir: "right" | "left";
  }) => void;
  onActionResizeEnd: (params: {
    action: TimelineAction;
    dir: "right" | "left";
  }) => void;
  onActionMoveStart: (params: {
    action: TimelineAction;
    row: TimelineRow;
  }) => void;
  onActionMoveEnd: (params: {
    action: TimelineAction;
    row: TimelineRow;
  }) => void;
  onActionMoving: (params: {
    action: TimelineAction;
    row: TimelineRow;
    start: number;
    end: number;
  }) => void;
}

const MoveAndScaleCallbacks = (props: MoveAndScaleCallbacksProps) => {
  const [data, setData] = useState(defaultEditorData);

  return (
    <div className="timeline-editor-example5">
      <Timeline
        onChange={setData}
        editorData={data}
        effects={mockEffect}
        hideCursor={false}
        getActionRender={(action) => {
          if (action.id === "action10") {
            return <div className="prompt">只能拖拽左侧缩放</div>;
          }
        }}
        onActionResizing={props.onActionResizing}
        onActionResizeStart={props.onActionResizeStart}
        onActionResizeEnd={props.onActionResizeEnd}
        onActionMoveStart={props.onActionMoveStart}
        onActionMoveEnd={props.onActionMoveEnd}
        onActionMoving={props.onActionMoving}
      />
    </div>
  );
};

export { MoveAndScaleCallbacks };
