import { fetchCalendars } from '@/utils/fetchCalendarEvents';
import React from 'react';

// useStateとuseEffectを使用し、localStorageを扱うためのフックを定義
export const useCalenadarFeatLocalStorage = (user: User | null) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [calendars, setCalendars] = React.useState<CalendarFeatLocalStorage[]>([]);

  // useEffectを使用し、stateの値が変更された時にlocalStorageに値を保存
  React.useEffect(() => {
    if (!user || !calendars || calendars.length === 0) return;
    try {
      const serializedValue = JSON.stringify(calendars);
      localStorage.setItem(user.email, serializedValue);
    } catch (error) {
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
      console.error(error);
    }
  }, [user]);

  React.useEffect(() => {
    if (user) {
      initCalendarsFeatLocalStorage();
    }
  }, [user, initCalendarsFeatLocalStorage]);

  return { calendars, setCalendars, isLoading };
};
