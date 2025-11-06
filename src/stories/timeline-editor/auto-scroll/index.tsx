import { Timeline } from '@/index';

import { useState } from 'react';
import './index.less';
import { mockData, mockEffect } from './mock';

const defaultEditorData = structuredClone(mockData);

interface AutoScrollProps {
  autoScroll?: boolean;
}

const AutoScroll = ({ autoScroll = true }: AutoScrollProps) => {
  const [data, setData] = useState(defaultEditorData);

  return (
    <div className="timeline-editor-example3">
      <Timeline onChange={setData} editorData={data} effects={mockEffect} autoScroll={autoScroll} />
    </div>
  );
};

export { AutoScroll };
