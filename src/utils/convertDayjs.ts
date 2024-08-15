import dayjs from '@/libs/dayjs';

interface SplitedCalendarEvent extends CalendarEvent {
  splitStart: dayjs.Dayjs;
  splitEnd: dayjs.Dayjs;
}

/**
 * カレンダーイベントの配列を受け取り、日付をまたぐイベントを分割して返す
 */
export const splitCalendarEvents = (events: CalendarEvent[]): SplitedCalendarEvent[] => {
  const result: SplitedCalendarEvent[] = [];

  events.forEach((event) => {
    const { start, end } = event;

    if (end < start) throw new Error('Invalid date range');

    // 同じ日の場合はそのまま結果に追加
    if (start.isSame(end, 'day')) {
      result.push({ ...event, splitStart: start, splitEnd: end });
    } else {
      // 日付をまたぐ場合
      let currentStart = start;
      let currentEnd = currentStart;
      while (!currentStart.isSame(end, 'day')) {
        currentEnd = currentStart.endOf('day'); // その日の終了時刻までに設定
        result.push({
          ...event,
          splitStart: currentStart,
          splitEnd: currentEnd,
        });

        // 翌日の00:00に開始時刻を更新
        currentStart = currentStart.add(1, 'day').startOf('day');
      }

      // 最後の日のイベントを追加
      result.push({
        ...event,
        splitStart: currentStart,
        splitEnd: end,
      });
    }
  });

  return result;
};
