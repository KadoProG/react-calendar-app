import dayjs from '@/libs/dayjs';
import { Button } from '@/components/common/button/Button';
import { CalendarContext } from '@/contexts/CalendarContext';
import React from 'react';
import { useWatch } from 'react-hook-form';

export const CalendarBodyTop: React.FC = () => {
  const { control, calendarEvents } = React.useContext(CalendarContext);

  const start = useWatch({ control, name: 'start' });

  const calendarEventsInAllDay = React.useMemo(
    () => calendarEvents.filter((event) => !!event.start?.date && !!event.end?.date),
    [calendarEvents]
  );

  return (
    <div style={{ display: 'flex' }}>
      <Button style={{ padding: '2px 4px' }}>
        ＋<br />
        新規
      </Button>
      {Array.from({ length: 7 }).map((_, i) => {
        const date = dayjs(start).add(i, 'day');

        const calendarEventsInAllDayInDay = calendarEventsInAllDay.filter((event) =>
          dayjs(event.start!.date).isSame(date, 'day')
        );

        return (
          <div key={i} style={{ flex: 1, borderLeft: '1px solid var(--divider)' }}>
            <p style={{ textAlign: 'center' }}>{date.format('ddd')}</p>
            <p style={{ textAlign: 'center' }}>{date.date()}</p>
            {calendarEventsInAllDayInDay.map((event) => (
              <div key={event.id}>{event.summary}</div>
            ))}
          </div>
        );
      })}
    </div>
  );
};
