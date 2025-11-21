import { Timeline } from '@/index';

import { useState } from 'react';
import './index.less';
import { mockData, mockEffect } from './mock';

const defaultEditorData = structuredClone(mockData);

interface AutoScrollProps {
  autoScroll?: boolean;
  autoScrollSpeed?: number;
  autoScrollMaxSpeed?: number;
}

const AutoScroll = ({ autoScroll = true, autoScrollSpeed, autoScrollMaxSpeed }: AutoScrollProps) => {
  const [data, setData] = useState(defaultEditorData);

  return (
    <div className="timeline-editor-example-auto-scroll">
      <Timeline
        onChange={setData}
        editorData={data}
        effects={mockEffect}
        autoScroll={autoScroll}
        autoScrollSpeed={autoScrollSpeed}
        autoScrollMaxSpeed={autoScrollMaxSpeed}
      />
    </div>
  );
};

export { AutoScroll };
