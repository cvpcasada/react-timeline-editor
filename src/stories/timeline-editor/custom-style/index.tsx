import { Timeline, type TimelineRow } from '@/index';

import { useState } from 'react';
import {
  mockData as basicMockData,
  mockEffect as basicMockEffect,
} from '../basic/mock';
import '../basic/index.less';
import { CustomRender0, CustomRender1 } from './custom';
import './index.less';
import { mockData, mockEffect } from './mock';

const defaultEditorData = structuredClone(mockData);
const defaultBasicEditorData = structuredClone(basicMockData.slice(0, 3)).map(
  (row, index) => {
    return {
      ...row,
      classNames: [`collapsible-row-tone-${index}`],
      rowHeight: 56,
      collapsed:
        index === 0
          ? undefined
          : {
              height: 18,
              ...(index === 1 ? { expandedByDefault: true } : {}),
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
  },
);

const CustomStyle = () => {
  const [data, setData] = useState(defaultEditorData);

  return (
    <div className="timeline-editor-example-custom-style">
      <Timeline
        onChange={setData}
        editorData={data}
        effects={mockEffect}
        hideCursor={false}
        getActionRender={(action, row) => {
          if(action.effectId === 'effect0') {
            return <CustomRender0 action={action} row={row}/>
          } else if (action.effectId === 'effect1') {
            return <CustomRender1 action={action} row={row}/>
          }
        }}
      />
    </div>
  );
};

const CustomStyleBasicTimeline = () => {
  const [data, setData] = useState<TimelineRow[]>(defaultBasicEditorData);

  return (
    <div className="timeline-editor-example-custom-style-basic">
      <Timeline
        onChange={setData}
        editorData={data}
        effects={basicMockEffect}
        hideCursor={false}
        autoScroll={true}
        rowHeight={40}
        collapsedRowHeight={18}
      />
    </div>
  );
};

export { CustomStyle, CustomStyleBasicTimeline };
