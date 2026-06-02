# Toggleable Rows Resize Prototype

Question: should a timeline story hide/show complete rows, size the timeline from the visible row count, and let users add actions into initially empty rows through timeline interactions?

Prototype verdict placeholder: toggle controls drive the visible row ids, the timeline receives only visible rows, rows 1 and 2 start empty, double-clicking a row appends an in-memory action at the clicked time, and the wrapper height is calculated as `visibleRowCount * rowHeight + timelinePadding`.

Delete or absorb this prototype once the row-toggle behavior is accepted.
