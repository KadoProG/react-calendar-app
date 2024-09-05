import styles from '@/components/domains/newCalendar/CalendarBodyMainRow.module.scss';
import dayjs from '@/libs/dayjs';
import React from 'react';
interface CalendarBodyMainRowProps {
  start: dayjs.Dayjs;
  calendarEventsInTimely: (gapi.client.calendar.Event & { calendarId: string })[];
  i: number;
  selectedStartDay: dayjs.Dayjs | null;
  selectedEndDay: dayjs.Dayjs | null;
  isDragging: boolean;
  divisionsPerHour: number;
  heightPerHour: number;
}

/**
 * カレンダー時刻部分の１行を描写する
 */
export const CalendarBodyMainRow: React.FC<CalendarBodyMainRowProps> = (props) => {
  // index値から日付を取得
  const date = React.useMemo(
    () => dayjs(props.start).startOf('day').add(props.i, 'day'),
    [props.start, props.i]
  );

  // 終日予定のうち、その日に該当するものを取得
  const calendarEventsInTimelyInDay = React.useMemo(
    () =>
      props.calendarEventsInTimely.filter(
        (event) =>
          dayjs(event.start!.date).isSame(date, 'day') ||
          (props.i === 0 && dayjs(event.start!.date).isBefore(date, 'day'))
      ),
    [props.calendarEventsInTimely, date, props.i]
  );

  // 選択された日付と同じかどうか
  const isSame = React.useMemo(
    () => props.selectedStartDay && props.selectedStartDay.isSame(date, 'day'),
    [props.selectedStartDay, date]
  );

  // 選択された日付の差分
  const diff = React.useMemo(() => {
    if (!props.selectedStartDay || !props.selectedEndDay) return 0;
    return Math.abs(props.selectedEndDay.diff(props.selectedStartDay, 'day')) + 1;
  }, [props.selectedStartDay, props.selectedEndDay]);

  // 選択された日付の左位置（startからの日数、endがstartより前の場合のみ）
  const leftPosition = React.useMemo(() => {
    if (!props.selectedEndDay || props.selectedEndDay.isAfter(props.selectedStartDay)) return 0;
    return props.selectedEndDay.diff(props.selectedStartDay, 'day');
  }, [props.selectedStartDay, props.selectedEndDay]);

  // １日ずつ（Weekに対する列）の表示
  return (
    <div style={{ flex: 1, borderLeft: '1px solid var(--divider)' }}>
      {/* ユーザが触れる時刻の描写 */}
      {[...Array(24 * props.divisionsPerHour)].map((_, hourIndex) => {
        // const dayStart = date
        //   .startOf('day')
        //   .add(Math.floor(hourIndex / props.divisionsPerHour), 'hour');

        // const sameDayContentEvent = splitedSelectedCalendarEvent?.find(
        //   (event) => dayStart.format('YYYY-MM-DD') === event.splitStart.format('YYYY-MM-DD')
        // );

        console.log('test'); // eslint-disable-line no-console
        return (
          <div
            key={hourIndex}
            className={`${styles.timeCell} ${
              // sameDayContentEvent ? styles.selected : ''
              ''
            }
               ${(hourIndex + 1) % props.divisionsPerHour === 0 ? styles.drawLine : ''}`}
            style={{ height: props.heightPerHour / props.divisionsPerHour }}
          />
        );
      })}
      {calendarEventsInTimelyInDay.map((event) => {
        // const startDate = dayjs(event.start!.date);
        const endDate = dayjs(event.end!.date);
        const scheculeDiff = endDate.diff(dayjs(date), 'day');
        const overDiff = !(scheculeDiff + props.i < 7);
        const resultDiff = overDiff ? 7 - props.i : scheculeDiff + props.i;
        return (
          <div
            key={event.id}
            style={{
              position: 'absolute',
              top: 0,
              left: overDiff ? 0 : resultDiff * 100,
              width: overDiff ? 100 * (7 - props.i) : 100 * (scheculeDiff + 1),
              height: 24,
              backgroundColor: 'lightblue',
              border: '1px solid var(--divider)',
              zIndex: 1,
            }}
          >
            {event.summary}
          </div>
        );
      })}
      <div style={{ position: 'relative' }}>
        {isSame && props.isDragging && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: leftPosition * 100,
              width: diff * 100,
              height: 24,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              zIndex: 2,
            }}
          ></div>
        )}
      </div>
    </div>
  );
};
