import {
  Timeline,
  type TimelineAction,
  type TimelineCursorPreviewRenderParams,
  type TimelineEditor,
  type TimelineState,
} from "@/index";

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

interface BasicTimelineCursorPreviewProps {
  customHead?: boolean;
}

const formatTimelineCursorPreviewHead = (
  params: TimelineCursorPreviewRenderParams
) => {
  const label =
    params.surface === "edit-row" ? `Row ${params.row.id}` : "Time ruler";

  return (
    <span className="timeline-editor-example-basic-cursor-preview-head">
      <span>{params.time.toFixed(1)}s</span>
      <span>{label}</span>
    </span>
  );
};

const BasicTimelineCursorPreview = ({
  customHead = false,
}: BasicTimelineCursorPreviewProps) => {
  const [data, setData] = useState(defaultEditorData);

  return (
    <div className="timeline-editor-example-basic">
      <Timeline
        onChange={setData}
        editorData={data}
        effects={mockEffect}
        showTimelineCursorPreview
        getTimelineCursorPreviewHeadRender={
          customHead ? formatTimelineCursorPreviewHead : undefined
        }
      />
    </div>
  );
};

interface BasicActionPreviewProps {
  resizeToAvailableSpace?: boolean;
  minPreviewDuration?: number;
}

const BasicActionPreview = ({
  resizeToAvailableSpace = true,
  minPreviewDuration = 0.5,
}: BasicActionPreviewProps) => {
  const [data, setData] = useState(defaultEditorData);
  const nextActionId = useRef(1);
  const [actionPreview, setActionPreview] = useState<{
    rowId: string;
    action: TimelineAction;
  } | null>(null);

  return (
    <div
      className="timeline-editor-example-basic"
      onPointerLeave={() => {
        setActionPreview(null);
      }}
    >
      <Timeline
        onChange={setData}
        editorData={data}
        effects={mockEffect}
        actionPreview={actionPreview ?? undefined}
        showTimelineCursorPreview
        onPointerMoveRow={(_event, { row, time }) => {
          const previewStart = Math.max(0, time);
          const previewDuration = 2;
          const sortedActions = [...row.actions].sort(
            (first, second) => first.start - second.start
          );
          const overlappingAction = sortedActions.find(
            (action) => previewStart >= action.start && previewStart < action.end
          );
          if (overlappingAction) {
            setActionPreview(null);
            return;
          }

          const nextAction = sortedActions.find(
            (action) => action.start >= previewStart
          );
          const requestedEnd = previewStart + previewDuration;
          let previewEnd = requestedEnd;

          if (nextAction && requestedEnd > nextAction.start) {
            if (!resizeToAvailableSpace) {
              setActionPreview(null);
              return;
            }
            previewEnd = nextAction.start;
          }

          if (previewEnd - previewStart < minPreviewDuration) {
            setActionPreview(null);
            return;
          }

          setActionPreview({
            rowId: row.id,
            action: {
              id: "action-preview",
              start: previewStart,
              end: previewEnd,
              effectId: "effect0",
            },
          });
        }}
        onClickRow={(_event, { row }) => {
          if (!actionPreview || actionPreview.rowId !== row.id) return;

          const insertedAction = {
            ...actionPreview.action,
            id: `inserted-action-${nextActionId.current++}`,
          };

          setData((currentData) =>
            currentData.map((currentRow) =>
              currentRow.id === row.id
                ? {
                    ...currentRow,
                    actions: [...currentRow.actions, insertedAction],
                  }
                : currentRow
            )
          );
          setActionPreview(null);
        }}
        getActionPreviewRender={({ action }) => (
          <div className="timeline-editor-example-basic-preview">
            {action.start.toFixed(1)}s - {action.end.toFixed(1)}s
          </div>
        )}
      />
    </div>
  );
};

export {
  Basic,
  BasicActionPreview,
  BasicCursorDisabled,
  BasicHideCursor,
  BasicTimelineCursorPreview,
};
