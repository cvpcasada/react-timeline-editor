import React, { type FC } from 'react';
import { type TimelineRow } from '@/interface/action';
import { type CommonProp } from '@/interface/common_prop';
import { DEFAULT_SCALE, DEFAULT_SCALE_WIDTH, DEFAULT_START_LEFT } from '@/interface/const';
import { prefix } from '@/utils/deal_class_prefix';
import { parserPixelToTime } from '@/utils/deal_data';
import { type DragLineData } from './drag_lines';
import { EditAction } from './edit_action';
import './edit_row.less';

export type EditRowProps = CommonProp & {
  areaRef: React.RefObject<HTMLDivElement | null>;
  rowData?: TimelineRow;
  style?: React.CSSProperties;
  dragLineData: DragLineData;
  setEditorData: (params: TimelineRow[]) => void;
  /** Scroll distance from left */
  scrollLeft: number;
  /** Set scroll left */
  deltaScrollLeft?: (scrollLeft: number) => void;
};

export const EditRow: FC<EditRowProps> = (props) => {
  const { rowData, style = {}, onClickRow, onDoubleClickRow, onContextMenuRow, areaRef, scrollLeft, startLeft, scale, scaleWidth } = props;

  const classNames = ['edit-row'];
  if (rowData?.selected) classNames.push('edit-row-selected');

  // Get default values for optional props
  const safeScale = scale ?? DEFAULT_SCALE;
  const safeScaleWidth = scaleWidth ?? DEFAULT_SCALE_WIDTH;
  const safeStartLeft = startLeft ?? DEFAULT_START_LEFT;

  const handleTime = (e: React.MouseEvent<HTMLDivElement, MouseEvent>): number => {
    if (!areaRef.current) return 0;
    const rect = areaRef.current.getBoundingClientRect();
    const position = e.clientX - rect.x;
    const left = position + scrollLeft;
    const time = parserPixelToTime(left, { startLeft: safeStartLeft, scale: safeScale, scaleWidth: safeScaleWidth });
    return time;
  };

  return (
    <div
      className={`${prefix(...classNames)} ${(rowData?.classNames || []).join(' ')}`}
      style={style}
      onClick={(e) => {
        if (rowData && onClickRow) {
          const time = handleTime(e);
          onClickRow(e, { row: rowData, time: time });
        }
      }}
      onDoubleClick={(e) => {
        if (rowData && onDoubleClickRow) {
          const time = handleTime(e);
          onDoubleClickRow(e, { row: rowData, time: time });
        }
      }}
      onContextMenu={(e) => {
        if (rowData && onContextMenuRow) {
          const time = handleTime(e);
          onContextMenuRow(e, { row: rowData, time: time });
        }
      }}
    >
      {rowData && (rowData.actions || []).map((action) => <EditAction key={action.id} {...props} handleTime={handleTime} row={rowData} action={action} />)}
    </div>
  );
};
