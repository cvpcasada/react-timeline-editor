import { type TimelineEffect, type TimelineRow } from '@/index';

export const mockEffect: Record<string, TimelineEffect> = {
  effect0: {
    id: "effect0",
    name: "Effect 0",
  },
  effect1: {
    id: "effect1",
    name: "Effect 1",
  },
};


export const mockData: TimelineRow[] = [
  {
    id: "0",
    actions: [
      {
        id: "action00",
        start: 0,
        end: 2,
        effectId: "effect0",
      },
    ],
  },
  {
    id: "1",
    actions: [
      {
        id: "action10",
        start: 1.5,
        end: 4,
        effectId: "effect1",
      }
    ],
  }
];

