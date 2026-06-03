import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Basic,
  BasicActionPreview,
  BasicCursorDisabled,
  BasicHideCursor,
} from ".";
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
    onCursorDrag: action("onCursorDrag"),
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

export const ActionPreview: StoryObj<typeof BasicActionPreview> = {
  render: (args) => <BasicActionPreview {...args} />,
  argTypes: {
    resizeToAvailableSpace: {
      control: { type: "boolean" },
      description: "Resize the preview to fit before the next action",
    },
    minPreviewDuration: {
      control: { type: "number", min: 0, step: 0.1 },
      description: "Minimum duration required to show and commit a preview",
    },
  },
  args: {
    resizeToAvailableSpace: true,
    minPreviewDuration: 0.5,
  },
};
