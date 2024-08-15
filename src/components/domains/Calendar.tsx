import dayjs from '@/libs/dayjs';
import styles from '@/components/domains/Calendar.module.scss';
import React from 'react';
import { Button } from '@/components/common/button/Button';
import { v4 as uuidv4 } from 'uuid';
import { CalendarConfigFormDialogContext } from '@/contexts/CalendarConfigFormDialogContext';
import { KeyDownContext } from '@/contexts/KeyDownContext';
import { CalendarEventContext } from '@/contexts/CalendarEventContext';
import { splitCalendarEvents } from '@/utils/convertDayjs';

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

/**
 * １画面の表示数
 */
const WEEK_DISPLAY_COUNT = 7 as const;

const generateTime = (day: dayjs.Dayjs, index: number) => {
  const minutesPerDivision = 60 / DIVISIONS_PER_HOUR;
  const totalMinutes = index * minutesPerDivision;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return day.startOf('day').add(hours, 'hour').add(minutes, 'minute');
};

const calculateIndexDayjs = (day: dayjs.Dayjs) => {
  const minutesPerDivision = 60 / DIVISIONS_PER_HOUR;
  const totalMinutes = day.diff(day.startOf('day'), 'minute');
  const index = Math.round(totalMinutes / minutesPerDivision);

  return index;
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

  const [baseDate, setBaseDate] = React.useState<dayjs.Dayjs>(dayjs('2024-07-28'));
  const { calendarEvents, addCalendarEvent, updateCalendarEvent, removeCalendarEvent } =
    React.useContext(CalendarEventContext);

  const [dragging, setDragging] = React.useState<boolean>(false);
  const [selectedStartDay, setSelectedStartDay] = React.useState<dayjs.Dayjs>(dayjs());
  const [selectedEndDay, setSelectedEndDay] = React.useState<dayjs.Dayjs>(dayjs());

  const { addKeyDownEvent, removeKeyDownEvent } = React.useContext(KeyDownContext);

  const handleBasePrev = React.useCallback(() => {
    setBaseDate(baseDate.add(-WEEK_DISPLAY_COUNT, 'day'));
  }, [baseDate]);

  const handleBaseNext = React.useCallback(() => {
    setBaseDate(baseDate.add(WEEK_DISPLAY_COUNT, 'day'));
  }, [baseDate]);

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
    ).add(60 / DIVISIONS_PER_HOUR, 'minute');

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
  }, [dragging, selectedStartDay, selectedEndDay, openDialog, addCalendarEvent]);

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
            gridTemplateColumns: `repeat(${WEEK_DISPLAY_COUNT + 1}, 1fr)`,
          }}
        >
          {[...Array(WEEK_DISPLAY_COUNT + 1)].map((_, dayIndex) => {
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
      <div
        className={styles.calendar}
        onMouseUp={handleMouseUp}
        style={{
          gridTemplateColumns: `repeat(${WEEK_DISPLAY_COUNT + 1}, 1fr)`,
          paddingTop: fixedContentHeight,
        }}
      >
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

        {/* Week→１日ごとの表示 */}
        {[...Array(WEEK_DISPLAY_COUNT)].map((_, dayIndex) => {
          const day = baseDate.add(dayIndex, 'day');
          return (
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
                      top: `${(calculateIndexDayjs(event.splitStart) * 40) / DIVISIONS_PER_HOUR}px`,
                      height: `${(calculateIndexDifference(event.splitStart, event.splitEnd) * 40) / DIVISIONS_PER_HOUR}px`,
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
