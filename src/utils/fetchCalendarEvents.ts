import dayjs from '@/libs/dayjs';
import { gapi } from 'gapi-script';

export const fetchCalendars = async (): Promise<gapi.client.calendar.CalendarListEntry[]> => {
  try {
    const response = await gapi.client.calendar.calendarList.list();
    const calendars = response.result.items?.filter(
      (calendar) => calendar.id !== 'ja.japanese#holiday@group.v.calendar.google.com'
    );

    if (!calendars) {
      console.warn('No calendars found');
    }

    return calendars ?? [];
  } catch (error) {
    console.error('Error fetching calendars:', error);
    return [];
  }
};

/**
 * カレンダーからイベントを取得する
 */
export const fetchCalendarEvents = async (args: {
  calendars: CalendarFeatLocalStorage[];
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
}): Promise<(gapi.client.calendar.Event & { calendarId: string })[]> => {
  if (!args.calendars) {
    console.warn('No args.calendars found');
    return [];
  }

  const allEvents: (gapi.client.calendar.Event & { calendarId: string })[] = [];
  const { start, end, calendars } = args;

  // APIからイベントを取得する関数
  const fetchEventsForCalendar = async (calendar: CalendarFeatLocalStorage) => {
    const { id: calendarId } = calendar;
    if (!calendarId || !calendar.hasValid) return;

    try {
      const response = await gapi.client.calendar.events.list({
        calendarId,
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: 'startTime',
      });

      const events = response.result.items;
      if (events) {
        const newEvents = events.map((event) => ({ ...event, calendarId }));
        allEvents.push(...newEvents);
      }
    } catch (error) {
      console.error(`Error fetching events for calendar ${calendarId}:`, error);
    }
  };

  // Promiseの配列を作成し、全てのカレンダーに対してイベントをフェッチ
  const fetchEventsPromises = calendars.map(fetchEventsForCalendar);

  try {
    await Promise.all(fetchEventsPromises);
  } catch (error) {
    console.error('Error occurred while fetching calendar events:', error);
  }

  return allEvents;
};
