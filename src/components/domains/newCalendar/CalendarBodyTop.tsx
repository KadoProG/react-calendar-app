import dayjs from '@/libs/dayjs';
import { Button } from '@/components/common/button/Button';
import React from 'react';
import { CalendarBodyTopRow } from '@/components/domains/newCalendar/CalendarBodyTopRow';
import { LEFT_WIDTH } from '@/const/const';
import { CalendarMenuContext } from '@/components/domains/editMenu/CalendarMenuContext';

interface CalendarBodyTopProps {
  setTopHeight: React.Dispatch<React.SetStateAction<number>>;
  start: dayjs.Dayjs;
  calendarEvents: CalendarEventWithCalendarId[];
  selectedStartDay: dayjs.Dayjs | null;
  selectedEndDay: dayjs.Dayjs | null;
  isDragging: boolean;
  config: CalendarConfig;
  dragEventItem: { event: CalendarEventWithCalendarId; yDiff: number } | null;
}

export const CalendarBodyTop: React.FC<CalendarBodyTopProps> = (props) => {
  const { openMenu } = React.useContext(CalendarMenuContext);
  const ref = React.useRef<HTMLDivElement>(null);
  const calendarEventsInAllDay = React.useMemo(
    () => props.calendarEvents.filter((event) => !!event.start?.date && !!event.end?.date),
    [props.calendarEvents]
  );

  /** 高さの更新 */
  const updateHeight = React.useCallback(() => {
    if (ref.current) {
      props.setTopHeight(ref.current.clientHeight);
    }
  }, [props]);

  React.useEffect(() => {
    window.addEventListener('resize', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, [updateHeight]);

  React.useEffect(() => {
    updateHeight();
  }, [updateHeight]);

  const handleAddEvent = React.useCallback(() => {
    openMenu({
      anchorEl: ref.current,
      start: props.start.set('hour', 9),
      end: props.start.set('hour', 10),
      eventId: '',
      calendarId: '',
      summary: '',
    });
  }, [openMenu, props.start]);

  return (
    <div ref={ref} style={{ display: 'flex' }}>
      <div style={{ minWidth: LEFT_WIDTH }}>
        <Button
          style={{ padding: '2px 4px' }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={handleAddEvent}
        >
          ＋<br />
          新規
        </Button>
      </div>

      <div style={{ display: 'flex', width: '100%' }}>
        {Array.from({ length: props.config.weekDisplayCount }).map((_, i) => (
          <CalendarBodyTopRow
            key={i}
            start={props.start}
            calendarEventsInAllDay={calendarEventsInAllDay}
            i={i}
            selectedStartDay={props.selectedStartDay}
            selectedEndDay={props.selectedEndDay}
            isDragging={props.isDragging}
            config={props.config}
            dragEventItem={props.dragEventItem}
          />
        ))}
      </div>
    </div>
  );
};
