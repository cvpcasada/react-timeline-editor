import type { Meta, StoryObj } from "@storybook/react-vite";

import { MoveAndScaleCallbacks } from ".";
import { action } from "storybook/actions";
const meta = {
  title: "Advanced Features/Move & Scale Callbacks",
  component: MoveAndScaleCallbacks,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MoveAndScaleCallbacks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MoveAndScaleCallbacksExample: Story = {
  args: {
    onActionResizing: action("onActionResizing"),
    onActionResizeStart: action("onActionResizeStart"),
    onActionResizeEnd: action("onActionResizeEnd"),
    onActionMoveStart: action("onActionMoveStart"),
    onActionMoveEnd: action("onActionMoveEnd"),
    onActionMoving: action("onActionMoving"),
  },
};
