import dayjs from '@/libs/dayjs';
import React from 'react';
import { AuthContext } from './AuthContext'; // AuthContextをインポート
import useSWR from 'swr';
import { fetchCalendarEvents, fetchCalendars } from '@/utils/fetchCalendarEvents';

interface CalendarContextType {
  calendarEvents: gapi.client.calendar.Event[];
  isCalendarsLoading: boolean;
  isCalendarEventsLoading: boolean;
}

export const CalendarContext = React.createContext<CalendarContextType>({
  calendarEvents: [],
  isCalendarEventsLoading: false,
  isCalendarsLoading: false,
});

export const CalendarContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status } = React.useContext(AuthContext); // 認証情報を取得
  const [calendars, setCalendars] = React.useState<gapi.client.calendar.CalendarListEntry[]>([]);

  const [isCalendarsLoading, setIsCalendarsLoading] = React.useState<boolean>(false);

  const fetchCalendarsInit = React.useCallback(async () => {
    setIsCalendarsLoading(true);
    const newCalendars = await fetchCalendars();
    setCalendars(newCalendars);
    setIsCalendarsLoading(false);
  }, []);

  const start = React.useMemo(() => dayjs('2024-08-20'), []);
  const end = React.useMemo(() => dayjs('2024-08-26'), []);

  const { data, isLoading: isCalendarEventsLoading } = useSWR(
    calendars ? { calendars, start, end } : null,
    fetchCalendarEvents,
    {
      // 自動fetchの無効化
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const calendarEvents = data ?? [];

  React.useEffect(() => {
    if (status === 'authenticated') {
      fetchCalendarsInit();
    }
  }, [status, fetchCalendarsInit]);

  return (
    <CalendarContext.Provider
      value={{ calendarEvents, isCalendarEventsLoading, isCalendarsLoading }}
    >
      {children}
    </CalendarContext.Provider>
  );
};
