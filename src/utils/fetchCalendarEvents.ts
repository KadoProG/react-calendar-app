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

export const fetchCalendarEvents = async (args: {
  calendars: gapi.client.calendar.CalendarListEntry[];
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
}): Promise<gapi.client.calendar.Event[]> => {
  try {
    if (!args.calendars) {
      console.warn('No args.calendars found');
      return [];
    }

    const allEvents = [];

    for (const calendar of args.calendars) {
      if (!calendar.id) continue;

      const response = await gapi.client.calendar.events.list({
        calendarId: calendar.id,
        timeMin: args.start.toISOString(),
        timeMax: args.end.toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: 'startTime',
      });

      const events = response.result.items;
      if (events) {
        allEvents.push(...events);
      }
    }

    return allEvents;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
};
