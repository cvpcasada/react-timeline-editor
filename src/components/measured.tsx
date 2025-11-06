import { useState, useRef, useLayoutEffect } from 'react';
import { resize } from 'motion';
import mergeRefs from '@/utils/merge_refs';

export function Measured({ render, ref, ...props }: { render: (size: { width: number; height: number }) => React.ReactNode; ref?: React.Ref<HTMLDivElement> } & React.HTMLAttributes<HTMLDivElement>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!elementRef.current) return;
    resize(elementRef.current, (_el, size) => {
      setSize({ width: size.width, height: size.height });
    });
  }, []);

  return (
    <div ref={mergeRefs(elementRef, ref)} {...props}>
      {render(size)}
    </div>
  );
}
