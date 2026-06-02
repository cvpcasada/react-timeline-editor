import { Timeline, type TimelineRow } from '@/index';
import { useState } from 'react';

import '../basic/index.less';
import {
  mockData as basicMockData,
  mockEffect as basicMockEffect,
} from '../basic/mock';
import './index.less';

type DefaultExpandedRow = 'none' | 'second' | 'third';

interface CollapsibleRowsProps {
  rowHeight?: number;
  expandedRowHeight?: number;
  collapsedRowHeight?: number;
  defaultExpandedRow?: DefaultExpandedRow;
}

const CollapsibleRows = ({
  rowHeight = 40,
  expandedRowHeight = 56,
  collapsedRowHeight = 18,
  defaultExpandedRow = 'second',
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
      />
    </div>
  );
};

export { CollapsibleRows };
export type { CollapsibleRowsProps };
