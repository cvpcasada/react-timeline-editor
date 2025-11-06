import type { Meta, StoryObj } from '@storybook/react-vite';

import { BasicEvent } from '.';

const meta = {
  title: 'Advanced Features/Basic Event',
  component: BasicEvent,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BasicEvent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AddNewActionExample: Story = {};
