import React from 'react';
import { Button } from '@/components/common/button/Button';
import { CalendarConfigContext } from '@/contexts/CalendarConfigContext';
import styles from '@/components/domains/CalendarHeader.module.scss';

interface CalenadarHeaderProps {
  setFixedContentHeight: (height: number) => void;
}

/**
 * カレンダーのヘッダー部分
 */
export const CalendarHeader: React.FC<CalenadarHeaderProps> = (props) => {
  const fixedContentRef = React.useRef<HTMLDivElement>(null);

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
      </div>
      <div
        className={styles.fixedContent__row}
        style={{ gridTemplateColumns: `repeat(${config.weekDisplayCount + 1}, 1fr)` }}
      >
        {[...Array(config.weekDisplayCount + 1)].map((_, dayIndex) => {
          if (dayIndex === 0) return <div key={dayIndex}></div>;
          const day = baseDate.add(dayIndex - 1, 'day');
          return (
            <div key={dayIndex} className={styles.fixedContent__row__column}>
              <p>{day.format('ddd')}</p>
              <p>{day.format('D')}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
