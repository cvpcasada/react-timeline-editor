# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`@cyca/react-timeline-editor` is a React 19 component library for building timeline / animation / video-editor UIs. It is a fork of `@xzdarcy/react-timeline-editor` that swaps the original dependencies for modern equivalents:

- `react-virtualized` → `@tanstack/react-virtual`
- `interact.js` → `@use-gesture/vanilla`
- Build is via `vite` with `babel-plugin-react-compiler` enabled (the React Compiler runs on this code; do not hand-write memoization that the compiler is meant to produce).
- The original `Runner` (playback engine) was removed — this library renders/edits a timeline but does not drive playback.

The package ships as ESM + CJS plus a single rolled-up `.d.ts`. Entry: `src/index.tsx`. External peer deps: `react`, `react-dom` (>=18). Path alias: `@/*` → `src/*`.

## Commands

Package manager: **pnpm** (see `pnpm-lock.yaml`).

- `pnpm build` — Vite library build → `dist/` (ES + CJS + bundled `.d.ts`).
- `pnpm typecheck` — `tsc --noEmit`.
- `pnpm lint` / `pnpm lint:fix` — ESLint over `.ts`/`.tsx`.
- `pnpm lint:package` — runs `@arethetypeswrong/cli -P` against the published package shape.
- `pnpm storybook` — Storybook dev server on port 6006. Stories under `src/stories/timeline-editor/*` are the primary way to exercise the component manually; there is no test runner in this repo.
- `pnpm build-storybook` — static Storybook build.

Run a single story: launch `pnpm storybook` and navigate to it; story files are `*.stories.tsx`.

## Architecture

The public surface is one component, `<Timeline>` (`src/components/timeline.tsx`), plus four type exports from `src/index.tsx`. Everything else is internal.

### Data model (`src/interface/`)

- `TimelineRow` — a horizontal track containing `TimelineAction[]`.
- `TimelineAction` — a draggable/resizable block on a row, defined by `start`/`end` (in **time units**, not pixels) and an `effectId`.
- `TimelineEffect` — keyed by id in the `effects` prop; supplies optional `start`/`enter`/`update`/`leave`/`stop` callbacks. The library invokes these but does **not** run a playback loop itself (Runner was removed). Consumers drive `time` via `ref.time = …` and decide when to fire effects.
- `EditData` — the prop shape for `<Timeline>`. `TimelineEditor` extends it with scroll/style/onChange.
- `TimelineState` — the imperative handle exposed via `forwardRef`: `target`, `time` getter/setter, `setScrollLeft`, `setScrollTop`.

### Component tree

`<Timeline>` composes three siblings under a `<ScrollSync>` render-prop:

1. **`TimeArea`** (`src/components/time_area/`) — the ruler at the top. Click/drag here moves the cursor.
2. **`EditArea`** (`src/components/edit_area/`) — the scrollable rows region. Uses `@tanstack/react-virtual` (`useVirtualizer`) to virtualize rows. Each row renders an `EditRow` containing `EditAction`s wrapped in `RowDnd`. Drag-line snapping logic lives in `hooks/use_drag_line.ts` and renders via `DragLines`.
3. **`Cursor`** (`src/components/cursor/`) — the playhead. Hidden when `hideCursor` is set.

`ScrollSync` (`src/components/scroll_sync.ts`) is a tiny render-prop ref-handle store that keeps the three siblings' scroll positions in sync; the imperative `setScrollState` is also how the `<Timeline>` ref handle implements `setScrollLeft`/`setScrollTop`.

`useMeasure`/`Measured` (`src/components/measured.tsx`) wraps `motion`'s `resize` to expose container width/height to the children.

### Drag/resize layer (`src/components/row_rnd/`)

`RowDnd` (`row_rnd.tsx`) is the generic draggable+resizable wrapper used for action blocks. It does not call `interact.js` — it uses `@use-gesture/vanilla`'s `DragGesture` through the `InteractComp` wrapper (`interactable.tsx`), which exposes an `InteractableWrapper` shim with the same `{ target, unset() }` shape the original code expected. When porting behavior, keep that shim in mind: callsites still talk in interact.js-flavored types (`Direction`, `RndDragCallback`, etc. in `row_rnd_interface.ts`).

`useAutoScroll` (`hooks/useAutoScroll.ts`) drives edge-of-viewport auto-scrolling during a drag/resize and is wired up only when the `<Timeline autoScroll>` prop is set (Timeline forwards `deltaScrollLeft` accordingly).

### Coordinate conversion

All time↔pixel conversion is centralized in `src/utils/deal_data.ts` (`parserTimeToPixel`, `parserPixelToTime`, `parserTimeToTransform`, `parserTransformToTime`, `getScaleCountByRows`, `getScaleCountByPixel`, `parserActionsToPositions`). Anything that mixes time and pixels should go through these — the formula uses `startLeft + (time / scale) * scaleWidth`.

### Styling

LESS files colocated next to components (`*.less`), using a single class prefix `timeline-editor-` (constant `PREFIX` in `src/interface/const.ts`). The `prefix(...)` helper in `src/utils/deal_class_prefix.ts` wraps `framework-utils.prefixNames` to apply it. The built CSS is shipped at `./react-timeline-editor.css` in the package.

### Prop validation

`src/utils/check_props.ts` (`checkProps`) normalizes/clamps `<Timeline>` props at every render and logs via `@cyca/log`. `<Timeline>` calls it once and forwards the cleaned object as `...checkedProps` to all three children, so don't re-default the same props inside subcomponents.

## Conventions worth knowing

- **TypeScript strict mode** with `verbatimModuleSyntax` and `erasableSyntaxOnly`: use `import type { … }` (or inline `type` keywords) consistently — the codebase already does. `noUncheckedIndexedAccess` is on.
- **React Compiler is enabled** via Babel. Avoid adding `useMemo`/`useCallback`/`React.memo` unless you can demonstrate the compiler isn't handling it — let the compiler do its job.
- ESLint disables `prefer-const` and `@typescript-eslint/no-unused-expressions`; `let` reassignment patterns (e.g. in `checkProps`) are intentional.
- The `.tsx` source uses some Chinese comments (legacy from the original fork) — preserve them when editing surrounding code unless the user asks to translate.
