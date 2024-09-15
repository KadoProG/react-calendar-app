import styles from '@/components/domains/newCalendar/CalendarBodyMain.module.scss';
import { CalendarBodyMainRow } from '@/components/domains/newCalendar/CalendarBodyMainRow';
import { LEFT_WIDTH } from '@/const/const';
import dayjs from '@/libs/dayjs';
import { splitCalendarEvents } from '@/utils/convertDayjs';
import React from 'react';

interface CalendarBodyMainProps {
  start: dayjs.Dayjs;
  calendarEvents: CalendarEventWithCalendarId[];
  selectedStartDay: dayjs.Dayjs | null;
  selectedEndDay: dayjs.Dayjs | null;
  isDragging: boolean;
  config: CalendarConfig;
  dragEventItem: { event: CalendarEventWithCalendarId; yDiff: number } | null;
}

export const CalendarBodyMain: React.FC<CalendarBodyMainProps> = (props) => {
  const calendarEventsInTimely = React.useMemo(
    () => props.calendarEvents.filter((event) => !!event.start?.dateTime && !!event.end?.dateTime),
    [props.calendarEvents]
  );

  const splitedSelectedCalendarEvents = React.useMemo(
    () =>
      props.isDragging
        ? splitCalendarEvents([
            {
              id: '1',
              title: '',
              start: props.selectedStartDay,
              end: props.selectedEndDay,
              isAllDayEvent: false,
            },
          ])
        : undefined,
    [props.selectedStartDay, props.selectedEndDay, props.isDragging]
  );

  return (
    <div style={{ display: 'flex', position: 'absolute', width: '100%' }}>
      <div style={{ minWidth: LEFT_WIDTH }}>
        {Array.from({ length: 24 }).map((_, i) => {
          const time = dayjs().startOf('day').add(i, 'hour').format('HH:mm');
          return (
            <div
              className={styles.timeLabel}
              key={i}
              style={{ height: props.config.heightPerHour }}
            >
              {i !== 0 && <p>{time}</p>}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', width: '100%' }}>
        {Array.from({ length: props.config.weekDisplayCount }).map((_, i) => (
          <CalendarBodyMainRow
            key={i}
            i={i}
            isDragging={props.isDragging}
            selectedStartDay={props.selectedStartDay}
            selectedEndDay={props.selectedEndDay}
            start={props.start}
            calendarEventsInTimely={calendarEventsInTimely}
            splitedSelectedCalendarEvents={splitedSelectedCalendarEvents}
            config={props.config}
            dragEventItem={props.dragEventItem}
          />
        ))}
      </div>
    </div>
  );
};
