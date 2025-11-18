import type { Meta, StoryObj } from "@storybook/react-vite";

import { PlaybackDemo } from ".";

const meta = {
  title: "Basic Features/Playback Demo",
  component: PlaybackDemo,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PlaybackDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PlaybackDemoExample: Story = {
  args: {
    visibleTimeSecs: 600,
    playbackSpeed: 1,
  },

  argTypes: {
    visibleTimeSecs: {
      control: { type: "range", min: 2, max: 600,},
      description: "The visible time in seconds (zoom",
    },
    playbackSpeed: {
      control: { type: "range", min: 1, max: 8, step: 1 },
      description: "The playback speed (1x speed by default)",
    },
  },
};
