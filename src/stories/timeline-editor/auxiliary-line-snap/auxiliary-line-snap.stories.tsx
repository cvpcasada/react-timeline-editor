import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuxiliaryLineSnap } from '.';

const meta = {
  title: 'Interactive Features/Auxiliary Line Snap',
  component: AuxiliaryLineSnap,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AuxiliaryLineSnap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AuxiliaryLineSnapExample: Story = {
  argTypes: {
    dragLine: {
      control: { type: 'boolean' },
      description: 'Enable auxiliary line snap when dragging timeline actions',
    },
  },
  args: {
    dragLine: true,
  },
};

