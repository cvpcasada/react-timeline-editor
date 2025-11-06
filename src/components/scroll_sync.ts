import * as React from 'react';

interface ScrollState {
  clientHeight: number;
  clientWidth: number;
  scrollHeight: number;
  scrollLeft: number;
  scrollTop: number;
  scrollWidth: number;
}

interface ScrollSyncProps {
  children: (state: ScrollState & { onScroll: (state: ScrollState) => void }) => React.ReactElement;
}

export interface ScrollSyncHandle {
  get state(): ScrollState;
  setScrollState: (state: ScrollState | ((prev: ScrollState) => ScrollState)) => void;
  handleScroll: (newState: Partial<ScrollState>) => void;
}

/**
 * HOC that simplifies the process of synchronizing scrolling between two or more virtualized components.
 */
const ScrollSync = React.forwardRef<ScrollSyncHandle, ScrollSyncProps>(({ children }, ref) => {
  const [scrollState, setScrollState] = React.useState<ScrollState>({
    clientHeight: 0,
    clientWidth: 0,
    scrollHeight: 0,
    scrollLeft: 0,
    scrollTop: 0,
    scrollWidth: 0,
  });

  const handleScroll = React.useCallback((newState: Partial<ScrollState>) => {
    setScrollState((props) => ({ ...props, ...newState }));
  }, []);

  React.useImperativeHandle(ref, () => ({
    get state() {
      return scrollState;
    },
    setScrollState,
    handleScroll,
  }));

  return children({
    ...scrollState,
    onScroll: handleScroll,
  });
});

ScrollSync.displayName = 'ScrollSync';

export default ScrollSync;
