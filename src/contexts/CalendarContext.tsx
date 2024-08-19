import React from 'react';
import { gapi } from 'gapi-script';
import { AuthContext } from './AuthContext'; // AuthContextをインポート

interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime: string;
  };
  end: {
    dateTime: string;
  };
}

interface CalendarContextType {
  events: CalendarEvent[] | null;
  fetchEvents: () => Promise<void>;
}

export const CalendarContext = React.createContext<CalendarContextType>({
  events: null,
  fetchEvents: async () => {},
});

export const CalendarContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = React.useState<CalendarEvent[] | null>(null);
  const { status } = React.useContext(AuthContext); // 認証情報を取得

  const fetchEvents = React.useCallback(async () => {
    if (status === 'unverified') {
      console.log('User is unverified');
      return;
    }
    if (status === 'unauthenticated') {
      console.warn('User is not authenticated');
      return;
    }

    try {
      await gapi.client.load('calendar', 'v3'); // ここでGoogle Calendar APIをロード

      const calendarListResponse = await gapi.client.calendar.calendarList.list();
      const calendars = calendarListResponse.result.items;

      if (!calendars) {
        console.warn('No calendars found');
        return;
      }

      const allEvents: CalendarEvent[] = [];

      for (const calendar of calendars) {
        if (calendar.id === 'ja.japanese#holiday@group.v.calendar.google.com') {
          continue;
        }
        const response = await gapi.client.calendar.events.list({
          calendarId: calendar.id,
          timeMin: new Date().toISOString(),
          showDeleted: false,
          singleEvents: true,
          maxResults: 10,
          orderBy: 'startTime',
        });

        const events = response.result.items;
        if (events) {
          allEvents.push(...(events as CalendarEvent[]));
        }
      }

      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    }
  }, [status]);

  React.useEffect(() => {
    if (status === 'authenticated') {
      fetchEvents();
    }
  }, [status, fetchEvents]);

  return (
    <CalendarContext.Provider value={{ events, fetchEvents }}>{children}</CalendarContext.Provider>
  );
};
