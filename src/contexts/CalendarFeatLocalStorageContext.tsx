import { LOCAL_STORAGE_KEY } from '@/const/const';
import { AuthContext } from '@/contexts/AuthContext';
import { fetchCalendars } from '@/utils/fetchCalendarEvents';
import { saveUserConfigInLocalStorage } from '@/utils/localStorageUtils';
import React from 'react';
import { Control, useForm } from 'react-hook-form';

interface CalendarFeatLocalStorageContextType {
  calendars: CalendarFeatLocalStorage[];
  setCalendars: React.Dispatch<React.SetStateAction<CalendarFeatLocalStorage[]>>;
  isLoading: boolean;
  mutateCalendar: () => Promise<void>;
  calendarConfig: CalendarConfig;
  control: Control<CalendarConfig>;
}

export const CalendarFeatLocalStorageContext =
  React.createContext<CalendarFeatLocalStorageContextType>({
    calendars: [],
    setCalendars: () => {},
    isLoading: true,
    mutateCalendar: async () => {},
    calendarConfig: {} as CalendarConfig,
    control: {} as Control<CalendarConfig>,
  });

export const CalendarFeatLocalStorageProvider: React.FC<{ children: React.ReactNode }> = (
  props
) => {
  const { user } = React.useContext(AuthContext);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [calendars, setCalendars] = React.useState<CalendarFeatLocalStorage[]>([]);

  const { control, watch, reset } = useForm<CalendarConfig>({
    defaultValues: {
      divisionsPerHour: 2,
      heightPerHour: 40,
      weekDisplayCount: 7,
      dateRangeStartTime: 'SunDay',
    },
  });

  const calendarConfig = watch();

  // useEffectを使用し、stateの値が変更された時にlocalStorageに値を保存
  React.useEffect(() => {
    console.log('LocalStorageの更新'); // eslint-disable-line no-console
    if (!user || !calendars || calendars.length === 0) return;
    try {
      const value: LocalStorageType = { id: user.email, calendars, calendarConfig };
      saveUserConfigInLocalStorage(value);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, [user, calendars, calendarConfig]);

  const initCalendarsFeatLocalStorage = React.useCallback(async () => {
    if (!user) return;
    try {
      // ローカルストレージからデータを取得
      const item = localStorage.getItem(LOCAL_STORAGE_KEY);
      const parsedItem = item ? JSON.parse(item) : null;

      // データがあった場合の処理
      if (parsedItem && Array.isArray(parsedItem)) {
        const userConfig: LocalStorageType | undefined = parsedItem.find(
          (userConfig: LocalStorageType) => userConfig.id === user.email
        );

        // 対象のユーザデータがあった場合の処理
        if (userConfig) {
          if (userConfig.calendars) {
            setCalendars(userConfig.calendars);
          } else {
            const fetchedCalendars = await fetchCalendars();
            const processedCalendars = fetchedCalendars.map((calendar) => ({
              ...calendar,
              hasValid: !!calendar.primary,
            }));
            setCalendars(processedCalendars);
          }

          if (userConfig.calendarConfig) {
            reset(userConfig.calendarConfig);
          }
          setTimeout(() => setIsLoading(false), 0);
          return;
        }
      }

      const fetchedCalendars = await fetchCalendars();
      const processedCalendars = fetchedCalendars.map((calendar) => ({
        ...calendar,
        hasValid: !!calendar.primary,
      }));
      setCalendars(processedCalendars);
      setIsLoading(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, [user, reset]);

  React.useEffect(() => {
    if (user) {
      initCalendarsFeatLocalStorage();
    } else {
      setIsLoading(false);
    }
  }, [user, initCalendarsFeatLocalStorage]);

  const mutateCalendar = React.useCallback(async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      // ローカルストレージからデータを取得
      const item = localStorage.getItem(LOCAL_STORAGE_KEY);
      const parsedItem = item ? JSON.parse(item) : null;

      const preCalendars: CalendarFeatLocalStorage[] = []; // 現在のカレンダー情報を格納

      if (parsedItem && Array.isArray(parsedItem)) {
        const userConfig: LocalStorageType | undefined = parsedItem.find(
          (userConfig: LocalStorageType) => userConfig.id === user.email
        );

        if (userConfig && userConfig.calendars) {
          preCalendars.push(...userConfig.calendars);
        }
      }

      const fetchedCalendars = await fetchCalendars();

      const processedCalendars = fetchedCalendars.map((calendar) => ({
        ...calendar,
        hasValid: preCalendars.some(
          (preCalendar) => preCalendar.id === calendar.id && preCalendar.hasValid
        ),
      }));

      setCalendars(processedCalendars);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }

    setIsLoading(false);
  }, [user]); // 依存関係にcalendarsを追加

  const value = React.useMemo(
    () => ({
      calendars,
      setCalendars,
      isLoading,
      mutateCalendar,
      calendarConfig,
      control,
    }),
    [calendars, setCalendars, isLoading, mutateCalendar, calendarConfig, control]
  );

  return (
    <CalendarFeatLocalStorageContext.Provider value={value}>
      {props.children}
    </CalendarFeatLocalStorageContext.Provider>
  );
};
