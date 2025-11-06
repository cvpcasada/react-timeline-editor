import { type FC } from 'react';
import { type TimelineAction, type TimelineRow } from '@/index';

export const CustomRender0: FC<{ action: TimelineAction; row: TimelineRow }> = ({ action }) => {
  return (
    <div className={'effect0'}>
      <div className={`effect0-text`}>{`播放音频: ${(action.end - action.start).toFixed(2)}s ${action.movable === false ? '（不可移动）' : ''} ${
        action.flexible === false ? '（不可缩放）' : ''
      }`}</div>
    </div>
  );
};

export const CustomRender1: FC<{ action: TimelineAction; row: TimelineRow }> = () => {
  return (
    <div className={'effect1'}>
      <img src="./flag.png"></img>
    </div>
  );
};

export const CustomRender2: FC<{ action: TimelineAction; row: TimelineRow }> = ({ action }) => {
  return (
    <div className={'effect0'}>
      <div className={`effect0-text`}>{`${typeof action.minStart === 'number' ? 'minStart:' + action.minStart : ''} ${typeof action.maxEnd === 'number' ? 'maxEnd:' + action.maxEnd : ''}`}</div>
    </div>
  );
};
