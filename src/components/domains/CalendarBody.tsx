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
  const { calendarEvents, updateCalendarEvent } = React.useContext(CalendarEventContext);
  const { addKeyDownEvent, removeKeyDownEvent } = React.useContext(KeyDownContext);

  const positionRef = React.useRef<DOMRect | null>(null);

  const [dragging, setDragging] = React.useState<boolean>(false);
  const [selectedStartDay, setSelectedStartDay] = React.useState<dayjs.Dayjs>(dayjs());
  const [selectedEndDay, setSelectedEndDay] = React.useState<dayjs.Dayjs>(dayjs());
  const isMouseDownRef = React.useRef<boolean>(false);

  const dragCalendarEventRef = React.useRef<{
    calendarEvent: CalendarEvent;
    yIndex: number;
  } | null>(null);

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
      positionRef.current = rect;
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

      if (dragCalendarEventRef.current) {
        const rect = e.currentTarget.getBoundingClientRect();
        const index =
          Math.floor(((e.clientY - rect.top) / rect.height) * (24 * config.divisionsPerHour)) -
          dragCalendarEventRef.current.yIndex;

        const dayStart = generateTime(day, index, config.divisionsPerHour);

        const diff =
          dragCalendarEventRef.current.calendarEvent.end -
          dragCalendarEventRef.current.calendarEvent.start;

        const dayEnd = dayStart.add(diff).add(-60 / config.divisionsPerHour, 'minute');

        setSelectedStartDay(dayStart);
        setSelectedEndDay(dayEnd);
      } else {
        const rect = e.currentTarget.getBoundingClientRect();
        const dayStart = generateTime(
          day,
          Math.floor(((e.clientY - rect.top) / rect.height) * (24 * config.divisionsPerHour)),
          config.divisionsPerHour
        );

        setSelectedEndDay(dayStart);
      }
    },
    [config.divisionsPerHour]
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

    if (dragCalendarEventRef.current) {
      updateCalendarEvent(dragCalendarEventRef.current.calendarEvent.id, {
        start: resultStartDay,
        end: resultEndDay,
      });

      dragCalendarEventRef.current = null;
    } else {
      await openDialog({
        type: 'add',
        init: {
          start: resultStartDay,
          end: resultEndDay,
        },
        position: positionRef.current,
      });
    }

    setDragging(false);
    isMouseDownRef.current = false;
  }, [
    dragging,
    openDialog,
    selectedStartDay,
    selectedEndDay,
    config.divisionsPerHour,
    updateCalendarEvent,
  ]);

  /** イベントクリック時の処理（編集ダイアログが立ち上がります） */
  const handleEventClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, id: CalendarEvent['id']) => {
      openDialog({ type: 'edit', id, position: e.currentTarget.getBoundingClientRect() });
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

  const splitedSelectedCalendarEvent = React.useMemo(
    () =>
      dragging
        ? splitCalendarEvents([
            {
              id: '1',
              title: '',
              start: selectedStartDay,
              end: selectedEndDay,
              isAllDayEvent: false,
            },
          ])
        : undefined,
    [selectedStartDay, selectedEndDay, dragging]
  );

  const handleEventMouseDown = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, id: CalendarEvent['id']) => {
      e.stopPropagation();
      setSelectedStartDay(dayjs(calendarEvents.find((event) => event.id === id)?.start));
      setSelectedEndDay(dayjs(calendarEvents.find((event) => event.id === id)?.end));
      isMouseDownRef.current = true;
      const rect = e.currentTarget.getBoundingClientRect();
      const yIndex = Math.floor(
        ((e.clientY - rect.top) / config.heightPerHour) * config.divisionsPerHour
      );

      const calendarEvent = calendarEvents.find((event) => event.id === id);
      if (!calendarEvent) return;
      dragCalendarEventRef.current = { calendarEvent, yIndex };
    },
    [calendarEvents, config.heightPerHour, config.divisionsPerHour]
  );

  return (
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

              const sameDayContentEvent = splitedSelectedCalendarEvent?.find(
                (event) => dayStart.format('YYYY-MM-DD') === event.splitStart.format('YYYY-MM-DD')
              );

              return (
                <div
                  key={hourIndex}
                  className={`${styles.time_cell} ${sameDayContentEvent ? styles.selected : ''} ${
                    (hourIndex + 1) % config.divisionsPerHour === 0 ? styles.drawLine : ''
                  }`}
                />
              );
            })}

            {splitedSelectedCalendarEvent
              ?.filter(
                (event) => day.format('YYYY-MM-DD') === event.splitStart.format('YYYY-MM-DD')
              )
              .map((event, i) => {
                const sizeIndex =
                  Math.abs(
                    calculateIndexDifference(
                      event.splitStart,
                      event.splitEnd,
                      config.divisionsPerHour
                    )
                  ) + 1;

                return (
                  <div
                    key={i}
                    className={styles.selectedItem}
                    style={{
                      top: `${(calculateIndexDifference(day.startOf('day'), event.splitStart, config.divisionsPerHour) * config.heightPerHour) / config.divisionsPerHour}px`,
                      height: `${(sizeIndex * config.heightPerHour) / config.divisionsPerHour}px`,
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
                  onMouseDown={(e) => handleEventMouseDown(e, event.id)}
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
  );
};
