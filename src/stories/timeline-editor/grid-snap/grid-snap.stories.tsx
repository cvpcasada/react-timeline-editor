import type { Meta, StoryObj } from '@storybook/react-vite';

import { GridSnap } from '.';

const meta = {
  title: 'Interactive Features/Grid Snap',
  component: GridSnap,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof GridSnap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GridSnapExample: Story = {
  argTypes: {
    scaleSplitCount: {
      control: { type: 'number', min: 1, max: 100 },
      description: 'Number of scale splits for grid snapping',
    },
    gridSnap: {
      control: { type: 'boolean' },
      description: 'Enable grid snapping when dragging timeline actions',
    },
  },
  args: {
    scaleSplitCount: 10,
    gridSnap: true,
  },
};

