import dayjs from '@/libs/dayjs';
import { Button } from '@/components/common/button/Button';
import React from 'react';
import { CalendarBodyTopRow } from '@/components/domains/newCalendar/CalendarBodyTopRow';
import { LEFT_WIDTH } from '@/const/const';

interface CalendarBodyTopProps {
  setTopHeight: React.Dispatch<React.SetStateAction<number>>;
  start: dayjs.Dayjs;
  calendarEvents: (gapi.client.calendar.Event & { calendarId: string })[];
  selectedStartDay: dayjs.Dayjs | null;
  selectedEndDay: dayjs.Dayjs | null;
  isMouseDownRef: React.MutableRefObject<'allday' | 'timely' | null>;
  isDragging: boolean;
}

export const CalendarBodyTop: React.FC<CalendarBodyTopProps> = (props) => {
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

  return (
    <div ref={ref} style={{ display: 'flex', minHeight: 72 }}>
      <div style={{ minWidth: LEFT_WIDTH }}>
        <Button style={{ padding: '2px 4px' }}>
          ＋<br />
          新規
        </Button>
      </div>

      <div style={{ display: 'flex', width: '100%' }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <CalendarBodyTopRow
            key={i}
            start={props.start}
            calendarEventsInAllDay={calendarEventsInAllDay}
            i={i}
            selectedStartDay={props.selectedStartDay}
            selectedEndDay={props.selectedEndDay}
            isDragging={props.isDragging}
          />
        ))}
      </div>
    </div>
  );
};