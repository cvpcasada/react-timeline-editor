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
        end: 550,
        effectId: "effect0",
      },
    ],
  },
  {
    id: "1",
    actions: [
      // 20+ actions with more widely spaced gaps; all fit before 550
      {
        id: "action10",
        start: 10,
        end: 20,
        effectId: "effect1",
      },
      {
        id: "action11",
        start: 40,
        end: 55,
        effectId: "effect1",
      },
      {
        id: "action12",
        start: 80,
        end: 90,
        effectId: "effect1",
      },
      {
        id: "action13",
        start: 120,
        end: 140,
        effectId: "effect1",
      },
      {
        id: "action14",
        start: 170,
        end: 172,
        effectId: "effect1",
      },
      {
        id: "action15",
        start: 200,
        end: 205,
        effectId: "effect1",
      },
      {
        id: "action16",
        start: 240,
        end: 260,
        effectId: "effect1",
      },
      {
        id: "action17",
        start: 300,
        end: 301,
        effectId: "effect1",
      },
      {
        id: "action18",
        start: 340,
        end: 360,
        effectId: "effect1",
      },
      {
        id: "action19",
        start: 400,
        end: 415,
        effectId: "effect1",
      },
      {
        id: "action20",
        start: 450,
        end: 470,
        effectId: "effect1",
      },
      {
        id: "action21",
        start: 485,
        end: 487,
        effectId: "effect1",
      },
      {
        id: "action22",
        start: 500,
        end: 507,
        effectId: "effect1",
      },
      {
        id: "action23",
        start: 520,
        end: 530,
        effectId: "effect1",
      },
      {
        id: "action24",
        start: 540,
        end: 549.9,
        effectId: "effect1",
      }
    ],
  },

];

