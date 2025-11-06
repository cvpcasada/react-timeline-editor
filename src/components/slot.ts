import React from 'react';
import { mergeRefs } from '@/utils/merge_refs';
interface SlotProps<T = HTMLElement> {
  children: React.ReactElement;
  ref?: React.Ref<T>;
  [key: string]: unknown;
}

const slot = <T extends HTMLElement = HTMLElement>({ children, ...props }: SlotProps<T>) => {
  const child = React.Children.only(children);
  const childRef = getElementRef<T>(child);
  const childProps = (child.props || {}) as Record<string, unknown>;
  const childStyle = (childProps.style || {}) as React.CSSProperties;
  const mergedProps: Record<string, unknown> = {
    ...(props as Record<string, unknown>),
    ...childProps, // child's own props take precedence
    style: {
      ...(props.style ?? {}),
      ...childStyle,
    },
    ref: mergeRefs(childRef, props.ref),
  };
  return React.cloneElement(child, mergedProps as (Partial<unknown> & React.Attributes) | undefined);
};

export { slot };

// Before React 19 accessing `element.props.ref` will throw a warning and suggest using `element.ref`
// After React 19 accessing `element.ref` does the opposite.
// https://github.com/facebook/react/pull/28348
//
// Access the ref using the method that doesn't yield a warning.
function getElementRef<T>(element: React.ReactElement): React.Ref<T> | React.RefObject<T> | undefined {
  // React <=18 in DEV

  // React 19 in DEV
  let getter = Object.getOwnPropertyDescriptor(element, 'ref')?.get;
  let mayWarn = getter && 'isReactWarning' in getter && getter.isReactWarning;
  if (mayWarn) {
    return (element.props as { ref?: React.Ref<T> }).ref;
  }

  // Not DEV
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (element.props as { ref?: React.Ref<T> }).ref || (element as any).ref;
}
