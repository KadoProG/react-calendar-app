import dayjs from '@/libs/dayjs';
import styles from '@/components/domains/Calendar.module.scss';
import React, { useState } from 'react';
import { Button } from '@/components/common/button/Button';
import { v4 as uuidv4 } from 'uuid';
import { CalendarConfigFormDialogContext } from '@/contexts/CalendarConfigFormDialogContext';
import { KeyDownContext } from '@/contexts/KeydownContext';

/**
 * １時間を何分割するか
 * - 1: 1時間ごと
 * - 2: 30分ごと
 * - 3: 20分ごと
 * - 4: 15分ごと
 */
const DIVISIONS_PER_HOUR = 4 as const;

/**
 * １時間あたりの高さ
 */
const HEIGHT_PER_HOUR = 40 as const;

const generateTime = (day: dayjs.Dayjs, index: number) => {
  const minutesPerDivision = 60 / DIVISIONS_PER_HOUR;
  const totalMinutes = index * minutesPerDivision;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return day.startOf('day').add(hours, 'hour').add(minutes, 'minute');
};

const calculateIndexDifference = (startTime: dayjs.Dayjs, endTime: dayjs.Dayjs) => {
  // 2つの日時の差を分単位で取得
  const differenceInMinutes = endTime.diff(startTime, 'minute');

  // 1インデックスあたりの分数を計算
  const minutesPerDivision = 60 / DIVISIONS_PER_HOUR;

  // インデックスの差を計算
  const indexDifference = Math.round(differenceInMinutes / minutesPerDivision);

  return indexDifference;
};

