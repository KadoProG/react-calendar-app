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
 * @param {dayjs.Dayjs} start - 開始日 (dayjsオブジェクト)
 * @param {dayjs.Dayjs} end - 終了日 (dayjsオブジェクト)
 * @param {string} rangeType - 範囲の種類 ('day', 'month', 'year')
 * @returns {string} フォーマットされた日付範囲
 */
export const formatDateRange = (
  start: dayjs.Dayjs,
  end: dayjs.Dayjs,
  rangeType: 'day' | 'month' | 'year'
): string => {
  const startDate = dayjs(start);
  const endDate = dayjs(end);

  switch (rangeType) {
    case 'day':
      // 日単位で範囲を表示
      if (startDate.isSame(endDate, 'day')) {
        return startDate.format('YYYY年MM月DD日');
      }
      if (startDate.isSame(endDate, 'month')) {
        return `${startDate.format('YYYY年MM月DD')}〜${endDate.format('DD日')}`;
      }
      if (startDate.isSame(endDate, 'year')) {
        return `${startDate.format('YYYY年MM月DD日')}〜${endDate.format('MM月DD日')}`;
      }
      return `${startDate.format('YYYY年MM月DD日')}〜${endDate.format('YYYY年MM月DD日')}`;

    case 'month':
      // 月単位で範囲を表示
      if (startDate.isSame(endDate, 'month')) {
        return startDate.format('YYYY年MM月');
      }
      if (startDate.isSame(endDate, 'year')) {
        return `${startDate.format('YYYY年MM')}〜${endDate.format('MM月')}`;
      }
      return `${startDate.format('YYYY年MM月')}〜${endDate.format('YYYY年MM月')}`;

    case 'year':
      // 年単位で範囲を表示
      if (startDate.isSame(endDate, 'year')) {
        return startDate.format('YYYY年');
      }
      return `${startDate.format('YYYY')}〜${endDate.format('YYYY年')}`;

    default:
      // デフォルトは月単位でフォーマット
      if (startDate.isSame(endDate, 'month')) {
        return startDate.format('YYYY年MM月');
      }
      if (startDate.isSame(endDate, 'year')) {
        return `${startDate.format('YYYY年MM月')}〜${endDate.format('MM月')}`;
      }
      return `${startDate.format('YYYY年MM月')}〜${endDate.format('YYYY年MM月')}`;
  }
};
