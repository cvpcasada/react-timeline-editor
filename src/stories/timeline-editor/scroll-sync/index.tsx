import { Timeline, type TimelineState } from '@/index';

import { useRef, useState } from 'react';
import './index.less';
import { mockData, mockEffect } from './mock';

const defaultEditorData = structuredClone(mockData);

const ScrollSync = () => {
  const [data, setData] = useState(defaultEditorData);
  const domRef = useRef<HTMLDivElement>(null);
  const timelineState = useRef<TimelineState>(null);
  return (
    <div className="timeline-editor-example-scroll-sync">
      <div
        ref={domRef}
        style={{ overflow: 'overlay' }}
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          timelineState.current?.setScrollTop(target.scrollTop);
        }}
        className={'timeline-list'}
      >
        {data.map((item) => {
          return (
            <div className="timeline-list-item" key={item.id}>
              <div className="text">{`row${item.id}`}</div>
            </div>
          );
        })}
      </div>
      <Timeline
        ref={timelineState}
        onChange={setData}
        editorData={data}
        effects={mockEffect}
        onScroll={({ scrollTop }) => {
          if (domRef.current) {
            domRef.current.scrollTop = scrollTop;
          }
        }}
      />
    </div>
  );
};

export { ScrollSync };
