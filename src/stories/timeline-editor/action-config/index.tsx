import { Timeline } from '@/index';

import { type FC, useState } from 'react';
import { CustomRender0, CustomRender1, CustomRender2 } from './custom';
import './index.less';
import { mockData, mockEffect } from './mock';
import { mockData as mockData2, mockEffect as mockEffect2 } from './mock2';

const defaultEditorData1 = structuredClone(mockData);

export const ActionMovableFlexible: FC = () => {
  const [data, setData] = useState(defaultEditorData1);

  return (
    <div className="timeline-editor-example8">
      <Timeline
        onChange={setData}
        editorData={data}
        effects={mockEffect}
        hideCursor={false}
        getActionRender={(action, row) => {
          if (action.effectId === 'effect0') {
            return <CustomRender0 action={action} row={row} />;
          } else if (action.effectId === 'effect1') {
            return <CustomRender1 action={action} row={row} />;
          }
        }}
      />
    </div>
  );
};

const defaultEditorData2 = structuredClone(mockData2);

export const ActionMinStartMaxEnd: React.FC = () => {
  const [data, setData] = useState(defaultEditorData2);

  return (
    <div className="timeline-editor-example8">
      <Timeline
        onChange={setData}
        editorData={data}
        effects={mockEffect2}
        hideCursor={false}
        getActionRender={(action, row) => {
          return <CustomRender2 action={action} row={row} />;
        }}
      />
    </div>
  );
};
