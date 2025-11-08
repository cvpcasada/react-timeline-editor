import type { Meta, StoryObj } from '@storybook/react-vite';

import { CustomScaleStyle, ScaleCustomization } from '.';

const meta = {
  title: 'Advanced Features/Scale Customization',
  component: ScaleCustomization,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ScaleCustomization>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ScaleCustomizationExample: Story = {
  argTypes: {
    scale: {
      control: { type: 'range', min: 1, max: 100 },
      description: 'The scale factor for the timeline',
    },
    scaleSplitCount: {
      control: { type: 'number', min: 1, max: 100 },
      description: 'Number of scale splits',
    },
    scaleWidth: {
      control: { type: 'range', min: 50, max: 500 },
      description: 'Width of each scale unit',
    },
    startLeft: {
      control: { type: 'number', min: 0, max: 100 },
      description: 'Starting left position',
    },
  },
  args: {
    scale: 5,
    scaleSplitCount: 10,
    scaleWidth: 160,
    startLeft: 20,
  },
};

export const CustomScaleStyleExample: Story = {
  render: () => <CustomScaleStyle />,
};
