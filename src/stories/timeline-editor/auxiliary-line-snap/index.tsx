import { Timeline } from '@/index';

import { useState } from 'react';
import './index.less';
import { mockData, mockEffect } from './mock';

const defaultEditorData = structuredClone(mockData);

interface AuxiliaryLineSnapProps {
  dragLine?: boolean;
}

const AuxiliaryLineSnap = ({ dragLine = true }: AuxiliaryLineSnapProps) => {
  const [data, setData] = useState(defaultEditorData);

  return (
    <div className="timeline-editor-example-auxiliary-line-snap">
      <Timeline scale={5} onChange={setData} editorData={data} effects={mockEffect} dragLine={dragLine} />
    </div>
  );
};

export { AuxiliaryLineSnap };
