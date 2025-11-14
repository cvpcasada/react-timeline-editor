import { useState } from "react";

/**
 * Returns the last stored value when given a new input value
 */
export function usePreviousValue<T>(value: T) {
  const [state, setState] = useState<{ value: T; prev: T | null }>({
    value,
    prev: null,
  });

  if (value !== state.value) {
    setState({
      value,
      prev: state.value,
    });
  }

  return state.prev;
}

/**
 * Returns true if the value has changed since the last render
 */
export function useHasChanged<T>(value: T) {
  let prev = usePreviousValue(value);

  return prev !== null && prev !== value;
}
