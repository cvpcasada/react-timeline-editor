import { type FC } from 'react';
import { type TimelineAction, type TimelineRow } from '@/index';

export const CustomRender0: FC<{ action: TimelineAction; row: TimelineRow }> =
  ({ action }) => {
    return (
      <div className={'effect0'}>
        <div className={`effect0-text`}>{`播放音频: ${(
          action.end - action.start
        ).toFixed(2)}s`}</div>
      </div>
    );
  };

export const CustomRender1: FC<{ action: TimelineAction; row: TimelineRow }> =
  () => {
    return (
      <div className={'effect1'}>
        <img src="./flag.png"></img>
      </div>
    );
  };

