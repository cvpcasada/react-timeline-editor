import { Timeline } from '@/index';

import { useState } from 'react';
import './index.less';
import { mockData, mockEffect } from './mock';

const defaultEditorData = structuredClone(mockData);

interface AuxiliaryLineSnapProps {
  snap?: boolean;
}

const AuxiliaryLineSnap = ({ snap = true }: AuxiliaryLineSnapProps) => {
  const [data, setData] = useState(defaultEditorData);

  return (
    <div className="timeline-editor-example-auxiliary-line-snap">
      <Timeline scale={5} onChange={setData} editorData={data} effects={mockEffect} snap={snap} />
    </div>
  );
};

export { AuxiliaryLineSnap };
