import type { Meta, StoryObj } from "@storybook/react-vite";

import { Basic, BasicCursorDisabled, BasicHideCursor } from ".";
import { action } from "storybook/actions";

const meta = {
  title: "Basic Features/Basic",
  component: Basic,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Basic>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicExample: Story = {
  args: {
    onCursorDrag: (...args) => {
      action("onCursorDrag")(...args);
      console.log("onCursorDrag", args);
    },
    onClickTimeArea: (...args) => {
      action("onClickTimeArea")(...args);
      console.log("onClickTimeArea", args);
    },
    onCursorDragStart: action("onCursorDragStart"),
    onCursorDragEnd: action("onCursorDragEnd"),
  },
};

export const BasicDisableDragAction: StoryObj<typeof BasicCursorDisabled> = {
  render: (args) => <BasicCursorDisabled {...args} />,
  argTypes: {
    disableDrag: {
      control: { type: "boolean" },
      description: "Disable dragging of timeline actions",
    },
  },
  args: {
    disableDrag: false,
  },
};

export const BasicHideTimelineCursor: StoryObj<typeof BasicHideCursor> = {
  render: (args) => <BasicHideCursor {...args} />,
  argTypes: {
    hideCursor: {
      control: { type: "boolean" },
      description: "Hide the cursor in the timeline",
    },
  },
  args: {
    hideCursor: true,
  },
};
