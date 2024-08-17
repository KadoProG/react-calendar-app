import React from 'react';
import { Button } from '@/components/common/button/Button';
import { CalendarConfigContext } from '@/contexts/CalendarConfigContext';
import styles from '@/components/domains/CalendarHeader.module.scss';
import { CalendarHeaderDayRows } from '@/components/domains/CalendarHeaderDayRows';
import { CalendarConfigFormDialogContext } from '@/contexts/CalendarConfigFormDialogContext';

interface CalenadarHeaderProps {
  setFixedContentHeight: (height: number) => void;
}

/**
 * カレンダーのヘッダー部分
 */
export const CalendarHeader: React.FC<CalenadarHeaderProps> = (props) => {
  const { openDialog } = React.useContext(CalendarConfigFormDialogContext);
  const { config, baseDate, setBaseDate } = React.useContext(CalendarConfigContext);

  const fixedContentRef = React.useRef<HTMLDivElement>(null);

  /** ベースの日付の変更（前） */
  const handleBasePrev = React.useCallback(() => {
    setBaseDate(baseDate.add(-config.weekDisplayCount, 'day'));
  }, [baseDate, config.weekDisplayCount, setBaseDate]);

  /** ベースの日付の変更（次） */
  const handleBaseNext = React.useCallback(() => {
    setBaseDate(baseDate.add(config.weekDisplayCount, 'day'));
  }, [baseDate, config.weekDisplayCount, setBaseDate]);

  /** カレンダーの追加（関数呼び出し） */
  const handleAddCalendar = React.useCallback(() => {
    openDialog({ type: 'add' });
  }, [openDialog]);

  /** 高さの更新 */
  const updateHeight = React.useCallback(() => {
    if (fixedContentRef.current) {
      props.setFixedContentHeight(fixedContentRef.current.clientHeight);
    }
  }, [props]);

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
