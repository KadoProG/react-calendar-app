import { CalendarConfigFormDialog } from '@/components/domains/CalendarConfigFormDialog';
import { KeyDownContext } from '@/contexts/KeyDownContext';
import React from 'react';

interface CalendarEventReturnValue {
  type: 'cancel' | 'save' | 'delete';
  calendarEvent?: CalendarEvent;
}

interface CalendarConfigFormDialogContextValue {
  openDialog: (calendarEvent: CalendarEvent | null) => Promise<CalendarEventReturnValue>;
}

export const CalendarConfigFormDialogContext =
  React.createContext<CalendarConfigFormDialogContextValue>({
    openDialog: () =>
      Promise.resolve({ calendarEvent: { id: '', start: '', end: '', title: '' }, type: 'cancel' }),
  });

export const CalendarConfigFormDialogContextProvider: React.FC<{ children: React.ReactNode }> = (
  props
) => {
  const [calendarEvent, setCalendarEvent] = React.useState<CalendarEvent | null>(null);
  const { addKeyDownEvent, removeKeyDownEvent } = React.useContext(KeyDownContext);

  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const resolveFunction = React.useRef<(value: CalendarEventReturnValue) => void>();

  const value = React.useMemo<CalendarConfigFormDialogContextValue>(
    () => ({
      openDialog: async (calendarEvent: CalendarEvent | null) =>
        new Promise((resolve) => {
          resolveFunction.current = resolve;

          setCalendarEvent(calendarEvent);
          setIsOpen(true);
        }),
    }),
    []
  );

  const handleCancel = React.useCallback(() => {
    setIsOpen(false);
    resolveFunction.current?.({ type: 'cancel' });
    removeKeyDownEvent();
  }, [removeKeyDownEvent]);

  const handleSetCalendarEvent = React.useCallback(
    (calendarEvent: CalendarEvent) => {
      setIsOpen(false);
      resolveFunction.current?.({ type: 'save', calendarEvent });
      removeKeyDownEvent();
    },
    [removeKeyDownEvent]
  );

  const handleDelete = React.useCallback(() => {
    setIsOpen(false);
    resolveFunction.current?.({ type: 'delete' });
    removeKeyDownEvent();
  }, [removeKeyDownEvent]);

  addKeyDownEvent('Escape', () => handleCancel());

  return (
    <CalendarConfigFormDialogContext.Provider value={value}>
      {props.children}
      <CalendarConfigFormDialog
        open={isOpen}
        onClose={handleCancel}
        onDeleted={handleDelete}
        calendarEvent={calendarEvent}
        setCalendarEvent={handleSetCalendarEvent}
      />
    </CalendarConfigFormDialogContext.Provider>
  );
};
