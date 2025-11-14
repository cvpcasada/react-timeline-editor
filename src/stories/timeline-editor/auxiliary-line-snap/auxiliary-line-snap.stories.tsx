import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuxiliaryLineSnap } from '.';
import { ShiftKeySnap } from './shift-key';

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
    snap: {
      control: { type: 'boolean' },
      description: 'Enable snap when dragging timeline actions',
    },
  },
  args: {
    snap: true,
  },
};

export const ShiftKeyToggle: StoryObj = {
  render: () => <ShiftKeySnap />,
  parameters: {
    docs: {
      description: {
        story: 'This example demonstrates dynamic snap toggling during drag operations. Hold the Shift key to enable snapping while dragging or resizing actions. This tests that snap positions are correctly calculated even when snap is enabled mid-drag.',
      },
    },
  },
};

