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
    autoScrollSpeed: {
      control: { type: 'number', min: 0.1, max: 5, step: 0.1 },
      description: 'Speed of auto scrolling (default: 1)',
    },
    autoScrollMaxSpeed: {
      control: { type: 'number', min: 1, max: 50, step: 1 },
      description: 'Maximum speed of auto scrolling (default: 10)',
    },
  },
  args: {
    autoScroll: true,
    autoScrollSpeed: 1,
    autoScrollMaxSpeed: 10,
  },
};

