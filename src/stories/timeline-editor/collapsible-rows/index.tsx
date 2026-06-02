import { Timeline, type TimelineAction, type TimelineRow } from '@/index';
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
}

const ToggleableRows = ({
  rowHeight = 48,
  collapsedRowHeight = 18,
  timelinePadding = 40,
  scrollbarPadding = 14,
}: ToggleableRowsProps) => {
  const [data, setData] = useState<TimelineRow[]>(timelineStoryRows);
  const [visibleRowIds, setVisibleRowIds] = useState(() =>
    timelineStoryRows.map((row) => row.id),
  );
  const actionIdRef = useRef(0);

  const visibleRowIdSet = new Set(visibleRowIds);

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
         * When collapsible behavior is active, row 1 is the idle expanded row.
         * Hovering or editing another collapsible row still lets the timeline
         * focus that row according to the component's normal row-layout rules.
         */
        collapsed: {
          height: collapsedRowHeight,
          ...(row.id === '1' ? { expandedByDefault: true } : {}),
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
    <div className="timeline-editor-example-collapsible-rows timeline-editor-example-toggleable-rows">
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
            Double-clicking an empty row adds an action and can reactivate
            collapsible mode.
          </li>
        </ul>
      </section>

      <MotionProp
        value={timelineHeight}
        render={(animatedTimelineHeight) => (
          <div
            className="toggleable-rows-timeline-shell"
            onKeyDown={(event) => {
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
                  Double Click to add {rowLabels[row.id] ?? row.id} on cursor
                </div>
              )}
              style={{ height: '100%' }}
              onClickRow={() => {
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
              onDoubleClickRow={(_event, { row, time }) => {
                setData((currentData) =>
                  currentData.map((dataRow) => {
                    if (dataRow.id !== row.id) return dataRow;

                    /*
                     * Adding to an empty row can flip the whole visible timeline
                     * back into collapsible mode on the next render, provided no
                     * other visible row is empty.
                     */
                    const newAction: TimelineAction = {
                      id: `toggleable-row-action-${actionIdRef.current++}`,
                      start: time,
                      end: time + 1,
                      effectId: dataRow.id === '1' ? 'effect1' : 'effect0',
                      flexible: true,
                      movable: true,
                      selected: true,
                    };

                    return {
                      ...dataRow,
                      actions: [
                        ...dataRow.actions.map((action) => ({
                          ...action,
                          selected: false,
                        })),
                        newAction,
                      ],
                    };
                  }),
                );
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
