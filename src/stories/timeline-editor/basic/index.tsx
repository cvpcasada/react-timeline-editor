import { Timeline, type TimelineState } from "@/index";

import { useEffect, useRef, useState } from "react";
import "./index.less";
import { mockData, mockEffect } from "./mock";

const defaultEditorData = structuredClone(mockData);

const Basic = () => {
  const [data, setData] = useState(defaultEditorData);

  const ref = useRef<TimelineState>(null);

  return (
    <div className="timeline-editor-example-basic">
      <Timeline
        ref={ref}
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
