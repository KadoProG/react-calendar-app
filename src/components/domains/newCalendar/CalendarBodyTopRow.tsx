import styles from '@/components/domains/newCalendar/CalendarBodyTopRow.module.scss';
import dayjs from '@/libs/dayjs';
import { formatDateRange } from '@/utils/convertDayjs';
import React from 'react';

interface CalendarBodyTopRowProps {
  start: dayjs.Dayjs;
  calendarEventsInAllDay: (gapi.client.calendar.Event & { calendarId: string })[];
  i: number;
  selectedStartDay: dayjs.Dayjs | null;
  selectedEndDay: dayjs.Dayjs | null;
  isDragging: boolean;
}

/**
 * カレンダーの上部の日付・曜日が記載された部分のヘッダの１行を描写する
 */
export const CalendarBodyTopRow: React.FC<CalendarBodyTopRowProps> = (props) => {
  // index値から日付を取得
  const date = dayjs(props.start).add(props.i, 'day');

  // 終日予定のうち、その日に該当するものを取得
  const calendarEventsInAllDayInDay = props.calendarEventsInAllDay.filter((event) =>
    dayjs(event.start!.date).isSame(date, 'day')
  );

  // 選択された日付と同じかどうか
  const isSame = React.useMemo(
    () => props.selectedStartDay && props.selectedStartDay.isSame(date, 'day'),
    [props.selectedStartDay, date]
  );

  // 選択された日付の差分
  const diff = React.useMemo(() => {
    if (!props.selectedStartDay || !props.selectedEndDay) return 0;
    return Math.abs(props.selectedEndDay.diff(props.selectedStartDay, 'day')) + 1;
  }, [props.selectedStartDay, props.selectedEndDay]);

  // 選択された日付の左位置（startからの日数、endがstartより前の場合のみ）
  const leftPosition = React.useMemo(() => {
    if (!props.selectedEndDay || props.selectedEndDay.isAfter(props.selectedStartDay)) return 0;
    return props.selectedEndDay.diff(props.selectedStartDay, 'day');
  }, [props.selectedStartDay, props.selectedEndDay]);

  return (
    <div style={{ flex: 1, borderLeft: '1px solid var(--divider)' }}>
      <p style={{ textAlign: 'center' }}>{date.format('ddd')}</p>
      <p style={{ textAlign: 'center' }}>{date.date()}</p>
      {calendarEventsInAllDayInDay.map((event) => (
        <div key={event.id}>{event.summary}</div>
      ))}
      <div style={{ position: 'relative' }}>
        {isSame && props.isDragging && (
          <div
            className={styles.selectedItem}
            style={{
              width: `${diff}00%`,
              left: `${leftPosition}00%`,
            }}
          >
            {formatDateRange(props.selectedStartDay!, props.selectedEndDay!, 'day')}
          </div>
        )}
      </div>
    </div>
  );
};
