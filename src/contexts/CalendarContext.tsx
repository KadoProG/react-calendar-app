import dayjs from '@/libs/dayjs';
import React from 'react';
import useSWR from 'swr';
import { fetchCalendarEvents } from '@/utils/fetchCalendarEvents';
import { Control, useForm } from 'react-hook-form';
import { CalendarFeatLocalStorageContext } from '@/contexts/CalendarFeatLocalStorageContext';

interface FetchCalendarForm {
  start: string;
  end: string;
  canFetch: boolean;
}

interface CalendarContextType {
  calendarEvents: CalendarEventWithCalendarId[];
  calendars: CalendarFeatLocalStorage[];
  isCalendarsLoading: boolean;
  isCalendarEventsLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<FetchCalendarForm, any>;
  mutate: () => void;
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
  mutate: () => {},
});

export const CalendarContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { calendars, isLoading } = React.useContext(CalendarFeatLocalStorageContext); // カレンダー情報を取得

  const { control, watch } = useForm<FetchCalendarForm>({
    defaultValues: {
      start: dayjs().toISOString(),
      end: dayjs().add(6, 'day').toISOString(),
      canFetch: false,
    },
  });

  const { start, end } = watch();

  const {
    data,
    isLoading: isCalendarEventsLoading,
    mutate,
  } = useSWR(calendars ? { calendars, start, end } : null, fetchCalendarEvents, {
    // 自動fetchの無効化
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const calendarEvents = data ?? [];

  return (
    <CalendarContext.Provider
      value={{
        calendarEvents,
        calendars,
        isCalendarEventsLoading,
        isCalendarsLoading: isLoading,
        control,
        mutate,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};
