import styles from '@/components/domains/newCalendar/CalendarBodyMain.module.scss';
import { CalendarBodyMainRow } from '@/components/domains/newCalendar/CalendarBodyMainRow';
import { LEFT_WIDTH } from '@/const/const';
import { CalendarConfigContext } from '@/contexts/CalendarConfigContext';
import dayjs from '@/libs/dayjs';
import { splitCalendarEvents } from '@/utils/convertDayjs';
import React from 'react';

interface CalendarBodyMainProps {
  start: dayjs.Dayjs;
  calendarEvents: (gapi.client.calendar.Event & { calendarId: string })[];
  selectedStartDay: dayjs.Dayjs | null;
  selectedEndDay: dayjs.Dayjs | null;
  isMouseDownRef: React.MutableRefObject<'allday' | 'timely' | null>;
  isDragging: boolean;
}

export const CalendarBodyMain: React.FC<CalendarBodyMainProps> = (props) => {
  const {
    config: { heightPerHour, divisionsPerHour },
  } = React.useContext(CalendarConfigContext);

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
    <div>
      <div style={{ display: 'flex' }}>
        <div style={{ minWidth: LEFT_WIDTH }}>
          {Array.from({ length: 24 }).map((_, i) => {
            const time = dayjs().startOf('day').add(i, 'hour').format('HH:mm');
            return (
              <div className={styles.timeLabel} key={i} style={{ height: heightPerHour }}>
                <p>{time}</p>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', width: '100%' }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <CalendarBodyMainRow
              key={i}
              i={i}
              isDragging={props.isDragging}
              selectedStartDay={props.selectedStartDay}
              selectedEndDay={props.selectedEndDay}
              start={props.start}
              calendarEventsInTimely={calendarEventsInTimely}
              divisionsPerHour={divisionsPerHour}
              heightPerHour={heightPerHour}
              splitedSelectedCalendarEvents={splitedSelectedCalendarEvents}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
