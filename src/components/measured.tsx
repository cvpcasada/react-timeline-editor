/* eslint-disable react-refresh/only-export-components */
import { useState, useRef, useLayoutEffect } from "react";
import { resize } from "motion";
import mergeRefs from "@/utils/merge-refs";

export function Measured({
  render,
  ref,
  ...props
}: {
  render: (size: { width: number; height: number }) => React.ReactNode | React.ReactElement;
  ref?: React.Ref<HTMLDivElement>;
} & React.HTMLAttributes<HTMLDivElement>) {
  const elementRef = useRef<HTMLDivElement>(null);
  const size = useMeasure(elementRef);

  return (
    <div ref={mergeRefs(elementRef, ref)} {...props}>
      {render(size)}
    </div>
  );
}

export function useMeasure<T extends HTMLElement>(
  elementRef: React.RefObject<T | null>
) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!elementRef.current) return;
    resize(elementRef.current, (_el, size) => {
      setSize({ width: size.width, height: size.height });
    });
  }, []);

  return size;
}
