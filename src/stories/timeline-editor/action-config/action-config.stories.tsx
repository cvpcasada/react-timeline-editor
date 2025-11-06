import type { Meta, StoryObj } from '@storybook/react-vite';

import { ActionMinStartMaxEnd, ActionMovableFlexible } from '.';
import { mockData as mockData2, mockEffect as mockEffect2 } from './mock2';
import { CustomRender2 } from './custom';
import type { TimelineAction, TimelineRow } from '@/interface/timeline';
const meta = {
  title: 'Basic Features/Action Config',
  component: ActionMovableFlexible,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ActionMovableFlexible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActionConfigExample: Story = {};

export const ActionMinStartMaxEndExample: Story = {
  args: {
    editorData: mockData2,
    effects: mockEffect2,
    hideCursor: false,
    getActionRender: (action: TimelineAction, row: TimelineRow) => {
      return <CustomRender2 action={action} row={row} />;
    },
  },
  render: () => {
    return <ActionMinStartMaxEnd />;
  },
};
