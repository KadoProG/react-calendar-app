interface CalendarEvent {
  id?: string;
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
  title: string;
  isAllDayEvent: boolean;
}

interface CalendarConfig {
  /**
   * １時間を何分割するか
   * - 1: 1時間ごと
   * - 2: 30分ごと
   * - 3: 20分ごと
   * - 4: 15分ごと
   */
  divisionsPerHour: number;
  /**
   * １時間あたりの高さ
   */
  heightPerHour: number;
  /**
   * １画面の表示数
   */
  weekDisplayCount: number;
}
