import styles from '@/components/domains/newCalendar/CalendarBodyMainRow.module.scss';
import { CalendarBodyMainRowSelectedItem } from '@/components/domains/newCalendar/CalendarBodyMainRowSelectedItem';
import dayjs from '@/libs/dayjs';
import {
  calculateIndexDifference,
  splitCalendarEvents,
  SplitedCalendarEvent,
} from '@/utils/convertDayjs';
import React from 'react';

interface CalendarBodyMainRowProps {
  start: dayjs.Dayjs;
  calendarEventsInTimely: SplitedCalendarEvent[];
  i: number;
  selectedStartDay: dayjs.Dayjs | null;
  selectedEndDay: dayjs.Dayjs | null;
  isDragging: boolean;
  splitedSelectedCalendarEvents?: ReturnType<typeof splitCalendarEvents>;
  config: CalendarConfig;
  dragEventItem: { event: CalendarEventWithCalendarId; yDiff: number } | null;
}

/**
 * カレンダー時刻部分の１行を描写する
 */
export const CalendarBodyMainRow: React.FC<CalendarBodyMainRowProps> = (props) => {
  const { heightPerHour, divisionsPerHour } = props.config;
  // index値から日付を取得
  const date = React.useMemo(
    () => props.start.startOf('day').add(props.i, 'day'),
    [props.start, props.i]
  );

  // 時刻付き予定のうち、その日に該当するものを取得
  const calendarEventsInTimelyInDay = React.useMemo(
    () => props.calendarEventsInTimely.filter((event) => event.splitStart.isSame(date, 'day')),
    [props.calendarEventsInTimely, date]
  );

  // １日ずつ（Weekに対する列）の表示
  return (
    <div className={styles.dayColumn}>
      {/* ユーザが触れる時刻の描写 */}
      {[...Array(24 * divisionsPerHour)].map((_, hourIndex) => {
        const dayStart = date.startOf('day').add(Math.floor(hourIndex / divisionsPerHour), 'hour');

        const sameDayContentEvent = props.splitedSelectedCalendarEvents?.find(
          (event) => dayStart.format('YYYY-MM-DD') === event.splitStart.format('YYYY-MM-DD')
        );

        return (
          <div
            key={hourIndex}
            className={`${styles.timeCell} ${sameDayContentEvent ? styles.selected : ''}
               ${(hourIndex + 1) % divisionsPerHour === 0 ? styles.drawLine : ''}`}
            style={{ height: heightPerHour / divisionsPerHour }}
          />
        );
      })}

      {props.splitedSelectedCalendarEvents
        ?.filter((event) => date.isSame(event.splitStart, 'day'))
        .map((event, i) => (
          <CalendarBodyMainRowSelectedItem
            key={i}
            i={i}
            event={event}
            config={props.config}
            selectedStartDay={props.selectedStartDay}
            selectedEndDay={props.selectedEndDay}
            baseDate={date}
          />
        ))}

      {/* 既存のカレンダーイベントの表示 */}
      {calendarEventsInTimelyInDay.map((event) => {
        const startDate = event.splitStart;
        const endDate = event.splitEnd;
        const startDiff = calculateIndexDifference(date, startDate, divisionsPerHour);
        const endDiff = calculateIndexDifference(startDate, endDate, divisionsPerHour);
        const isDragItem = props.dragEventItem?.event.id === event.id;

        return (
          <button
            key={event.id}
            className={`${styles.calendarEvent} ${isDragItem ? styles.calendarEvent__leave : ''}`}
            id={`calendarEvent__${event.id}`}
            style={{
              top: `${(startDiff * heightPerHour) / divisionsPerHour}px`,
              height: `${(endDiff * heightPerHour) / divisionsPerHour}px`,
              backgroundColor: event.backgroundColor,
            }}
          >
            {event.summary}
          </button>
        );
      })}
    </div>
  );
};
