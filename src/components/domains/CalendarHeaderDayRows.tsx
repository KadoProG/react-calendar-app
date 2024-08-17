import dayjs from '@/libs/dayjs';
import React from 'react';
import styles from '@/components/domains/CalendarHeader.module.scss';
import { CalendarConfigContext } from '@/contexts/CalendarConfigContext';
import { CalendarEventContext } from '@/contexts/CalendarEventContext';
import { CalendarConfigFormDialogContext } from '@/contexts/CalendarConfigFormDialogContext';
import { splitCalendarEvents } from '@/utils/convertDayjs';

export const CalendarHeaderDayRows: React.FC = () => {
  const { config, baseDate } = React.useContext(CalendarConfigContext);
  const { calendarEvents } = React.useContext(CalendarEventContext);
  const { openDialog } = React.useContext(CalendarConfigFormDialogContext);

  const handleClick = React.useCallback(
    (day: dayjs.Dayjs) => {
      openDialog({
        type: 'add',
        init: {
          start: day.startOf('day'),
          end: day.startOf('day').add(1, 'day'),
          isAllDayEvent: true,
        },
      });
    },
    [openDialog]
  );

  const handleEventClick = React.useCallback(
    (e: React.MouseEvent, id: CalendarEvent['id']) => {
      e.preventDefault();
      e.stopPropagation();
      openDialog({ type: 'edit', id });
    },
    [openDialog]
  );

  const splitedCalendarEvents = React.useMemo(
    () => splitCalendarEvents(calendarEvents).filter((event) => event.isAllDayEvent),
    [calendarEvents]
  );

  return (
    <div
      className={styles.fixedContent__row}
      style={{ gridTemplateColumns: `repeat(${config.weekDisplayCount + 1}, 1fr)` }}
    >
      {[...Array(config.weekDisplayCount + 1)].map((_, dayIndex) => {
        if (dayIndex === 0) return <div key={dayIndex}></div>;
        const day = baseDate.add(dayIndex - 1, 'day');
        return (
          <div
            key={dayIndex}
            className={styles.fixedContent__row__column}
            onClick={() => handleClick(day)}
          >
            <p>{day.format('ddd')}</p>
            <p>{day.format('D')}</p>
          </div>
        );
      })}
      {[...Array(config.weekDisplayCount + 1)].map((_, dayIndex) => {
        if (dayIndex === 0) return <div key={dayIndex}></div>;
        const day = baseDate.add(dayIndex - 1, 'day');
        return (
          <div key={dayIndex} className={styles.fixedContent__row__column}>
            {splitedCalendarEvents
              .filter((event) => event.splitStart.isSame(day, 'day'))
              .map((event) => (
                <button
                  key={event.id}
                  className={styles.calendarEvent}
                  onClick={(e) => handleEventClick(e, event.id)}
                >
                  <p>{event.title}</p>
                </button>
              ))}
          </div>
        );
      })}
    </div>
  );
};
