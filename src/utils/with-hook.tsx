/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { type ReactNode } from "react";

export interface BaseProps<R> {
  children: (value: R) => ReactNode;
}

export function withHooks<H extends (params: any) => any>(
  hook: H
): React.FC<Parameters<H>[0] & BaseProps<ReturnType<H>>> {
  const Component: React.FC<Parameters<H>[0] & BaseProps<ReturnType<H>>> = ({
    children,
    ...params
  }) => {
    const result = hook(params as Parameters<H>[0]);
    return children(result);
  };

  Component.displayName = `withHooks(${hook.name || "Hook"})`;

  return Component;
}

export default withHooks;
