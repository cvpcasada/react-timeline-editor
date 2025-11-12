import { Timeline } from '@/index';

import { useState } from 'react';
import './index.less';
import { mockData, mockEffect } from './mock';

const defaultEditorData = structuredClone(mockData);

interface ScaleCustomizationProps {
  scale?: number;
  scaleSplitCount?: number;
  scaleWidth?: number;
  startLeft?: number;
}

const ScaleCustomization = ({
  scale = 5,
  scaleSplitCount = 10,
  scaleWidth = 160,
  startLeft = 20
}: ScaleCustomizationProps) => {
  const [data, setData] = useState(defaultEditorData);

  return (
    <div className="timeline-editor-example-scale-customization">
      <Timeline onChange={setData} autoScroll={true} editorData={data} effects={mockEffect} scale={scale} startLeft={startLeft} scaleSplitCount={scaleSplitCount} scaleWidth={scaleWidth} />
    </div>
  );
};

const CustomScale = (props: { scale: number }) => {
  const { scale } = props;
  const min = parseInt(scale / 60 + '');
  const second = ((scale % 60) + '').padStart(2, '0');
  return <>{`${min}:${second}`}</>;
};

const CustomScaleStyle = () => {
  const [data, setData] = useState(defaultEditorData);

  return (
    <div className="timeline-editor-example-scale-customization">
      <Timeline onChange={setData} editorData={data} effects={mockEffect} scale={10} scaleSplitCount={10} getScaleRender={(scale) => <CustomScale scale={scale} />} />
    </div>
  );
};

export { ScaleCustomization, CustomScaleStyle };
