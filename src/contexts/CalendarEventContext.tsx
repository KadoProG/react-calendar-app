import { v4 as uuidv4 } from 'uuid';
import React from 'react';

interface CalendarEventContextType {
  addCalendarEvent: (args: CalendarEvent) => void;
  updateCalendarEvent: (id: CalendarEvent['id'], args: Partial<CalendarEvent>) => void;
  calendarEvents: CalendarEvent[];
  removeCalendarEvent: (id: CalendarEvent['id']) => void;
}

export const CalendarEventContext = React.createContext<CalendarEventContextType>({
  addCalendarEvent: () => {},
  calendarEvents: [],
  updateCalendarEvent: () => {},
  removeCalendarEvent: () => {},
});

export const CalendarEventProvider: React.FC<{ children: React.ReactNode }> = (props) => {
  const [calendarEvents, setCalendarEvents] = React.useState<CalendarEvent[]>([]);

  const addCalendarEvent = React.useCallback((args: CalendarEvent) => {
    const newCalendarEvent = { ...args, id: uuidv4() };
    setCalendarEvents((prev) => [...prev, newCalendarEvent]);
  }, []);

  const updateCalendarEvent = React.useCallback(
    (id: CalendarEvent['id'], args: Partial<CalendarEvent>) => {
      setCalendarEvents((prev) =>
        prev.map((event) => (event.id === id ? { ...event, ...args } : event))
      );
    },
    []
  );

  const removeCalendarEvent = React.useCallback((id: CalendarEvent['id']) => {
    setCalendarEvents((prev) => prev.filter((event) => event.id !== id));
  }, []);

  return (
    <CalendarEventContext.Provider
      value={{ addCalendarEvent, updateCalendarEvent, calendarEvents, removeCalendarEvent }}
    >
      {props.children}
    </CalendarEventContext.Provider>
  );
};
