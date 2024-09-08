import styles from '@/components/domains/newCalendar/CalendarBodyMainRow.module.scss';
import { CalendarMenuContext } from '@/components/domains/newCalendar/CalendarMenuContext';
import dayjs from '@/libs/dayjs';
import { calculateIndexDifference, splitCalendarEvents } from '@/utils/convertDayjs';
import React from 'react';

interface CalendarBodyMainRowProps {
  start: dayjs.Dayjs;
  calendarEventsInTimely: CalendarEventWithCalendarId[];
  i: number;
  selectedStartDay: dayjs.Dayjs | null;
  selectedEndDay: dayjs.Dayjs | null;
  isDragging: boolean;
  splitedSelectedCalendarEvents?: ReturnType<typeof splitCalendarEvents>;
  config: CalendarConfig;
}

/**
 * カレンダー時刻部分の１行を描写する
 */
export const CalendarBodyMainRow: React.FC<CalendarBodyMainRowProps> = (props) => {
  const { openMenu } = React.useContext(CalendarMenuContext);
  const { heightPerHour, divisionsPerHour } = props.config;
  // index値から日付を取得
  const date = React.useMemo(
    () => props.start.startOf('day').add(props.i, 'day'),
    [props.start, props.i]
  );

  // 時刻付き予定のうち、その日に該当するものを取得
  const calendarEventsInTimelyInDay = React.useMemo(
    () =>
      props.calendarEventsInTimely.filter(
        (event) =>
          dayjs(event.start!.dateTime).isSame(date, 'day') ||
          (props.i === 0 && dayjs(event.start!.dateTime).isBefore(date, 'day'))
      ),
    [props.calendarEventsInTimely, date, props.i]
  );

  const handleScheduleClick = React.useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
      const event = props.calendarEventsInTimely.find((event) => event.id === id);
      if (!event) return;

      const isAllDay = event.start?.date;

      await openMenu({
        anchorEl: e.currentTarget,
        start: dayjs(isAllDay ? event.start?.date : event.start?.dateTime),
        end: dayjs(isAllDay ? event.end?.date : event.end?.dateTime),
        eventId: event.id ?? '',
        calendarId: event.calendarId,
        summary: event.summary ?? '',
      });
    },
    [openMenu, props.calendarEventsInTimely]
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
        .map((event, i) => {
          const sizeIndex =
            Math.abs(calculateIndexDifference(event.splitStart, event.splitEnd, divisionsPerHour)) +
            1;

          return (
            <div
              key={i}
              className={styles.selectedItem}
              style={{
                top: `${(calculateIndexDifference(date.startOf('day'), event.splitStart, divisionsPerHour) * heightPerHour) / divisionsPerHour}px`,
                height: `${(sizeIndex * heightPerHour) / divisionsPerHour}px`,
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
                  .add(60 / divisionsPerHour, 'minute')
                  .format('HH:mm')}
              </small>
            </div>
          );
        })}

      {calendarEventsInTimelyInDay.map((event) => {
        const startDate = dayjs(event.start!.dateTime);
        const endDate = dayjs(event.end!.dateTime);
        const startDiff = calculateIndexDifference(date, startDate, divisionsPerHour);
        const endDiff = calculateIndexDifference(startDate, endDate, divisionsPerHour);

        return (
          <button
            key={event.id}
            className={styles.calendarEvent}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => handleScheduleClick(e, event.id ?? '')}
            style={{
              top: `${(startDiff * props.config.heightPerHour) / props.config.divisionsPerHour}px`,
              height: `${(endDiff * props.config.heightPerHour) / props.config.divisionsPerHour}px`,
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
