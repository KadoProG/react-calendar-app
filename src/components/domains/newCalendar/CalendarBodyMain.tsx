import styles from '@/components/domains/newCalendar/CalendarBodyMain.module.scss';
import { CalendarBodyMainRow } from '@/components/domains/newCalendar/CalendarBodyMainRow';
import { getMouseSelectedCalendar } from '@/components/domains/newCalendar/calendarUtils';
import { LEFT_WIDTH } from '@/const/const';
import { CalendarConfigContext } from '@/contexts/CalendarConfigContext';
import { CalendarContext } from '@/contexts/CalendarContext';
import dayjs from '@/libs/dayjs';
import React from 'react';
import { useWatch } from 'react-hook-form';

export const CalendarBodyMain: React.FC = () => {
  const { control, calendarEvents } = React.useContext(CalendarContext);
  const start = useWatch({ control, name: 'start' });
  const {
    config: { heightPerHour, divisionsPerHour },
  } = React.useContext(CalendarConfigContext);

  const [selectedStartDay, setSelectedStartDay] = React.useState<dayjs.Dayjs | null>(null);
  const [selectedEndDay, setSelectedEndDay] = React.useState<dayjs.Dayjs | null>(null);

  const [isDragging, setIsDragging] = React.useState<boolean>(false);

  const isMouseDownRef = React.useRef<boolean>(false);

  const calendarEventsInTimely = React.useMemo(
    () => calendarEvents.filter((event) => !!event.start?.dateTime && !!event.end?.dateTime),
    [calendarEvents]
  );

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const { xIndex } = getMouseSelectedCalendar(e, 7);
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
      const { xIndex } = getMouseSelectedCalendar(e, 7);
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
    <div>
      <div
        style={{ display: 'flex' }}
        onMouseMove={(e) => handleMouseMove(e)}
        onMouseDown={(e) => handleMouseDown(e)}
        onMouseUp={handleMouseUp}
      >
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
              isDragging={isDragging}
              selectedStartDay={selectedStartDay}
              selectedEndDay={selectedEndDay}
              start={dayjs(start)}
              calendarEventsInTimely={calendarEventsInTimely}
              divisionsPerHour={divisionsPerHour}
              heightPerHour={heightPerHour}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
