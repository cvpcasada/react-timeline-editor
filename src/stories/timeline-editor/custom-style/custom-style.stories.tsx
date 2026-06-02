import type { Meta, StoryObj } from '@storybook/react-vite';
import { CustomStyle } from '.';

const meta = {
  title: 'Basic Features/Custom Style',
  component: CustomStyle,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CustomStyle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CustomStyleExample: Story = {};
