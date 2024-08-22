import dayjs from '@/libs/dayjs';
import React from 'react';
import { AuthContext } from './AuthContext'; // AuthContextをインポート
import useSWR from 'swr';
import { fetchCalendarEvents, fetchCalendars } from '@/utils/fetchCalendarEvents';
import { Control, useForm } from 'react-hook-form';

interface FetchCalendarForm {
  start: string;
  end: string;
  canFetch: boolean;
}

interface CalendarContextType {
  calendarEvents: (gapi.client.calendar.Event & { calendarId: string })[];
  calendars: gapi.client.calendar.CalendarListEntry[];
  isCalendarsLoading: boolean;
  isCalendarEventsLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<FetchCalendarForm, any>;
}

export const CalendarContext = React.createContext<CalendarContextType>({
  calendarEvents: [],
  calendars: [],
  isCalendarEventsLoading: false,
  isCalendarsLoading: false,
  control: {} as Control<
    {
      start: string;
      end: string;
      canFetch: boolean;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >,
});

export const CalendarContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status } = React.useContext(AuthContext); // 認証情報を取得
  const [calendars, setCalendars] = React.useState<gapi.client.calendar.CalendarListEntry[]>([]);

  const { control, watch } = useForm<{ start: string; end: string; canFetch: boolean }>({
    defaultValues: {
      start: '2024-08-20',
      end: '2024-08-26',
      canFetch: false,
    },
  });

  const { start, end, canFetch } = watch();

  const [isCalendarsLoading, setIsCalendarsLoading] = React.useState<boolean>(false);

  const fetchCalendarsInit = React.useCallback(async () => {
    setIsCalendarsLoading(true);
    const newCalendars = await fetchCalendars();
    setCalendars(newCalendars);
    setIsCalendarsLoading(false);
  }, []);

  const startDayjs = React.useMemo(() => dayjs(start), [start]);
  const endDayjs = React.useMemo(() => dayjs(end), [end]);

  const { data, isLoading: isCalendarEventsLoading } = useSWR(
    calendars ? { calendars, start: startDayjs, end: endDayjs } : null,
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
    if (canFetch && status === 'authenticated') {
      fetchCalendarsInit();
    }
  }, [canFetch, status, fetchCalendarsInit]);

  return (
    <CalendarContext.Provider
      value={{ calendarEvents, calendars, isCalendarEventsLoading, isCalendarsLoading, control }}
    >
      {children}
    </CalendarContext.Provider>
  );
};
