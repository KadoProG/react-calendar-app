import dayjs from '@/libs/dayjs';
import styles from '@/components/domains/Calendar.module.scss';
import React from 'react';
import { CalendarConfigFormDialogContext } from '@/contexts/CalendarConfigFormDialogContext';
import { KeyDownContext } from '@/contexts/KeyDownContext';
import { CalendarEventContext } from '@/contexts/CalendarEventContext';
import { calculateIndexDifference, generateTime, splitCalendarEvents } from '@/utils/convertDayjs';
import { CalendarConfigContext } from '@/contexts/CalendarConfigContext';
import { CalendarHeader } from '@/components/domains/CalenadarHeader';

export const Calendar: React.FC = () => {
  const { config, baseDate } = React.useContext(CalendarConfigContext);
  const { openDialog } = React.useContext(CalendarConfigFormDialogContext);
  const { calendarEvents } = React.useContext(CalendarEventContext);
  const { addKeyDownEvent, removeKeyDownEvent } = React.useContext(KeyDownContext);

  const [dragging, setDragging] = React.useState<boolean>(false);
  const [selectedStartDay, setSelectedStartDay] = React.useState<dayjs.Dayjs>(dayjs());
  const [selectedEndDay, setSelectedEndDay] = React.useState<dayjs.Dayjs>(dayjs());

  const [fixedContentHeight, setFixedContentHeight] = React.useState<number>(0);

  /** ドラッグ開始時の処理（マウスがセルをクリックしたときの処理） */
  const handleMouseDown = React.useCallback((day: dayjs.Dayjs) => {
    setDragging(true);
    setSelectedStartDay(day);
    setSelectedEndDay(day);
  }, []);

  /** ドラッグ動作中の処理（マウスがセル上で動いているときの処理） */
  const handleMouseMove = React.useCallback(
    (day: dayjs.Dayjs) => {
      if (dragging && day.format('YYYY-MM-DD') === selectedStartDay?.format('YYYY-MM-DD')) {
        setSelectedEndDay(day);
      }
    },
    [dragging, selectedStartDay]
  );

  /** ドラッグ終了時の処理（マウスがセルのクリックから離れた場合の処理） */
  const handleMouseUp = React.useCallback(async () => {
    if (!dragging) return;

    const resultStartDay = selectedStartDay <= selectedEndDay ? selectedStartDay : selectedEndDay;
    const resultEndDay = (
      selectedStartDay > selectedEndDay ? selectedStartDay : selectedEndDay
    ).add(60 / config.divisionsPerHour, 'minute');

    await openDialog({
      type: 'add',
      init: {
        start: resultStartDay,
        end: resultEndDay,
        isAllDayEvent: false,
      },
    });

    setDragging(false);
  }, [dragging, openDialog, selectedStartDay, selectedEndDay, config.divisionsPerHour]);

  /** イベントクリック時の処理（編集ダイアログが立ち上がります） */
  const handleEventClick = React.useCallback(
    (e: React.MouseEvent, id: CalendarEvent['id']) => {
      e.preventDefault();
      openDialog({ type: 'edit', id });
    },
    [openDialog]
  );

  React.useEffect(() => {
    if (dragging) {
      addKeyDownEvent({ id: 0, key: 'Escape', callback: () => setDragging(false) });
    } else {
      removeKeyDownEvent(0);
    }
  }, [addKeyDownEvent, removeKeyDownEvent, dragging]);

  return (
    <div style={{ overflow: 'scroll', height: '100%' }}>
      <CalendarHeader setFixedContentHeight={setFixedContentHeight} />

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
                <p className={styles.noSelect}>
                  {generateTime(dayjs(), hourIndex, config.divisionsPerHour).format('HH:mm')}
                </p>
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
                const dayStart = generateTime(day, hourIndex, config.divisionsPerHour);

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
                  Math.abs(
                    calculateIndexDifference(
                      selectedStartDay,
                      selectedEndDay,
                      config.divisionsPerHour
                    )
                  ) + 1;

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
                        <small>
                          {(selectedStartDay <= selectedEndDay
                            ? selectedStartDay
                            : selectedEndDay
                          ).format('HH:mm')}
                          ~
                          {(selectedStartDay > selectedEndDay ? selectedStartDay : selectedEndDay)!
                            .add(60 / config.divisionsPerHour, 'minute')
                            .format('HH:mm')}
                        </small>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* １イベントごとの表示 */}
              {splitCalendarEvents(calendarEvents)
                .filter(
                  (event) =>
                    !event.isAllDayEvent &&
                    day.format('YYYY-MM-DD') === event.splitStart.format('YYYY-MM-DD')
                )
                .map((event, i) => (
                  <button
                    key={i}
                    className={styles.calendarEvent}
                    style={{
                      top: `${(calculateIndexDifference(day.startOf('day'), event.splitStart, config.divisionsPerHour) * config.heightPerHour) / config.divisionsPerHour}px`,
                      height: `${(calculateIndexDifference(event.splitStart, event.splitEnd, config.divisionsPerHour) * config.heightPerHour) / config.divisionsPerHour}px`,
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
