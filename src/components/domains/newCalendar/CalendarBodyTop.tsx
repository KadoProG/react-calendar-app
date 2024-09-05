import dayjs from '@/libs/dayjs';
import { Button } from '@/components/common/button/Button';
import { CalendarContext } from '@/contexts/CalendarContext';
import React from 'react';
import { useWatch } from 'react-hook-form';
import { getMouseSelectedCalendar } from '@/components/domains/newCalendar/calendarUtils';
import { CalendarBodyTopRow } from '@/components/domains/newCalendar/CalendarBodyTopRow';

export const CalendarBodyTop: React.FC = () => {
  const { control, calendarEvents } = React.useContext(CalendarContext);

  const [selectedStartDay, setSelectedStartDay] = React.useState<dayjs.Dayjs | null>(null);
  const [selectedEndDay, setSelectedEndDay] = React.useState<dayjs.Dayjs | null>(null);

  const isMouseDownRef = React.useRef<boolean>(false);
  const leftElementRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);

  const start = useWatch({ control, name: 'start' });

  const calendarEventsInAllDay = React.useMemo(
    () => calendarEvents.filter((event) => !!event.start?.date && !!event.end?.date),
    [calendarEvents]
  );

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const { xIndex } = getMouseSelectedCalendar(e, leftElementRef.current!.clientWidth, 7);
      const resultDate = dayjs(start).add(xIndex, 'day');

      setSelectedStartDay(resultDate);
      setSelectedEndDay(resultDate);
      isMouseDownRef.current = true;
    },
    [start]
  );

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isMouseDownRef.current) return;
      setIsDragging(true);
      const { xIndex } = getMouseSelectedCalendar(e, leftElementRef.current!.clientWidth, 7);
      const resultDate = dayjs(start).add(xIndex, 'day');
      setSelectedEndDay(resultDate);
    },
    [start]
  );

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
    isMouseDownRef.current = false;
  }, []);

  return (
    <div
      style={{ display: 'flex' }}
      onMouseMove={(e) => handleMouseMove(e)}
      onMouseDown={(e) => handleMouseDown(e)}
      onMouseUp={handleMouseUp}
    >
      <div ref={leftElementRef}>
        <Button style={{ padding: '2px 4px' }}>
          ＋<br />
          新規
        </Button>
      </div>

      <div style={{ display: 'flex', width: '100%' }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <CalendarBodyTopRow
            key={i}
            start={dayjs(start)}
            calendarEventsInAllDay={calendarEventsInAllDay}
            i={i}
            selectedStartDay={selectedStartDay}
            selectedEndDay={selectedEndDay}
            isDragging={isDragging}
          />
        ))}
      </div>
    </div>
  );
};
