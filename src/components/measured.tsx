/* eslint-disable react-refresh/only-export-components */
import { useState, useLayoutEffect } from "react";
import { resize } from "motion";
import { withHooks } from "./with-hook";

export function useMeasure<T extends HTMLElement>({
  elementRef,
}: {
  elementRef: React.RefObject<T | null>;
}) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!elementRef.current) return;
    resize(elementRef.current, (_el, size) => {
      setSize({ width: size.width, height: size.height });
    });
  }, [elementRef]);

  return size;
}

export const Measured = withHooks(useMeasure);
