import React from 'react';
import { Button } from '@/components/common/button/Button';
import { CalendarConfigContext } from '@/contexts/CalendarConfigContext';
import styles from '@/components/domains/CalendarHeader.module.scss';
import { CalendarHeaderDayRows } from '@/components/domains/CalendarHeaderDayRows';
import { CalendarConfigFormDialogContext } from '@/contexts/CalendarConfigFormDialogContext';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { CalendarEventContext } from '@/contexts/CalendarEventContext';

interface CalenadarHeaderProps {
  setFixedContentHeight: (height: number) => void;
}

/**
 * カレンダーのヘッダー部分
 */
export const CalendarHeader: React.FC<CalenadarHeaderProps> = (props) => {
  const fixedContentRef = React.useRef<HTMLDivElement>(null);
  const { openDialog } = React.useContext(CalendarConfigFormDialogContext);
  const { addCalendarEvent } = React.useContext(CalendarEventContext);

  const { config, baseDate, setBaseDate } = React.useContext(CalendarConfigContext);

  const handleBasePrev = React.useCallback(() => {
    setBaseDate(baseDate.add(-config.weekDisplayCount, 'day'));
  }, [baseDate, config.weekDisplayCount, setBaseDate]);

  const handleBaseNext = React.useCallback(() => {
    setBaseDate(baseDate.add(config.weekDisplayCount, 'day'));
  }, [baseDate, config.weekDisplayCount, setBaseDate]);

  const updateHeight = React.useCallback(() => {
    if (fixedContentRef.current) {
      props.setFixedContentHeight(fixedContentRef.current.clientHeight);
    }
  }, [props]);

  const handleAddCalendar = React.useCallback(async () => {
    const newCalendarEvent: CalendarEvent = {
      id: uuidv4(),
      title: '',
      start: dayjs().startOf('hour').add(1, 'hour'),
      end: dayjs().startOf('hour').add(2, 'hour'),
      isAllDayEvent: false,
    };
    const result = await openDialog(newCalendarEvent);
    if (result.type === 'save') {
      addCalendarEvent(result.calendarEvent ?? newCalendarEvent);
    }
  }, [openDialog, addCalendarEvent]);

  React.useEffect(() => {
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, [updateHeight]);

  return (
    <div className={styles.fixedContent} ref={fixedContentRef}>
      <div style={{ display: 'flex', gap: 4 }}>
        <p>８月上旬の予定</p>
        <Button onClick={handleBasePrev}>＜</Button>
        <Button onClick={handleBaseNext}>＞</Button>
        <Button onClick={handleAddCalendar}>＋カレンダーを追加する</Button>
      </div>
      <CalendarHeaderDayRows />
    </div>
  );
};
