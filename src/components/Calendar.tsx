import dayjs from '@/libs/dayjs';
import styles from '@/components/Calendar.module.scss';
import React, { useState } from 'react';

/**
 * １時間を何分割するか
 * - 1: 1時間ごと
 * - 2: 30分ごと
 * - 3: 20分ごと
 * - 4: 15分ごと
 */
const DIVISIONS_PER_HOUR = 4 as const;

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
  const baseDate = dayjs('2024-08-01');
  const [events, setEvents] = useState<{ start: dayjs.Dayjs; end: dayjs.Dayjs; title: string }[]>(
    []
  );
  const [dragging, setDragging] = useState<boolean>(false);
  const [selectedStartDay, setSelectedStartDay] = useState<dayjs.Dayjs>(dayjs());
  const [selectedEndDay, setSelectedEndDay] = useState<dayjs.Dayjs>(dayjs());
  const calendarRef = React.useRef<HTMLDivElement>(null);

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

  const handleMouseUp = React.useCallback(() => {
    if (dragging) {
      setDragging(false);
      if (selectedStartDay && selectedEndDay) {
        const title = prompt('Enter event title:');
        if (title !== null) {
          const resultStartDay =
            selectedStartDay <= selectedEndDay ? selectedStartDay : selectedEndDay;

          const resultEndDay = (
            selectedStartDay > selectedEndDay ? selectedStartDay : selectedEndDay
          ).add(60 / DIVISIONS_PER_HOUR, 'minute');
          const newEvent = {
            start: resultStartDay,
            end: resultEndDay,
            title,
          };
          setEvents([...events, newEvent]);
        }
      }
    }
  }, [dragging, selectedStartDay, selectedEndDay, events]);

  const handleTouchEnd = React.useCallback(handleMouseUp, [handleMouseUp]);

  const handleKeyDown = React.useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      // Reset dragging state if ESC is pressed
      setDragging(false);
    }
  }, []);

  React.useEffect(() => {
    // Add event listener for keydown
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div
      className={styles.calendar}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleTouchEnd}
      ref={calendarRef}
    >
      <div
        className={styles.day_column}
        style={{
          gridTemplateRows: `repeat(${24 * DIVISIONS_PER_HOUR + 1}, ${40 / DIVISIONS_PER_HOUR}px)`,
        }}
      >
        {/* <div className={`${styles.time_cell} ${styles.time_label}`}></div> */}
        {[...Array(24 * DIVISIONS_PER_HOUR)].map((_, hourIndex) => (
          <div key={hourIndex} className={`${styles.time_cell} ${styles.time_label}`}>
            {
              // 15分ごとに表示
              hourIndex % DIVISIONS_PER_HOUR === 0 && (
                <p>{generateTime(dayjs(), hourIndex).format('HH:mm')}</p>
              )
            }
          </div>
        ))}
      </div>
      {[...Array(7)].map((_, dayIndex) => {
        const day = baseDate.add(dayIndex, 'day');
        return (
          <div
            key={dayIndex}
            className={styles.day_column}
            style={{
              gridTemplateRows: `repeat(${24 * DIVISIONS_PER_HOUR + 1}, ${
                40 / DIVISIONS_PER_HOUR
              }px)`,
            }}
          >
            <div className={styles.time_cell}>
              <p>{day.format('ddd')}</p>
              <p>{day.format('D')}</p>
            </div>

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
                          height: `${
                            (calculateIndexDifference(event.start, event.end) + 1) * 100
                          }%`,
                        }}
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
        );
      })}
    </div>
  );
};

export default Calendar;
