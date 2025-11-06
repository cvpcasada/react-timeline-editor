import { type TimelineAction } from './action';

export interface TimelineEffect {
  /** Effect id */
  id: string;
  /** Effect name */
  name?: string;
  /** Effect execution code */
  source?: TimeLineEffectSource;
}

export interface EffectSourceParam {
  /** Current time */
  time: number;
  /** Whether it is currently playing */
  isPlaying: boolean;
  /** Action */
  action: TimelineAction;
  /** Action effect */
  effect: TimelineEffect;
}

/**
 * Effect execution callback
 * @export
 * @interface TimeLineEffectSource
 */
export interface TimeLineEffectSource {
  /** Callback when playback starts in the current action time region */
  start?: (param: EffectSourceParam) => void;
  /** Callback executed when time enters the action */
  enter?: (param: EffectSourceParam) => void;
  /** Callback when action updates */
  update?: (param: EffectSourceParam) => void;
  /** Callback executed when time leaves the action */
  leave?: (param: EffectSourceParam) => void;
  /** Callback when playback stops in the current action time region */
  stop?: (param: EffectSourceParam) => void;
}
