import styles from './Calendar.module.scss';
import React, { useState } from 'react';

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<
    { day: number; startHour: number; endHour: number; title: string }[]
  >([]);

  const [dragging, setDragging] = useState<boolean>(false);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [endHour, setEndHour] = useState<number | null>(null);
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const calendarRef = React.useRef<HTMLDivElement>(null);

  /**
   * ドラッグ開始時の処理（マウスがセルをクリックしたときの処理）
   */
  const handleMouseDown = React.useCallback((day: number, hour: number) => {
    setDragging(true);
    setStartHour(hour);
    setEndHour(hour);
    setCurrentDay(day);
  }, []);

  const handleMouseMove = React.useCallback(
    (day: number, hour: number) => {
      if (dragging && day === currentDay) {
        console.log(hour);
        setEndHour(hour);
      }
    },
    [dragging, currentDay]
  );

  const handleMouseUp = React.useCallback(() => {
    if (dragging) {
      setDragging(false);
      if (startHour !== null && endHour !== null) {
        const title = prompt('Enter event title:');
        if (title !== null) {
          const newEvent = {
            day: currentDay ?? 1,
            startHour: Math.min(startHour, endHour),
            endHour: Math.max(startHour, endHour),
            title,
          };
          setEvents([...events, newEvent]);
        }
      }
      setStartHour(null);
      setEndHour(null);
      setCurrentDay(null);
    }
  }, [dragging, startHour, endHour, currentDay, events]);

  const handleTouchEnd = React.useCallback(handleMouseUp, [handleMouseUp]);

  const handleKeyDown = React.useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      // Reset dragging state if ESC is pressed
      setDragging(false);
      setStartHour(null);
      setEndHour(null);
      setCurrentDay(null);
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
      <div className={styles.day_column}>
        <div className={`${styles.time_cell} ${styles.time_label}`}></div>
        {[...Array(24)].map((_, hourIndex) => (
          <div key={hourIndex} className={`${styles.time_cell} ${styles.time_label}`}>
            <p>{hourIndex}</p>
          </div>
        ))}
      </div>
      {[...Array(7)].map((_, dayIndex) => (
        <div key={dayIndex} className={styles.day_column}>
          <div className={styles.time_cell}>
            <p>Day {dayIndex + 1}</p>
          </div>
          {[...Array(24)].map((_, hourIndex) => (
            <div
              key={hourIndex}
              className={`${styles.time_cell} ${
                dragging &&
                dayIndex === currentDay &&
                hourIndex >= Math.min(startHour!, endHour!) &&
                hourIndex <= Math.max(startHour!, endHour!)
                  ? styles.selected
                  : ''
              }`}
              onMouseDown={() => handleMouseDown(dayIndex, hourIndex)}
              onMouseMove={() => handleMouseMove(dayIndex, hourIndex)}
            >
              {/* ドラッグ中の要素のハイライト */}
              {dragging &&
                dayIndex === currentDay &&
                ((startHour! <= endHour! && hourIndex === startHour) ||
                  (startHour! > endHour! && hourIndex === endHour)) && (
                  <div
                    className={`${styles.selected} ${startHour! > endHour! ? styles.reverse : ''}`}
                    style={{
                      height: `${(Math.abs(endHour! - startHour!) + 1) * 100}%`,
                    }}
                  >
                    {Math.min(startHour!, endHour!)} ~ {Math.max(startHour!, endHour!)}
                  </div>
                )}

              {/* １イベントごとの表示 */}
              {events
                .filter((event) => event.day === dayIndex)
                .filter((event) => hourIndex === event.startHour)
                .map((event, i) => (
                  <div
                    key={i}
                    className={styles.event}
                    style={{
                      height: `${(event.endHour - hourIndex + 1) * 100}%`,
                    }}
                  >
                    {event.title} {event.startHour} ~ {event.endHour}
                  </div>
                ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Calendar;
