import dayjs from '@/libs/dayjs';
import { v4 as uuidv4 } from 'uuid';
import React from 'react';
import styles from '@/components/domains/CalendarHeader.module.scss';
import { CalendarConfigContext } from '@/contexts/CalendarConfigContext';
import { CalendarEventContext } from '@/contexts/CalendarEventContext';
import { CalendarConfigFormDialogContext } from '@/contexts/CalendarConfigFormDialogContext';

export const CalendarHeaderDayRows: React.FC = () => {
  const { config, baseDate } = React.useContext(CalendarConfigContext);
  const { addCalendarEvent } = React.useContext(CalendarEventContext);
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
    </div>
  );
};
