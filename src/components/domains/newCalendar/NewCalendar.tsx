import dayjs from '@/libs/dayjs';
import React from 'react';
import { CalendarHeader } from '@/components/domains/newCalendar/CalendarHeader';
import { CalendarBodyTop } from '@/components/domains/newCalendar/CalendarBodyTop';
import { CalendarBodyMain } from '@/components/domains/newCalendar/CalendarBodyMain';
import { getMouseSelectedCalendar } from '@/components/domains/newCalendar/calendarUtils';
import { CalendarContext } from '@/contexts/CalendarContext';
import { useWatch } from 'react-hook-form';
import { CalendarConfigContext } from '@/contexts/CalendarConfigContext';

export const NewCalendar: React.FC = () => {
  const { control, calendarEvents } = React.useContext(CalendarContext);
  const {
    config: { divisionsPerHour },
  } = React.useContext(CalendarConfigContext);

  const start = useWatch({ control, name: 'start' });

  const [selectedStartDay, setSelectedStartDay] = React.useState<dayjs.Dayjs | null>(null);
  const [selectedEndDay, setSelectedEndDay] = React.useState<dayjs.Dayjs | null>(null);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);

  const isMouseDownRef = React.useRef<'allday' | 'timely' | null>(null);

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const { xIndex } = getMouseSelectedCalendar(e, 7, divisionsPerHour);
      const resultDate = dayjs(start).add(xIndex, 'day');

      setSelectedStartDay(resultDate);
      setSelectedEndDay(resultDate);
      isMouseDownRef.current = 'timely';
    },
    [start, divisionsPerHour]
  );

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isMouseDownRef.current) return;
      setIsDragging(true);
      const { xIndex, yIndex } = getMouseSelectedCalendar(e, 7, divisionsPerHour);
      const resultDate = dayjs(start).add(xIndex, 'day');
      setSelectedEndDay(resultDate.add(yIndex, 'hour'));
    },
    [start, divisionsPerHour]
  );

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
    isMouseDownRef.current = null;
  }, []);

  return (
    <div style={{ height: '100svh', display: 'flex', flexDirection: 'column' }}>
      <CalendarHeader />

      {/* カレンダー本体（ドラッグイベントの範囲） */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <CalendarBodyTop
          start={dayjs(start)}
          calendarEvents={calendarEvents}
          selectedStartDay={selectedStartDay}
          selectedEndDay={selectedEndDay}
          isDragging={isDragging}
          isMouseDownRef={isMouseDownRef}
        />
        <div
          style={{
            height: '100%',
            overflow: 'scroll',
            position: 'relative',
          }}
        >
          <CalendarBodyMain
            start={dayjs(start)}
            calendarEvents={calendarEvents}
            selectedStartDay={selectedStartDay}
            selectedEndDay={selectedEndDay}
            isDragging={isDragging}
            isMouseDownRef={isMouseDownRef}
          />
        </div>
      </div>
    </div>
  );
};
