# React Timeline Editor

React Timeline Editor provides a timeline editing model for arranging actions in vertical rows over time.

## Language

**Collapsible Row**:
A timeline row whose vertical size can contract when another row needs focus and expand when it is the active or default row. Its expanded height is the row's normal height, and its actions remain visible and scale to the row's current height, which also defines its interactive area.
_Avoid_: Effect row, lane collapse

**Collapsed Row Label**:
A visual label shown only while a collapsible row is collapsed, used to identify the row without changing row focus, action selection, or editing behavior.
_Avoid_: Track label, row header

**Default Expanded Row**:
The single collapsible row that is expanded when the pointer is outside the timeline's row area. If no row is configured as the default, every collapsible row is collapsed while idle.
_Avoid_: Pinned row, selected row

**Focused Row**:
The single collapsible row that is currently expanded because it is hovered or being edited. Row focus is layout state, does not apply to fixed rows, and does not change action selection.
_Avoid_: Active row, selected row

**Fixed Row**:
A timeline row that does not participate in collapsible row expansion and keeps its configured height, even when the timeline cannot fit all rows without vertical scrolling.
_Avoid_: Uncollapsible row, static row

**Empty Row Placeholder**:
A visual placeholder shown inside a visible timeline row that currently contains no actions, with content and presentation supplied by the timeline client.
_Avoid_: Empty timeline state, empty track placeholder

**Timeline Row**:
A vertical lane in the editor that contains timeline actions.
_Avoid_: Effect, track
