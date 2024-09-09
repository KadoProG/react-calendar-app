interface User {
  name: string;
  email: string;
  imageUrl: string;
}

interface CalendarEvent {
  id?: string;
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
  title: string;
  isAllDayEvent: boolean;
}

interface CalendarConfig {
  /**
   * 1時間を何分割するか
   * - 1: 1時間ごと
   * - 2: 30分ごと
   * - 3: 20分ごと
   * - 4: 15分ごと
   */
  divisionsPerHour: number;
  /**
   * 1時間あたりの高さ
   */
  heightPerHour: number;
  /**
   * 1画面の表示数
   */
  weekDisplayCount: number;
  /**
   * カレンダーの開始タイミング
   */
  dateRangeStartTime: 'SunDay' | 'MonDay' | 'None';
}

/**
 * LocalStorageに保存するカレンダー情報
 */
type CalendarFeatLocalStorage = gapi.client.calendar.CalendarListEntry & {
  hasValid: boolean;
};

/**
 * カレンダーイベント
 */
type CalendarEventWithCalendarId = gapi.client.calendar.Event & {
  calendarId: string;
  backgroundColor: string;
};

/**
 * LocalStorageに保存するデータ
 */
interface LocalStorageType {
  id: string?;
  calendars: CalendarFeatLocalStorage[]?;
  calendarConfig: CalendarConfig?;
}
