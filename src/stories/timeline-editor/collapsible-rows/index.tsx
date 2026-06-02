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

interface ToggleableRowsPrototypeProps {
  rowHeight?: number;
  collapsedRowHeight?: number;
  timelinePadding?: number;
  scrollbarPadding?: number;
}

const ToggleableRowsPrototype = ({
  rowHeight = 48,
  collapsedRowHeight = 18,
  timelinePadding = 40,
  scrollbarPadding = 14,
}: ToggleableRowsPrototypeProps) => {
  const [data, setData] = useState<TimelineRow[]>(timelineStoryRows);
  const [visibleRowIds, setVisibleRowIds] = useState(() =>
    timelineStoryRows.map((row) => row.id),
  );
  const actionIdRef = useRef(0);

  const visibleRowIdSet = new Set(visibleRowIds);
  const visibleData = data
    .filter((row) => visibleRowIdSet.has(row.id))
    .map((row) => {
      if (row.id === '0' || row.actions.length === 0) {
        return {
          ...row,
          rowHeight,
          collapsed: undefined,
        };
      }

      return {
        ...row,
        rowHeight,
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
    <div className="timeline-editor-example-collapsible-rows timeline-editor-example-toggleable-rows-prototype">
      <div className="toggleable-rows-prototype-toolbar">
        {timelineStoryRows.map((row) => {
          const isVisible = visibleRowIdSet.has(row.id);
          const actionCount = data.find((dataRow) => dataRow.id === row.id)
            ?.actions.length;

          return (
            <label
              key={row.id}
              className="toggleable-rows-prototype-control"
              data-visible={isVisible}
            >
              <input
                checked={isVisible}
                type="checkbox"
                onChange={() => {
                  setVisibleRowIds((currentVisibleRowIds) => {
                    if (currentVisibleRowIds.includes(row.id)) {
                      return currentVisibleRowIds.filter(
                        (visibleRowId) => visibleRowId !== row.id,
                      );
                    }

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

      <MotionProp
        value={timelineHeight}
        render={(animatedTimelineHeight) => (
          <div
            className="toggleable-rows-prototype-timeline-shell"
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
              collapsedRowHeight={collapsedRowHeight}
              getCollapsedRowLabelRender={({ row, height }) => (
                <span
                  className="collapsed-row-label-rail"
                  style={{ maxHeight: height }}
                >
                  {rowLabels[row.id] ?? row.id}
                </span>
              )}
              getEmptyRowRender={({ row, height }) => (
                <div
                  className="toggleable-rows-prototype-empty-row"
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
                    '.toggleable-rows-prototype-timeline-shell',
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

                    const newAction: TimelineAction = {
                      id: `prototype-action-${actionIdRef.current++}`,
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

      <div className="toggleable-rows-prototype-state">
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
export { ToggleableRowsPrototype };
export type { CollapsibleRowsProps, ToggleableRowsPrototypeProps };
