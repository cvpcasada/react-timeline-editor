import type { Meta, StoryObj } from '@storybook/react-vite';

import { AutoScroll } from '.';

const meta = {
  title: 'Interactive Features/Auto Scroll',
  component: AutoScroll,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AutoScroll>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AutoScrollExample: Story = {
  argTypes: {
    autoScroll: {
      control: { type: 'boolean' },
      description: 'Enable automatic scrolling when timeline actions occur',
    },
  },
  args: {
    autoScroll: true,
  },
};

