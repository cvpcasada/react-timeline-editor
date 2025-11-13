import { Timeline, type TimelineEditor, type TimelineState } from "@/index";

import { useRef, useState } from "react";
import "./index.less";
import { mockData, mockEffect } from "./mock";

const defaultEditorData = structuredClone(mockData);

const Basic = (args: Pick<TimelineEditor, 'onCursorDrag' | 'onCursorDragStart' | 'onCursorDragEnd' | 'onClickTimeArea'>) => {
  const [data, setData] = useState(defaultEditorData);

  const ref = useRef<TimelineState>(null);

  return (
    <div className="timeline-editor-example-basic">
      <Timeline
        ref={ref}
        {...args}
        onChange={setData}
        editorData={data}
        effects={mockEffect}
        hideCursor={false}
        autoScroll={true}
      />
    </div>
  );
};

interface BasicCursorDisabledProps {
  disableDrag?: boolean;
}

const BasicCursorDisabled = ({
  disableDrag = false,
}: BasicCursorDisabledProps) => {
  const [data, setData] = useState(defaultEditorData);

  return (
    <div className="timeline-editor-example-basic">
      <Timeline
        onChange={setData}
        editorData={data}
        effects={mockEffect}
        disableDrag={disableDrag}
      />
    </div>
  );
};

interface BasicHideCursorProps {
  hideCursor?: boolean;
}

const BasicHideCursor = ({ hideCursor = true }: BasicHideCursorProps) => {
  const [data, setData] = useState(defaultEditorData);

  return (
    <div className="timeline-editor-example-basic">
      <Timeline
        onChange={setData}
        editorData={data}
        effects={mockEffect}
        hideCursor={hideCursor}
      />
    </div>
  );
};

export { Basic, BasicCursorDisabled, BasicHideCursor };
