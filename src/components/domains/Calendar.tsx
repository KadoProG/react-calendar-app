import dayjs from '@/libs/dayjs';
import styles from '@/components/domains/Calendar.module.scss';
import React from 'react';
import { Button } from '@/components/common/button/Button';
import { v4 as uuidv4 } from 'uuid';
import { CalendarConfigFormDialogContext } from '@/contexts/CalendarConfigFormDialogContext';
import { KeyDownContext } from '@/contexts/KeyDownContext';
import { CalendarEventContext } from '@/contexts/CalendarEventContext';
import { splitCalendarEvents } from '@/utils/convertDayjs';
import { CalendarConfigContext } from '@/contexts/CalendarConfigContext';

const Calendar: React.FC = () => {
  const { config, baseDate, setBaseDate } = React.useContext(CalendarConfigContext);
  const { openDialog } = React.useContext(CalendarConfigFormDialogContext);

  const { calendarEvents, addCalendarEvent, updateCalendarEvent, removeCalendarEvent } =
    React.useContext(CalendarEventContext);

  const [dragging, setDragging] = React.useState<boolean>(false);
  const [selectedStartDay, setSelectedStartDay] = React.useState<dayjs.Dayjs>(dayjs());
  const [selectedEndDay, setSelectedEndDay] = React.useState<dayjs.Dayjs>(dayjs());

  const { addKeyDownEvent, removeKeyDownEvent } = React.useContext(KeyDownContext);

  const handleBasePrev = React.useCallback(() => {
    setBaseDate(baseDate.add(-config.weekDisplayCount, 'day'));
  }, [baseDate, config.weekDisplayCount, setBaseDate]);

  const handleBaseNext = React.useCallback(() => {
    setBaseDate(baseDate.add(config.weekDisplayCount, 'day'));
  }, [baseDate, config.weekDisplayCount, setBaseDate]);

  const generateTime = React.useCallback(
    (day: dayjs.Dayjs, index: number) => {
      const minutesPerDivision = 60 / config.divisionsPerHour;
      const totalMinutes = index * minutesPerDivision;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return day.startOf('day').add(hours, 'hour').add(minutes, 'minute');
    },
    [config.divisionsPerHour]
  );

  const calculateIndexDifference = React.useCallback(
    (startTime: dayjs.Dayjs, endTime: dayjs.Dayjs) => {
      // 2つの日時の差を分単位で取得
      const differenceInMinutes = endTime.diff(startTime, 'minute');

      // 1インデックスあたりの分数を計算
      const minutesPerDivision = 60 / config.divisionsPerHour;

      // インデックスの差を計算
      const indexDifference = Math.round(differenceInMinutes / minutesPerDivision);

      return indexDifference;
    },
    [config.divisionsPerHour]
  );

  const fixedContentRef = React.useRef<HTMLDivElement>(null);
  const [fixedContentHeight, setFixedContentHeight] = React.useState<number>(0);
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
    ).add(60 / config.divisionsPerHour, 'minute');

    const newEvent: CalendarEvent = {
      id: uuidv4(),
      start: resultStartDay,
      end: resultEndDay,
      title: '',
      isAllDayEvent: false,
    };

    const result = await openDialog(newEvent);

    if (result.type === 'save') {
      addCalendarEvent(result.calendarEvent ?? newEvent);
    }

    setDragging(false);
  }, [
    dragging,
    selectedStartDay,
    selectedEndDay,
    openDialog,
    addCalendarEvent,
    config.divisionsPerHour,
  ]);

  const handleEventClick = React.useCallback(
    async (e: React.MouseEvent, id: CalendarEvent['id']) => {
      e.preventDefault();
      const event = calendarEvents.find((event) => event.id === id);
      if (!event) return;
      const result = await openDialog(event);
      if (result.type === 'save') {
        updateCalendarEvent(event.id, result.calendarEvent ?? event);
      } else if (result.type === 'delete') {
        removeCalendarEvent(event.id);
      }
    },
    [openDialog, updateCalendarEvent, removeCalendarEvent, calendarEvents]
  );

  React.useEffect(() => {
    if (dragging) {
      addKeyDownEvent({ id: 0, key: 'Escape', callback: () => setDragging(false) });
    } else {
      removeKeyDownEvent(0);
    }
  }, [addKeyDownEvent, removeKeyDownEvent, dragging]);

  const updateHeight = React.useCallback(() => {
    if (fixedContentRef.current) {
      setFixedContentHeight(fixedContentRef.current.clientHeight);
    }
  }, []);

  React.useEffect(() => {
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, [updateHeight]);

  return (
    <div style={{ overflow: 'scroll', height: '100%' }}>
      <div className={styles.fixedContent} ref={fixedContentRef}>
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
            gridTemplateColumns: `repeat(${config.weekDisplayCount + 1}, 1fr)`,
          }}
        >
          {[...Array(config.weekDisplayCount + 1)].map((_, dayIndex) => {
            if (dayIndex === 0) {
              return <div key={dayIndex}></div>;
            }
            const day = baseDate.add(dayIndex - 1, 'day');
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
      <div
        className={styles.calendar}
        onMouseUp={handleMouseUp}
        style={{
          gridTemplateColumns: `repeat(${config.weekDisplayCount + 1}, 1fr)`,
          paddingTop: fixedContentHeight,
        }}
      >
        <div
          className={styles.day_column}
          style={{
            gridTemplateRows: `repeat(${24 * config.divisionsPerHour}, ${
              config.heightPerHour / config.divisionsPerHour
            }px)`,
          }}
        >
          {/* 時刻の表示 */}
          {[...Array(24 * config.divisionsPerHour)].map((_, hourIndex) => (
            <div key={hourIndex} className={`${styles.time_cell} ${styles.time_label}`}>
              {hourIndex % config.divisionsPerHour === 0 && (
                <p>{generateTime(dayjs(), hourIndex).format('HH:mm')}</p>
              )}
            </div>
          ))}
        </div>

        {/* Week→１日ごとの表示 */}
        {[...Array(config.weekDisplayCount)].map((_, dayIndex) => {
          const day = baseDate.add(dayIndex, 'day');
          return (
            <div
              key={dayIndex}
              className={styles.day_column}
              style={{
                gridTemplateRows: `repeat(${24 * config.divisionsPerHour}, ${
                  config.heightPerHour / config.divisionsPerHour
                }px)`,
              }}
            >
              {/* ユーザが触れる時刻の描写 */}
              {[...Array(24 * config.divisionsPerHour)].map((_, hourIndex) => {
                const dayStart = generateTime(day, hourIndex);

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

                const sizeIndex =
                  Math.abs(calculateIndexDifference(selectedStartDay, selectedEndDay)) + 1;

                return (
                  <div
                    key={hourIndex}
                    className={`${styles.time_cell} ${isSameDayContent ? styles.selected : ''} ${
                      (hourIndex + 1) % config.divisionsPerHour === 0 ? styles.drawLine : ''
                    }`}
                    onMouseDown={() => handleMouseDown(dayStart)}
                    onMouseMove={() => handleMouseMove(dayStart)}
                  >
                    {/* ドラッグ中の要素のハイライト */}
                    {isSameContent && (
                      <div
                        className={styles.selected}
                        style={{
                          top: 0,
                          height: `${sizeIndex * 100}%`,
                        }}
                      >
                        <p>
                          {(selectedStartDay <= selectedEndDay
                            ? selectedStartDay
                            : selectedEndDay
                          ).format('HH:mm')}
                          ~
                          {(selectedStartDay > selectedEndDay ? selectedStartDay : selectedEndDay)!
                            .add(60 / config.divisionsPerHour, 'minute')
                            .format('HH:mm')}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* １イベントごとの表示 */}
              {splitCalendarEvents(calendarEvents)
                .filter(
                  (event) => day.format('YYYY-MM-DD') === event.splitStart.format('YYYY-MM-DD')
                )
                .map((event, i) => (
                  <button
                    key={i}
                    className={styles.calendarEvent}
                    style={{
                      top: `${(calculateIndexDifference(day.startOf('day'), event.splitStart) * config.heightPerHour) / config.divisionsPerHour}px`,
                      height: `${(calculateIndexDifference(event.splitStart, event.splitEnd) * config.heightPerHour) / config.divisionsPerHour}px`,
                    }}
                    onClick={(e) => handleEventClick(e, event.id)}
                  >
                    <p>{event.start.format('HH:mm')}</p>
                    <p>~{event.end.format('HH:mm')}</p>
                    <p>{event.title}</p>
                  </button>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
