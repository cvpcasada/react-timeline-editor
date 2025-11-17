import { Timeline } from '@/index';
import { useEffect, useState } from 'react';
import './index.less';
import { mockData, mockEffect } from './mock';

const defaultEditorData = structuredClone(mockData);

/**
 * This example demonstrates dynamic snap toggling during drag operations.
 * Hold the Shift key to enable snapping while dragging or resizing actions.
 * Release the Shift key to disable snapping.
 */
const ShiftKeySnap = () => {
  const [data, setData] = useState(defaultEditorData);
  const [snapEnabled, setSnapEnabled] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift' && !e.repeat) {
        setSnapEnabled(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setSnapEnabled(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="timeline-editor-example-auxiliary-line-snap">
      <div style={{ marginBottom: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>Snap Mode: {snapEnabled ? '✓ ON' : '✗ OFF'}</strong>
        <div style={{ fontSize: '12px', marginTop: '4px', color: '#666' }}>
          Hold <kbd style={{
            padding: '2px 6px',
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '3px',
            fontFamily: 'monospace'
          }}>Shift</kbd> to enable snap, release to disable
        </div>
      </div>
      <Timeline
        scale={5}
        onChange={setData}
        editorData={data}
        effects={mockEffect}
        snap={snapEnabled}
        cursorSnap={snapEnabled}
      />
    </div>
  );
};

export { ShiftKeySnap };

