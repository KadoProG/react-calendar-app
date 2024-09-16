import dayjs from '@/libs/dayjs';
import React from 'react';
import { CalendarHeader } from '@/components/domains/newCalendar/CalendarHeader';
import { CalendarBodyTop } from '@/components/domains/newCalendar/CalendarBodyTop';
import { CalendarBodyMain } from '@/components/domains/newCalendar/CalendarBodyMain';
import { CalendarContext } from '@/contexts/CalendarContext';
import { useCalendarDragAndDrop } from '@/components/domains/newCalendar/useCalendarDragAndDrop';

export const NewCalendar: React.FC = () => {
  const { control, calendarEvents, config, start } = React.useContext(CalendarContext);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [topHeight, setTopHeight] = React.useState<number>(0);

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    selectedStartDay,
    selectedEndDay,
    isDragging,
    dragEventItem,
    isMouseDownRef,
  } = useCalendarDragAndDrop(scrollRef, topHeight, start, calendarEvents, config);

  return (
    <div style={{ height: '100svh', display: 'flex', flexDirection: 'column' }}>
      <CalendarHeader control={control} config={config} />

      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        {dayjs(start).isValid() && (
          <>
            <CalendarBodyTop
              start={start}
              setTopHeight={setTopHeight}
              selectedStartDay={selectedStartDay}
              selectedEndDay={selectedEndDay}
              isDragging={isDragging && isMouseDownRef.current === 'allday'}
              config={config}
              calendarEvents={calendarEvents}
            />
            <div
              ref={scrollRef}
              style={{ height: '100%', overflow: 'scroll', position: 'relative' }}
            >
              <CalendarBodyMain
                start={start}
                selectedStartDay={selectedStartDay}
                selectedEndDay={selectedEndDay}
                isDragging={isDragging && isMouseDownRef.current === 'timely'}
                config={config}
                calendarEvents={calendarEvents}
                dragEventItem={dragEventItem}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
