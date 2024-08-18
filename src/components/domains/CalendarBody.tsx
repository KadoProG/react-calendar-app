import dayjs from '@/libs/dayjs';
import styles from '@/components/domains/CalendarBody.module.scss';
import { CalendarConfigContext } from '@/contexts/CalendarConfigContext';
import { calculateIndexDifference, generateTime, splitCalendarEvents } from '@/utils/convertDayjs';
import React from 'react';
import { CalendarConfigFormDialogContext } from '@/contexts/CalendarConfigFormDialogContext';
import { CalendarEventContext } from '@/contexts/CalendarEventContext';
import { KeyDownContext } from '@/contexts/KeyDownContext';

interface CalendarBodyProps {
  fixedContentHeight: number;
}

export const CalendarBody: React.FC<CalendarBodyProps> = (props) => {
  const { config, baseDate } = React.useContext(CalendarConfigContext);
  const { openDialog } = React.useContext(CalendarConfigFormDialogContext);
  const { calendarEvents } = React.useContext(CalendarEventContext);
  const { addKeyDownEvent, removeKeyDownEvent } = React.useContext(KeyDownContext);

  const [dragging, setDragging] = React.useState<boolean>(false);
  const [selectedStartDay, setSelectedStartDay] = React.useState<dayjs.Dayjs>(dayjs());
  const [selectedEndDay, setSelectedEndDay] = React.useState<dayjs.Dayjs>(dayjs());
  const isMouseDownRef = React.useRef<boolean>(false);

  /** ドラッグ開始時の処理（マウスがセルをクリックしたときの処理） */
  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>, day: dayjs.Dayjs) => {
      // startDayの初期化
      const rect = e.currentTarget.getBoundingClientRect();
      const dayStart = generateTime(
        day,
        Math.floor(((e.clientY - rect.top) / rect.height) * (24 * config.divisionsPerHour)),
        config.divisionsPerHour
      );
      setSelectedStartDay(dayStart);
      setSelectedEndDay(dayStart);
      isMouseDownRef.current = true;
    },
    [config.divisionsPerHour]
  );

  /** ドラッグ動作中の処理（マウスがセル上で動いているときの処理） */
  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>, day: dayjs.Dayjs) => {
      if (!isMouseDownRef.current) return;
      setDragging(true);
      if (day.format('YYYY-MM-DD') === selectedStartDay.format('YYYY-MM-DD')) {
        const rect = e.currentTarget.getBoundingClientRect();
        const dayStart = generateTime(
          day,
          Math.floor(((e.clientY - rect.top) / rect.height) * (24 * config.divisionsPerHour)),
          config.divisionsPerHour
        );

        setSelectedEndDay(dayStart);
      }
    },
    [config.divisionsPerHour, selectedStartDay]
  );

  /** ドラッグ終了時の処理（マウスがセルのクリックから離れた場合の処理） */
  const handleMouseUp = React.useCallback(async () => {
    if (!dragging) {
      isMouseDownRef.current = false;
      return;
    }

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
    isMouseDownRef.current = false;
  }, [dragging, openDialog, selectedStartDay, selectedEndDay, config.divisionsPerHour]);

  /** イベントクリック時の処理（編集ダイアログが立ち上がります） */
  const handleEventClick = React.useCallback(
    (id: CalendarEvent['id']) => {
      openDialog({ type: 'edit', id });
    },
    [openDialog]
  );

  React.useEffect(() => {
    if (dragging) {
      addKeyDownEvent({
        id: 0,
        key: 'Escape',
        callback: () => {
          isMouseDownRef.current = false;
          setDragging(false);
        },
      });
    } else {
      removeKeyDownEvent(0);
    }
  }, [addKeyDownEvent, removeKeyDownEvent, dragging]);

  return (
    <>
      <div
        className={styles.calendar}
        onMouseUp={handleMouseUp}
        style={{
          gridTemplateColumns: `repeat(${config.weekDisplayCount + 1}, 1fr)`,
          paddingTop: props.fixedContentHeight,
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
              onMouseMove={(e) => handleMouseMove(e, day)}
              onMouseDown={(e) => handleMouseDown(e, day)}
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
                  dayStart.format('YYYY-MM-DD') === selectedStartDay.format('YYYY-MM-DD');

                const isSameContent =
                  selectedStartDay <= selectedEndDay
                    ? isSameDayContent &&
                      dayStart.format('YYYY-MM-DD HH:mm') ===
                        selectedStartDay.format('YYYY-MM-DD HH:mm')
                    : isSameDayContent &&
                      dayStart.format('YYYY-MM-DD HH:mm') ===
                        selectedEndDay.format('YYYY-MM-DD HH:mm');

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
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => handleEventClick(event.id)}
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
    </>
  );
};
