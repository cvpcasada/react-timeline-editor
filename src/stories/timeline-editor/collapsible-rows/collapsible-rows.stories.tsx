import type { Meta, StoryObj } from '@storybook/react-vite';

import { CollapsibleRows, type CollapsibleRowsProps } from '.';

const meta = {
  title: 'Interactive Features/Collapsible Rows',
  component: CollapsibleRows,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CollapsibleRows>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CollapsibleRowsExample: Story = {
  render: (args: CollapsibleRowsProps) => {
    const resetKey = [
      args.rowHeight,
      args.expandedRowHeight,
      args.collapsedRowHeight,
      args.defaultExpandedRow,
      args.showCollapsedRowLabels,
    ].join(':');

    return <CollapsibleRows key={resetKey} {...args} />;
  },
  argTypes: {
    rowHeight: {
      control: { type: 'number', min: 24, max: 96, step: 1 },
      description: 'Height for fixed rows and rows without a custom expanded height',
    },
    expandedRowHeight: {
      control: { type: 'number', min: 32, max: 120, step: 1 },
      description: 'Expanded height assigned to the example rows',
    },
    collapsedRowHeight: {
      control: { type: 'number', min: 8, max: 48, step: 1 },
      description: 'Collapsed height assigned directly to each collapsible row',
    },
    defaultExpandedRow: {
      control: { type: 'select' },
      options: ['none', 'second', 'third'],
      description: 'Collapsible row expanded when no row is focused',
    },
    showCollapsedRowLabels: {
      control: 'boolean',
      description: 'Show decorative labels over collapsed rows',
    },
  },
  args: {
    rowHeight: 40,
    expandedRowHeight: 56,
    collapsedRowHeight: 18,
    defaultExpandedRow: 'second',
    showCollapsedRowLabels: false,
  },
};

export const CollapsedRowLabels: Story = {
  ...CollapsibleRowsExample,
  args: {
    ...CollapsibleRowsExample.args,
    showCollapsedRowLabels: true,
  },
};
