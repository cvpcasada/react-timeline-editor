import type { Meta, StoryObj } from '@storybook/react-vite';

import { ScrollSync } from '.';

const meta = {
  title: 'Advanced Features/Scroll Sync',
  component: ScrollSync,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ScrollSync>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ScrollSyncExample: Story = {};
