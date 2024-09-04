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
    const { start: tempStart, end: tempEnd } = event;

    const start = tempStart < tempEnd ? tempStart : tempEnd;
    const end = tempStart < tempEnd ? tempEnd : tempStart;

    if (start.isSame(end, 'day')) {
      result.push({ ...event, splitStart: start, splitEnd: end });
      return;
    }

    // 同じ日の場合はそのまま結果に追加
    if (start.isSame(end.add(-1, 'minute'), 'day')) {
      result.push({ ...event, splitStart: start, splitEnd: end });
    } else {
      // 日付をまたぐ場合
      let currentStart = start;
      let currentEnd = currentStart;
      while (!currentStart.isSame(end.add(-1, 'minute'), 'day')) {
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

export const generateTime = (day: dayjs.Dayjs, index: number, divisionsPerHour: number) => {
  const minutesPerDivision = 60 / divisionsPerHour;
  const totalMinutes = index * minutesPerDivision;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return day.startOf('day').add(hours, 'hour').add(minutes, 'minute');
};

export const calculateIndexDifference = (
  startTime: dayjs.Dayjs,
  endTime: dayjs.Dayjs,
  divisionsPerHour: number
) => {
  const differenceInMinutes = endTime.diff(startTime, 'minute');
  const minutesPerDivision = 60 / divisionsPerHour;
  const indexDifference = Math.round(differenceInMinutes / minutesPerDivision);

  return indexDifference;
};

/**
 * 日付範囲をフォーマットする関数
 *
 * @param {string} start - 開始日 (dayjsフォーマットの文字列)
 * @param {string} end - 終了日 (dayjsフォーマットの文字列)
 * @returns {string} フォーマットされた日付範囲
 */
export const formatDateRange = (start: dayjs.Dayjs, end: dayjs.Dayjs): string => {
  const startDate = dayjs(start);
  const endDate = dayjs(end);

  // 開始日と終了日が同じ月の場合
  if (startDate.isSame(endDate, 'month')) {
    return startDate.format('YYYY年MM月');
  }

  if (startDate.isSame(endDate, 'year')) {
    return `${startDate.format('YYYY年MM')}~${endDate.format('MM')}月`;
  }
  // 異なる月の場合
  return `${startDate.format('YYYY年MM月')}~${endDate.format('YYYY年MM月')}`;
};
