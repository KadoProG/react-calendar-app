import dayjs from '@/libs/dayjs';
import { v4 as uuidv4 } from 'uuid';
import React from 'react';
import styles from '@/components/domains/CalendarHeader.module.scss';
import { CalendarConfigContext } from '@/contexts/CalendarConfigContext';
import { CalendarEventContext } from '@/contexts/CalendarEventContext';
import { CalendarConfigFormDialogContext } from '@/contexts/CalendarConfigFormDialogContext';
import { splitCalendarEvents } from '@/utils/convertDayjs';

export const CalendarHeaderDayRows: React.FC = () => {
  const { config, baseDate } = React.useContext(CalendarConfigContext);
  const { addCalendarEvent, calendarEvents, updateCalendarEvent, removeCalendarEvent } =
    React.useContext(CalendarEventContext);
  const { openDialog } = React.useContext(CalendarConfigFormDialogContext);

  const handleClick = React.useCallback(
    async (day: dayjs.Dayjs) => {
      const newEvent: CalendarEvent = {
        id: uuidv4(),
        start: day.startOf('day'),
        end: day.startOf('day').add(1, 'day'),
        title: '',
        isAllDayEvent: true,
      };

      const result = await openDialog(newEvent);

      if (result.type === 'save') {
        addCalendarEvent(result.calendarEvent ?? newEvent);
      }
    },
    [addCalendarEvent, openDialog]
  );

  const handleEventClick = React.useCallback(
    async (e: React.MouseEvent, id: CalendarEvent['id']) => {
      e.preventDefault();
      e.stopPropagation();
      const event = calendarEvents.find((event) => event.id === id);
      if (!event) return;
      const result = await openDialog(event);
      if (result.type === 'save') {
        updateCalendarEvent(event.id, result.calendarEvent ?? event);
      } else if (result.type === 'delete') {
        removeCalendarEvent(event.id);
      }
    },
    [openDialog, updateCalendarEvent, removeCalendarEvent, calendarEvents]
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
