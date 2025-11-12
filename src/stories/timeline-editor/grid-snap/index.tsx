import { Timeline } from '@/index';

import { useState } from 'react';
import './index.less';
import { mockData, mockEffect } from './mock';

const defaultEditorData = structuredClone(mockData);

interface GridSnapProps {
  scaleSplitCount?: number;
  gridSnap?: boolean;
}

const GridSnap = ({ scaleSplitCount = 10, gridSnap = true }: GridSnapProps) => {
  const [data, setData] = useState(defaultEditorData);

  return (
    <div className="timeline-editor-example-grid-snap">
      <Timeline
        scale={5}
        onChange={setData}
        editorData={data}
        effects={mockEffect}
        gridSnap={gridSnap}
        scaleSplitCount={scaleSplitCount}
      />
    </div>
  );
};

export { GridSnap };