const Calendar: React.FC = () => {
  const { openDialog } = React.useContext(CalendarConfigFormDialogContext);

  const [baseDate, setBaseDate] = useState<dayjs.Dayjs>(dayjs('2024-07-28'));
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [dragging, setDragging] = useState<boolean>(false);
  const [selectedStartDay, setSelectedStartDay] = useState<dayjs.Dayjs>(dayjs());
  const [selectedEndDay, setSelectedEndDay] = useState<dayjs.Dayjs>(dayjs());

  const { addKeyDownEvent } = React.useContext(KeyDownContext);
  addKeyDownEvent('Escape', () => setDragging(false));

  const handleBasePrev = React.useCallback(() => {
    setBaseDate(baseDate.add(-7, 'day'));
  }, [baseDate]);

  const handleBaseNext = React.useCallback(() => {
    setBaseDate(baseDate.add(7, 'day'));
  }, [baseDate]);

  /**
   * ドラッグ開始時の処理（マウスがセルをクリックしたときの処理）
   */
  const handleMouseDown = React.useCallback((day: dayjs.Dayjs) => {
    setDragging(true);
    setSelectedStartDay(day);
    setSelectedEndDay(day);
  }, []);

  const handleMouseMove = React.useCallback(
    (day: dayjs.Dayjs) => {
      if (dragging && day.format('YYYY-MM-DD') === selectedStartDay?.format('YYYY-MM-DD')) {
        setSelectedEndDay(day);
      }
    },
    [dragging, selectedStartDay]
  );

  const handleMouseUp = React.useCallback(async () => {
    if (!dragging) return;

    const resultStartDay = selectedStartDay <= selectedEndDay ? selectedStartDay : selectedEndDay;
    const resultEndDay = (
      selectedStartDay > selectedEndDay ? selectedStartDay : selectedEndDay
    ).add(60 / DIVISIONS_PER_HOUR, 'minute');

    const newEvent = {
      id: uuidv4(),
      start: resultStartDay,
      end: resultEndDay,
      title: '',
    };

    const result = await openDialog(newEvent);

    if (result.type === 'save') {
      setEvents([...events, result.calendarEvent ?? newEvent]);
    }

    setDragging(false);
  }, [dragging, selectedStartDay, selectedEndDay, events, openDialog]);

  // const handleKeyDown = React.useCallback((event: KeyboardEvent) => {
  //   if (event.key === 'Escape') {
  //     // Reset dragging state if ESC is pressed
  //     setDragging(false);
  //   }
  // }, []);

  const handleEventClick = React.useCallback(
    async (e: React.MouseEvent, event: CalendarEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const result = await openDialog(event);
      if (result.type === 'save') {
        setEvents((prev) =>
          prev.map((e) => (e.id === event.id ? result.calendarEvent ?? event : e))
        );
      } else if (result.type === 'delete') {
        setEvents(events.filter((e) => e.id !== event.id));
      }
    },
    [events, openDialog]
  );

  // React.useEffect(() => {
  //   // Add event listener for keydown
  //   window.addEventListener('keydown', handleKeyDown);

  //   // Cleanup event listener on component unmount
  //   return () => {
  //     window.removeEventListener('keydown', handleKeyDown);
  //   };
  // }, [handleKeyDown]);

  return (
    <div style={{ overflow: 'scroll', height: '100%' }}>
      <div className={styles.fixedContent}>
        {/* 上部のヘッダ */}
        <div style={{ display: 'flex', gap: 4 }}>
          <p>８月上旬の予定</p>
          <Button onClick={handleBasePrev}>＜</Button>
          <Button onClick={handleBaseNext}>＞</Button>
        </div>

        {/* 日付・曜日の表示 */}
        <div
          style={{
            display: 'grid',
            width: '100%',
            gridTemplateColumns: 'repeat(8, 1fr)',
          }}
        >
          {[...Array(8)].map((_, dayIndex) => {
            if (dayIndex === 0) {
              return <div key={dayIndex}></div>;
            }
            const day = baseDate.add(dayIndex, 'day');
            return (
              <div key={dayIndex} style={{ textAlign: 'center' }}>
                <p>{day.format('ddd')}</p>
                <p>{day.format('D')}</p>
                {/* <p>既存の予定</p> */}
              </div>
            );
          })}
        </div>
      </div>

      {/* ここからカレンダー本体 */}
      <div className={styles.calendar} onMouseUp={handleMouseUp}>
        <div
          className={styles.day_column}
          style={{
            gridTemplateRows: `repeat(${24 * DIVISIONS_PER_HOUR}, ${
              HEIGHT_PER_HOUR / DIVISIONS_PER_HOUR
            }px)`,
          }}
        >
          {/* 時刻の表示 */}
          {[...Array(24 * DIVISIONS_PER_HOUR)].map((_, hourIndex) => (
            <div key={hourIndex} className={`${styles.time_cell} ${styles.time_label}`}>
              {hourIndex % DIVISIONS_PER_HOUR === 0 && (
                <p>{generateTime(dayjs(), hourIndex).format('HH:mm')}</p>
              )}
            </div>
          ))}
        </div>
        {[...Array(7)].map((_, dayIndex) => (
          <div
            key={dayIndex}
            className={styles.day_column}
            style={{
              gridTemplateRows: `repeat(${24 * DIVISIONS_PER_HOUR}, ${
                HEIGHT_PER_HOUR / DIVISIONS_PER_HOUR
              }px)`,
            }}
          >
            {/* ユーザが触れる時刻の描写 */}
            {[...Array(24 * DIVISIONS_PER_HOUR)].map((_, hourIndex) => {
              const dayStart = generateTime(baseDate.add(dayIndex, 'day'), hourIndex);

              const isSameDayContent =
                dragging &&
                dayStart.format('YYYY-MM-DD') === selectedStartDay?.format('YYYY-MM-DD');

              const isSameContent =
                selectedStartDay! <= selectedEndDay!
                  ? isSameDayContent &&
                    dayStart.format('YYYY-MM-DD HH:mm') ===
                      selectedStartDay?.format('YYYY-MM-DD HH:mm')
                  : isSameDayContent &&
                    dayStart.format('YYYY-MM-DD HH:mm') ===
                      selectedEndDay?.format('YYYY-MM-DD HH:mm');
              return (
                <div
                  key={hourIndex}
                  className={`${styles.time_cell} ${isSameDayContent ? styles.selected : ''} ${
                    (hourIndex + 1) % DIVISIONS_PER_HOUR === 0 ? styles.drawLine : ''
                  }`}
                  onMouseDown={() => handleMouseDown(dayStart)}
                  onMouseMove={() => handleMouseMove(dayStart)}
                >
                  {/* ドラッグ中の要素のハイライト */}
                  {isSameContent && (
                    <div
                      className={styles.selected}
                      style={{
                        height: `${
                          (Math.abs(calculateIndexDifference(selectedStartDay, selectedEndDay)) +
                            1) *
                          100
                        }%`,
                      }}
                    >
                      <p>
                        {(selectedStartDay <= selectedEndDay
                          ? selectedStartDay
                          : selectedEndDay
                        ).format('HH:mm')}
                        ~
                        {(selectedStartDay > selectedEndDay ? selectedStartDay : selectedEndDay)!
                          .add(60 / DIVISIONS_PER_HOUR, 'minute')
                          .format('HH:mm')}
                      </p>
                    </div>
                  )}

                  {/* １イベントごとの表示 */}
                  {events
                    .filter(
                      (event) =>
                        dayStart.format('YYYY-MM-DD HH:mm') ===
                        event.start.format('YYYY-MM-DD HH:mm')
                    )
                    .map((event, i) => (
                      <div
                        key={i}
                        className={styles.event}
                        style={{
                          height: `${calculateIndexDifference(event.start, event.end) * 100}%`,
                        }}
                        onMouseDown={(e) => handleEventClick(e, event)}
                      >
                        <p>{event.start.format('HH:mm')}</p>
                        <p>~{event.end.format('HH:mm')}</p>
                        <p>{event.title}</p>
                      </div>
                    ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
