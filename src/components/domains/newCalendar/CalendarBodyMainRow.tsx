import styles from '@/components/domains/newCalendar/CalendarBodyMainRow.module.scss';
import dayjs from '@/libs/dayjs';
import { calculateIndexDifference, splitCalendarEvents } from '@/utils/convertDayjs';
import React from 'react';

interface CalendarBodyMainRowProps {
  start: dayjs.Dayjs;
  calendarEventsInTimely: (gapi.client.calendar.Event & { calendarId: string })[];
  i: number;
  selectedStartDay: dayjs.Dayjs | null;
  selectedEndDay: dayjs.Dayjs | null;
  isDragging: boolean;
  divisionsPerHour: number;
  heightPerHour: number;
  splitedSelectedCalendarEvents?: ReturnType<typeof splitCalendarEvents>;
}

/**
 * カレンダー時刻部分の１行を描写する
 */
export const CalendarBodyMainRow: React.FC<CalendarBodyMainRowProps> = (props) => {
  // index値から日付を取得
  const date = React.useMemo(
    () => props.start.startOf('day').add(props.i, 'day'),
    [props.start, props.i]
  );

  // 終日予定のうち、その日に該当するものを取得
  const calendarEventsInTimelyInDay = React.useMemo(
    () =>
      props.calendarEventsInTimely.filter(
        (event) =>
          dayjs(event.start!.date).isSame(date, 'day') ||
          (props.i === 0 && dayjs(event.start!.date).isBefore(date, 'day'))
      ),
    [props.calendarEventsInTimely, date, props.i]
  );

  // １日ずつ（Weekに対する列）の表示
  return (
    <div className={styles.dayColumn}>
      {/* ユーザが触れる時刻の描写 */}
      {[...Array(24 * props.divisionsPerHour)].map((_, hourIndex) => {
        const dayStart = date
          .startOf('day')
          .add(Math.floor(hourIndex / props.divisionsPerHour), 'hour');

        const sameDayContentEvent = props.splitedSelectedCalendarEvents?.find(
          (event) => dayStart.format('YYYY-MM-DD') === event.splitStart.format('YYYY-MM-DD')
        );

        return (
          <div
            key={hourIndex}
            className={`${styles.timeCell} ${sameDayContentEvent ? styles.selected : ''}
               ${(hourIndex + 1) % props.divisionsPerHour === 0 ? styles.drawLine : ''}`}
            style={{ height: props.heightPerHour / props.divisionsPerHour }}
          />
        );
      })}

      {props.splitedSelectedCalendarEvents
        ?.filter((event) => date.isSame(event.splitStart, 'day'))
        .map((event, i) => {
          const sizeIndex =
            Math.abs(
              calculateIndexDifference(event.splitStart, event.splitEnd, props.divisionsPerHour)
            ) + 1;

          return (
            <div
              key={i}
              className={styles.selectedItem}
              style={{
                top: `${(calculateIndexDifference(date.startOf('day'), event.splitStart, props.divisionsPerHour) * props.heightPerHour) / props.divisionsPerHour}px`,
                height: `${(sizeIndex * props.heightPerHour) / props.divisionsPerHour}px`,
              }}
            >
              <small>
                {(props.selectedStartDay! <= props.selectedEndDay!
                  ? props.selectedStartDay!
                  : props.selectedEndDay!
                ).format('HH:mm')}
                ~
                {(props.selectedStartDay! > props.selectedEndDay!
                  ? props.selectedStartDay
                  : props.selectedEndDay)!
                  .add(60 / props.divisionsPerHour, 'minute')
                  .format('HH:mm')}
              </small>
            </div>
          );
        })}

      {calendarEventsInTimelyInDay.map((event) => {
        const endDate = dayjs(event.end!.date);
        const scheculeDiff = endDate.diff(dayjs(date), 'day');
        const overDiff = !(scheculeDiff + props.i < 7);
        const resultDiff = overDiff ? 7 - props.i : scheculeDiff + props.i;
        return (
          <div
            key={event.id}
            style={{
              position: 'absolute',
              top: 0,
              left: overDiff ? 0 : resultDiff * 100,
              width: overDiff ? 100 * (7 - props.i) : 100 * (scheculeDiff + 1),
              height: 24,
              backgroundColor: 'lightblue',
              border: '1px solid var(--divider)',
              zIndex: 1,
            }}
          >
            {event.summary}
          </div>
        );
      })}
    </div>
  );
};
