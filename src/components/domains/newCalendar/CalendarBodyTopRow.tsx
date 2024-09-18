import { CalendarMenuContext } from '@/components/domains/editMenu/CalendarMenuContext';
import styles from '@/components/domains/newCalendar/CalendarBodyTopRow.module.scss';
import dayjs from '@/libs/dayjs';
import { formatDateRange } from '@/utils/convertDayjs';
import React from 'react';

interface CalendarBodyTopRowProps {
  start: dayjs.Dayjs;
  calendarEventsInAllDay: CalendarEventWithCalendarId[];
  i: number;
  selectedStartDay: dayjs.Dayjs | null;
  selectedEndDay: dayjs.Dayjs | null;
  isDragging: boolean;
  config: CalendarConfig;
  dragEventItem: { event: CalendarEventWithCalendarId; yDiff: number } | null;
}

/**
 * カレンダーの上部の日付・曜日が記載された部分のヘッダの１行を描写する
 */
export const CalendarBodyTopRow: React.FC<CalendarBodyTopRowProps> = (props) => {
  const { openMenu } = React.useContext(CalendarMenuContext);

  // index値から日付を取得
  const date = React.useMemo(
    () => dayjs(props.start).startOf('day').add(props.i, 'day'),
    [props.start, props.i]
  );

  // 終日予定のうち、その日に該当するものを取得
  const calendarEventsInAllDayInDay = React.useMemo(
    () =>
      props.calendarEventsInAllDay.filter(
        (event) =>
          dayjs(event.start!.date).isSame(date, 'day') ||
          (props.i === 0 && dayjs(event.start!.date).isBefore(date, 'day'))
      ),
    [props.calendarEventsInAllDay, date, props.i]
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

  const handleScheduleClick = React.useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
      const event = calendarEventsInAllDayInDay.find((event) => event.id === id);
      if (!event) return;

      await openMenu({
        anchorEl: e.currentTarget,
        start: dayjs(event.start?.date),
        end: dayjs(event.end?.date).add(-1, 'day'),
        eventId: event.id ?? '',
        calendarId: event.calendarId,
        summary: event.summary ?? '',
        isAllDay: true,
      });
    },
    [openMenu, calendarEventsInAllDayInDay]
  );

  return (
    <div
      className={styles.dayColumn}
      style={{ width: `calc(100% / ${props.config.weekDisplayCount})` }}
    >
      <p style={{ textAlign: 'center' }}>{date.format('ddd')}</p>
      <p style={{ textAlign: 'center' }}>{date.date()}</p>

      {/* カレンダーイベント */}
      <div style={{ minHeight: 20 }}>
        {calendarEventsInAllDayInDay.map((event) => {
          const startDate = dayjs(event.start!.date);
          const endDate = dayjs(event.end!.date);
          const scheculeDiff = endDate.diff(dayjs(date), 'day');
          const overDiff = !(scheculeDiff + props.i < props.config.weekDisplayCount);
          const resultDiff = overDiff ? props.config.weekDisplayCount - props.i : scheculeDiff;
          const isDragItem = props.dragEventItem?.event.id === event.id;

          return (
            <button
              key={event.id}
              onClick={(e) => handleScheduleClick(e, event.id ?? '')}
              id={`calendarEvent__${event.id}`}
              className={`${styles.calendarEvent} 
              ${startDate.isBefore(date, 'day') ? styles.start : ''} 
              ${overDiff ? styles.end : ''}  ${isDragItem ? styles.calendarEvent__leave : ''}`}
              style={{ width: `${resultDiff * 100}%`, backgroundColor: event.backgroundColor }}
            >
              {event.summary}
            </button>
          );
        })}
      </div>

      {/* 選択時のハイライト表示 */}
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
