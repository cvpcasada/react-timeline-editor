import {
  Timeline,
  type TimelineAction,
  type TimelineCursorPreviewRenderParams,
  type TimelineRow,
} from '@/index';
import { useRef, useState } from 'react';

import '../basic/index.less';
import {
  mockData as basicMockData,
  mockEffect as basicMockEffect,
} from '../basic/mock';
import { MotionProp } from '../playback-demo/motion-prop';
import './index.less';

type DefaultExpandedRow = 'none' | 'second' | 'third';

const timelineStoryRows = structuredClone(basicMockData.slice(0, 3)).map(
  (row, index) => ({
    ...row,
    classNames: [`collapsible-row-tone-${index}`],
    actions:
      index === 0
        ? row.actions.map((action) => ({
            ...action,
            flexible: true,
            movable: true,
          }))
        : [],
  }),
);

const rowLabels: Record<string, string> = {
  '0': 'Primary video',
  '1': 'Voiceover and sound design',
  '2': 'Layouts and screen states',
};

const hasActionIntersection = (
  row: TimelineRow,
  interval: Pick<TimelineAction, 'start' | 'end'>,
  ignoredActionId?: string,
) =>
  row.actions.some(
    (action) =>
      action.id !== ignoredActionId &&
      interval.start < action.end &&
      interval.end > action.start,
  );

