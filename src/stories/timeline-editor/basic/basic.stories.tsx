import type { Meta, StoryObj } from '@storybook/react-vite';

import { Basic, BasicCursorDisabled, BasicHideCursor } from '.';

const meta = {
  title: 'Basic Features/Basic',
  component: Basic,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Basic>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicExample: Story = {};

export const BasicDisableDragAction: Story = {
  render: (args) => <BasicCursorDisabled {...args} />,
  argTypes: {
    disableDrag: {
      control: { type: 'boolean' },
      description: 'Disable dragging of timeline actions',
    },
  },
  args: {
    disableDrag: false,
  },
};

export const BasicHideTimelineCursor: Story = {
  render: (args) => <BasicHideCursor {...args} />,
  argTypes: {
    hideCursor: {
      control: { type: 'boolean' },
      description: 'Hide the cursor in the timeline',
    },
  },
  args: {
    hideCursor: true,
  },
};
