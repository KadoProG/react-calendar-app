import { AuthContext } from '@/contexts/AuthContext';
import { fetchCalendars } from '@/utils/fetchCalendarEvents';
import React from 'react';

interface CalendarFeatLocalStorageType {
  calendars: CalendarFeatLocalStorage[];
  setCalendars: React.Dispatch<React.SetStateAction<CalendarFeatLocalStorage[]>>;
  isLoading: boolean;
  mutateCalendar: () => Promise<void>;
}

export const CalendarFeatLocalStorageContext = React.createContext<CalendarFeatLocalStorageType>({
  calendars: [],
  setCalendars: () => {},
  isLoading: true,
  mutateCalendar: async () => {},
});

export const CalendarFeatLocalStorageProvider: React.FC<{ children: React.ReactNode }> = (
  props
) => {
  const { user } = React.useContext(AuthContext);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [calendars, setCalendars] = React.useState<CalendarFeatLocalStorage[]>([]);

  // useEffectを使用し、stateの値が変更された時にlocalStorageに値を保存
  React.useEffect(() => {
    if (!user || !calendars || calendars.length === 0) return;
    try {
      const serializedValue = JSON.stringify(calendars);
      localStorage.setItem(user.email, serializedValue);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, [user, calendars]);

  const initCalendarsFeatLocalStorage = React.useCallback(async () => {
    if (!user) return;
    try {
      const item = localStorage.getItem(user.email);
      const parsedItem = item ? JSON.parse(item) : null;

      if (parsedItem && Array.isArray(parsedItem) && parsedItem.length > 0) {
        setCalendars(parsedItem);
        setIsLoading(false);
        return;
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
  }, [user]);

  React.useEffect(() => {
    if (user) {
      initCalendarsFeatLocalStorage();
    } else {
      setIsLoading(false);
    }
  }, [user, initCalendarsFeatLocalStorage]);

  const mutateCalendar = React.useCallback(async () => {
    if (!user) return;
    localStorage.removeItem(user?.email);
    setIsLoading(true);
    initCalendarsFeatLocalStorage();
  }, [user, initCalendarsFeatLocalStorage]); // 依存関係にcalendarsを追加

  return (
    <CalendarFeatLocalStorageContext.Provider
      value={{ calendars, setCalendars, isLoading, mutateCalendar }}
    >
      {props.children}
    </CalendarFeatLocalStorageContext.Provider>
  );
};