const formatTimelinePreviewTime = (time: number) => {
  const totalMilliseconds = Math.max(0, Math.round(time * 1000));
  const minutes = Math.floor(totalMilliseconds / 60_000);
  const seconds = Math.floor((totalMilliseconds % 60_000) / 1000);
  const milliseconds = totalMilliseconds % 1000;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0',
  )}.${String(milliseconds).padStart(3, '0')}`;
};

const renderToggleableRowsCursorPreviewHead = (
  params: TimelineCursorPreviewRenderParams,
) => (
  <span className="toggleable-rows-cursor-preview-head">
    {formatTimelinePreviewTime(params.time)}
  </span>
);

interface CollapsibleRowsProps {
  rowHeight?: number;
  expandedRowHeight?: number;
  collapsedRowHeight?: number;
  defaultExpandedRow?: DefaultExpandedRow;
  showCollapsedRowLabels?: boolean;
}

const CollapsibleRows = ({
  rowHeight = 40,
  expandedRowHeight = 56,
  collapsedRowHeight = 18,
  defaultExpandedRow = 'second',
  showCollapsedRowLabels = false,
}: CollapsibleRowsProps) => {
  const [data, setData] = useState<TimelineRow[]>(
    structuredClone(basicMockData.slice(0, 3)).map((row, index) => {
      return {
        ...row,
        classNames: [`collapsible-row-tone-${index}`],
        ...(index === 0 ? {} : { rowHeight: expandedRowHeight }),
        collapsed:
          index === 0
            ? undefined
            : {
                height: collapsedRowHeight,
                ...(defaultExpandedRow === 'second' && index === 1
                  ? { expandedByDefault: true }
                  : {}),
                ...(defaultExpandedRow === 'third' && index === 2
                  ? { expandedByDefault: true }
                  : {}),
              },
        actions:
          index === 2
            ? row.actions.map((action) => ({
                ...action,
                flexible: true,
                movable: true,
              }))
            : row.actions,
      };
    }),
  );

  return (
    <div className="timeline-editor-example-collapsible-rows">
      <Timeline
        onChange={setData}
        editorData={data}
        effects={basicMockEffect}
        hideCursor={false}
        autoScroll={true}
        rowHeight={rowHeight}
        getCollapsedRowLabelRender={
          showCollapsedRowLabels
            ? ({ row, height }) => (
                <span
                  className="collapsed-row-label-rail"
                  style={{ maxHeight: height }}
                >
                  {rowLabels[row.id] ?? row.id}
                </span>
              )
            : undefined
        }
      />
    </div>
  );
};

interface ToggleableRowsProps {
  rowHeight?: number;
  collapsedRowHeight?: number;
  timelinePadding?: number;
  scrollbarPadding?: number;
  minActionPreviewDuration?: number;
  maxActionPreviewDuration?: number;
}

const ToggleableRows = ({
  rowHeight = 48,
  collapsedRowHeight = 18,
  timelinePadding = 40,
  scrollbarPadding = 14,
  minActionPreviewDuration = 0.35,
  maxActionPreviewDuration = 1,
}: ToggleableRowsProps) => {
  const [data, setData] = useState<TimelineRow[]>(timelineStoryRows);
  const [visibleRowIds, setVisibleRowIds] = useState(() =>
    timelineStoryRows.map((row) => row.id),
  );
  const [actionPreview, setActionPreview] = useState<{
    rowId: string;
    action: TimelineAction;
  } | null>(null);
  const actionIdRef = useRef(0);
  const isActionGestureActive = useRef(false);

  const visibleRowIdSet = new Set(visibleRowIds);
  const selectedActionRowId =
    data.find(
      (row) =>
        visibleRowIdSet.has(row.id) &&
        row.id !== '0' &&
        row.actions.some((action) => action.selected),
    )?.id ?? null;

  /*
   * This story intentionally demonstrates three states with one data model:
   *
   * 1. Hidden rows stay in `data` so toggling them back on preserves edits.
   * 2. Empty visible rows render the empty-row affordance at full row height.
   * 3. Collapsible behavior is only enabled when every visible row has actions.
   *
   * That last rule avoids mixing collapsed rows with empty placeholders. Once a
   * user double-clicks an empty row and every visible row has at least one
   * action, rows 1 and 2 become collapsible again.
   */
  const hasCollapsibleVisibleRows =
    visibleRowIds.length > 2 &&
    data
      .filter((row) => visibleRowIdSet.has(row.id))
      .every((row) => row.actions.length > 0);
  const visibleData = data
    .filter((row) => visibleRowIdSet.has(row.id))
    .map((row) => {
      if (!hasCollapsibleVisibleRows || row.id === '0') {
        /*
         * Row 0 is the fixed anchor row. The remaining rows are also kept fixed
         * while the visible set contains any empty row, because the story should
         * show either full-height empty rows or collapsible rows, not both.
         */
        return {
          ...row,
          rowHeight,
          collapsed: undefined,
        };
      }

      return {
        ...row,
        rowHeight,
        /*
         * When collapsible behavior is active, a selected action keeps its row
         * expanded. Row 1 is only the idle fallback. Hovering or editing another
         * collapsible row still lets the timeline focus that row according to
         * the component's normal row-layout rules.
         */
        collapsed: {
          height: collapsedRowHeight,
          ...(row.id === (selectedActionRowId ?? '1')
            ? { expandedByDefault: true }
            : {}),
        },
      };
    });
  const timelineRowsHeight = visibleData.reduce((height, row) => {
    if (!row.collapsed) return height + rowHeight;
    return height + (row.collapsed.expandedByDefault ? rowHeight : collapsedRowHeight);
  }, 0);
  const timelineHeight =
    visibleData.length > 0
      ? timelineRowsHeight + timelinePadding + scrollbarPadding
      : 96;

  return (
    <div
      className="timeline-editor-example-collapsible-rows timeline-editor-example-toggleable-rows"
      onPointerLeave={() => {
        setActionPreview(null);
      }}
    >
      <div className="toggleable-rows-toolbar">
        {timelineStoryRows.map((row) => {
          const isVisible = visibleRowIdSet.has(row.id);
          const actionCount = data.find((dataRow) => dataRow.id === row.id)
            ?.actions.length;

          return (
            <label
              key={row.id}
              className="toggleable-rows-control"
              data-visible={isVisible}
            >
              <input
                checked={isVisible}
                type="checkbox"
                onChange={() => {
                  setVisibleRowIds((currentVisibleRowIds) => {
                    if (currentVisibleRowIds.includes(row.id)) {
                      /*
                       * Hiding a row removes it from the rendered timeline only.
                       * Actions, selection state, and later edits remain in
                       * `data`, so restoring visibility brings the row back as
                       * it was.
                       */
                      return currentVisibleRowIds.filter(
                        (visibleRowId) => visibleRowId !== row.id,
                      );
                    }

                    /*
                     * Restoring a row follows the canonical story order instead
                     * of appending, so row positions and default-expanded row
                     * behavior stay deterministic across toggle sequences.
                     */
                    return timelineStoryRows
                      .map((storyRow) => storyRow.id)
                      .filter(
                        (storyRowId) =>
                          storyRowId === row.id ||
                          currentVisibleRowIds.includes(storyRowId),
                      );
                  });
                }}
              />
              {rowLabels[row.id] ?? row.id} ({actionCount ?? 0})
            </label>
          );
        })}
      </div>

      <section className="toggleable-rows-notes" aria-label="Story behavior notes">
        <div className="toggleable-rows-note-status">
          Collapsible mode:{' '}
          <strong>{hasCollapsibleVisibleRows ? 'active' : 'inactive'}</strong>
        </div>
        <ul>
          <li>Hidden rows keep their actions and selection state.</li>
          <li>Visible empty rows stay full height and show the empty-row prompt.</li>
          <li>
            Rows only collapse when every visible row has at least one action.
          </li>
          <li>
            Row 0 stays fixed; rows 1 and 2 collapse, with row 1 expanded while
            idle.
          </li>
          <li>
            Clicking an action preview adds it and can reactivate collapsible
            mode.
          </li>
          <li>Actions cannot be inserted, moved, or resized over another action.</li>
        </ul>
      </section>

      <MotionProp
        value={timelineHeight}
        render={(animatedTimelineHeight) => (
          <div
            className="toggleable-rows-timeline-shell"
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setActionPreview(null);
                setData((currentData) =>
                  currentData.map((row) => ({
                    ...row,
                    actions: row.actions.map((action) => ({
                      ...action,
                      selected: false,
                    })),
                  })),
                );
                return;
              }

              if (event.key !== 'Delete' && event.key !== 'Backspace') return;

              setData((currentData) =>
                currentData.map((row) => ({
                  ...row,
                  actions: row.actions.filter((action) => !action.selected),
                })),
              );
            }}
            style={{ height: animatedTimelineHeight }}
            tabIndex={0}
          >
            <Timeline
              onChange={(nextVisibleData) => {
                setData((currentData) =>
                  currentData.map((row) => {
                    return (
                      nextVisibleData.find((nextRow) => nextRow.id === row.id) ?? row
                    );
                  }),
                );
              }}
              editorData={visibleData}
              effects={basicMockEffect}
              actionPreview={actionPreview ?? undefined}
              showTimelineCursorPreview
              getTimelineCursorPreviewHeadRender={
                renderToggleableRowsCursorPreviewHead
              }
              hideCursor={false}
              autoScroll={true}
              rowHeight={rowHeight}
              collapsedRowHeight={
                hasCollapsibleVisibleRows ? collapsedRowHeight : undefined
              }
              /*
               * The story passes the collapsible timeline props only while rows
               * actually have row-level `collapsed` config. This keeps the demo
               * aligned with the visible state instead of implying collapsed
               * labels are available for empty-row-only layouts.
               */
              getCollapsedRowLabelRender={
                hasCollapsibleVisibleRows
                  ? ({ row, height }) => (
                      <span
                        className="collapsed-row-label-rail"
                        style={{ maxHeight: height }}
                      >
                        {rowLabels[row.id] ?? row.id}
                      </span>
                    )
                  : undefined
              }
              getEmptyRowRender={({ row, height }) => (
                <div
                  className="toggleable-rows-empty-row"
                  style={{ height }}
                >
                  Move over the row to preview {rowLabels[row.id] ?? row.id}
                </div>
              )}
              getActionPreviewRender={({ action }) => (
                <div className="toggleable-rows-action-preview">
                  {action.start.toFixed(1)}s - {action.end.toFixed(1)}s
                </div>
              )}
              style={{ height: '100%' }}
              onActionMoveStart={() => {
                isActionGestureActive.current = true;
                setActionPreview(null);
              }}
              onActionMoveEnd={() => {
                isActionGestureActive.current = false;
              }}
              onActionResizeStart={() => {
                isActionGestureActive.current = true;
                setActionPreview(null);
              }}
              onActionResizeEnd={() => {
                isActionGestureActive.current = false;
              }}
              onActionMoving={({ action, row, start, end }) => {
                const currentRow = data.find((dataRow) => dataRow.id === row.id);
                if (!currentRow) return false;

                return !hasActionIntersection(
                  currentRow,
                  { start, end },
                  action.id,
                );
              }}
              onActionResizing={({ action, row, start, end }) => {
                const currentRow = data.find((dataRow) => dataRow.id === row.id);
                if (!currentRow) return false;

                return !hasActionIntersection(
                  currentRow,
                  { start, end },
                  action.id,
                );
              }}
              onPointerMoveRow={(_event, { row, time }) => {
                if (isActionGestureActive.current) {
                  setActionPreview(null);
                  return;
                }

                const cursorTime = Math.max(0, time);
                const sortedActions = [...row.actions].sort(
                  (first, second) => first.start - second.start,
                );
                const actionAtPreviewStart = sortedActions.find(
                  (action) =>
                    cursorTime >= action.start && cursorTime < action.end,
                );
                if (actionAtPreviewStart) {
                  setActionPreview(null);
                  return;
                }

                const previousAction = sortedActions.findLast(
                  (action) => action.end <= cursorTime,
                );
                const nextAction = sortedActions.find(
                  (action) => action.start >= cursorTime,
                );
                const gapStart = previousAction?.end ?? 0;
                const gapEnd =
                  nextAction?.start ?? cursorTime + maxActionPreviewDuration;
                const gapDuration = gapEnd - gapStart;
                const previewMinDuration = Math.min(
                  minActionPreviewDuration,
                  maxActionPreviewDuration,
                );

                if (gapDuration < previewMinDuration) {
                  setActionPreview(null);
                  return;
                }

                const remainingGapDuration = gapEnd - cursorTime;
                const previewDuration =
                  remainingGapDuration >= previewMinDuration
                    ? Math.min(maxActionPreviewDuration, remainingGapDuration)
                    : previewMinDuration;
                let previewStart = cursorTime;
                let previewEnd = previewStart + previewDuration;

                if (previewEnd > gapEnd) {
                  previewEnd = gapEnd;
                  previewStart = previewEnd - previewDuration;
                }
                if (previewStart < gapStart) {
                  previewStart = gapStart;
                  previewEnd = previewStart + previewDuration;
                }

                if (
                  hasActionIntersection(row, {
                    start: previewStart,
                    end: previewEnd,
                  })
                ) {
                  setActionPreview(null);
                  return;
                }

                setActionPreview({
                  rowId: row.id,
                  action: {
                    id: 'toggleable-row-action-preview',
                    start: previewStart,
                    end: previewEnd,
                    effectId: row.id === '1' ? 'effect1' : 'effect0',
                    flexible: true,
                    movable: true,
                  },
                });
              }}
              onClickRow={(_event, { row }) => {
                if (isActionGestureActive.current) {
                  setActionPreview(null);
                  return;
                }

                if (actionPreview && actionPreview.rowId === row.id) {
                  const currentRow = data.find(
                    (dataRow) => dataRow.id === row.id,
                  );
                  if (
                    !currentRow ||
                    hasActionIntersection(currentRow, actionPreview.action)
                  ) {
                    setActionPreview(null);
                    return;
                  }

                  const insertedAction: TimelineAction = {
                    ...actionPreview.action,
                    id: `toggleable-row-action-${actionIdRef.current++}`,
                    selected: true,
                  };

                  setData((currentData) =>
                    currentData.map((dataRow) => ({
                      ...dataRow,
                      actions:
                        dataRow.id === row.id
                          ? [
                              ...dataRow.actions.map((action) => ({
                                ...action,
                                selected: false,
                              })),
                              insertedAction,
                            ]
                          : dataRow.actions.map((action) => ({
                              ...action,
                              selected: false,
                            })),
                    })),
                  );
                  setActionPreview(null);
                  return;
                }

                setData((currentData) =>
                  currentData.map((row) => ({
                    ...row,
                    actions: row.actions.map((action) => ({
                      ...action,
                      selected: false,
                    })),
                  })),
                );
              }}
              onClickActionOnly={(event, { action }) => {
                event.stopPropagation();
                event.currentTarget
                  .closest<HTMLElement>(
                    '.toggleable-rows-timeline-shell',
                  )
                  ?.focus();
                setData((currentData) =>
                  currentData.map((row) => ({
                    ...row,
                    actions: row.actions.map((rowAction) => ({
                      ...rowAction,
                      selected: rowAction.id === action.id,
                    })),
                  })),
                );
              }}
              onDoubleClickAction={(event) => {
                event.stopPropagation();
              }}
              onDoubleClickRow={(event) => {
                event.stopPropagation();
              }}
            />
          </div>
        )}
      />

      <div className="toggleable-rows-state">
        Visible rows: {visibleRowIds.join(', ') || 'none'} | height:{' '}
        {timelineHeight}px | actions:{' '}
        {data
          .map((row) => `${row.id}:${row.actions.length}`)
          .join(', ')}
      </div>
    </div>
  );
};

export { CollapsibleRows };
export { ToggleableRows };
export type { CollapsibleRowsProps, ToggleableRowsProps };
