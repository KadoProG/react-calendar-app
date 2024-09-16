import dayjs from '@/libs/dayjs';
import React from 'react';
import useSWR from 'swr';
import { fetchCalendarEvents } from '@/utils/fetchCalendarEvents';
import { Control, useForm } from 'react-hook-form';
import { CalendarFeatLocalStorageContext } from '@/contexts/CalendarFeatLocalStorageContext';
import { convertCalendarRange } from '@/utils/calendarUtils';

export interface FetchCalendarForm {
  start: string;
  end: string;
}

interface CalendarContextType {
  calendarEvents: CalendarEventWithCalendarId[];
  calendars: CalendarFeatLocalStorage[];
  isCalendarsLoading: boolean;
  isCalendarEventsLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<FetchCalendarForm, any>;
  config: CalendarConfig;
  mutate: () => void;
  start: dayjs.Dayjs;
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
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >,
  config: {} as CalendarConfig,
  mutate: () => {},
  start: dayjs(),
});

export const CalendarContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    calendars,
    isLoading,
    calendarConfig: config,
  } = React.useContext(CalendarFeatLocalStorageContext); // カレンダー情報を取得

  const { control, watch, reset } = useForm<FetchCalendarForm>({
    defaultValues: {
      start: dayjs().toISOString(),
      end: '',
    },
  });

  const { start, end } = watch();

  // configの値が変更された時に、startとendを更新
  React.useEffect(() => {
    const initDate = convertCalendarRange(start ? dayjs(start) : dayjs(), config);
    reset({
      start: initDate.start.toISOString(),
      end: initDate.end.toISOString(),
    });
  }, [config, reset, start]);

  const {
    data,
    isLoading: isCalendarEventsLoading,
    mutate,
  } = useSWR(!isLoading ? { calendars, start, end } : null, fetchCalendarEvents, {
    // 自動fetchの無効化
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const calendarEvents = React.useMemo(() => data ?? [], [data]);

  const value = React.useMemo(
    () => ({
      calendarEvents,
      calendars,
      isCalendarEventsLoading,
      isCalendarsLoading: isLoading,
      control,
      config,
      mutate,
      start: dayjs(start),
    }),
    [calendarEvents, calendars, isCalendarEventsLoading, isLoading, control, config, mutate, start]
  );

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
};
