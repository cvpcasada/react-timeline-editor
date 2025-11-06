import type { Meta, StoryObj } from '@storybook/react-vite';

import { MoveAndScaleCallbacks } from '.';

const meta = {
  title: 'Advanced Features/Move & Scale Callbacks',
  component: MoveAndScaleCallbacks,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MoveAndScaleCallbacks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MoveAndScaleCallbacksExample: Story = {};
