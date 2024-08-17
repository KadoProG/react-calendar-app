import dayjs from '@/libs/dayjs';
import { CalendarConfigFormDialog } from '@/components/domains/CalendarConfigFormDialog';
import { CalendarEventContext } from '@/contexts/CalendarEventContext';
import { KeyDownContext } from '@/contexts/KeyDownContext';
import React from 'react';

interface CalendarEventReturnValue {
  type: 'cancel' | 'save' | 'delete';
  calendarEvent?: CalendarEvent;
}

type OpenDialogArgs =
  | {
      type: 'add';
      init?: {
        start?: dayjs.Dayjs;
        end?: dayjs.Dayjs;
        isAllDayEvent?: boolean;
      };
    }
  | { type: 'edit'; id: CalendarEvent['id'] };

interface CalendarConfigFormDialogContextValue {
  openDialog: (args: OpenDialogArgs) => Promise<CalendarEventReturnValue>;
}

export const CalendarConfigFormDialogContext =
  React.createContext<CalendarConfigFormDialogContextValue>({
    openDialog: () =>
      Promise.resolve({
        calendarEvent: { id: '', start: '', end: '', title: '', isAllDayEvent: false },
        type: 'cancel',
      }),
  });

export const CalendarConfigFormDialogContextProvider: React.FC<{ children: React.ReactNode }> = (
  props
) => {
  const [calendarEvent, setCalendarEvent] = React.useState<CalendarEvent | null>(null);
  const [type, setType] = React.useState<'add' | 'edit'>('add');
  const { addKeyDownEvent, removeKeyDownEvent } = React.useContext(KeyDownContext);
  const { calendarEvents, addCalendarEvent, updateCalendarEvent, removeCalendarEvent } =
    React.useContext(CalendarEventContext);

  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const resolveFunction = React.useRef<(value: CalendarEventReturnValue) => void>();

  const value = React.useMemo<CalendarConfigFormDialogContextValue>(
    () => ({
      openDialog: async (args: OpenDialogArgs) =>
        new Promise((resolve) => {
          resolveFunction.current = resolve;

          if (args.type === 'edit') {
            const newCalendarEvent = calendarEvents.find((event) => event.id === args.id);
            if (newCalendarEvent) {
              setCalendarEvent(newCalendarEvent);
            }
          } else if (args.type === 'add') {
            const newCalendarEvent = {
              start: args.init?.start ?? dayjs().startOf('hour').add(1, 'hour'),
              end: args.init?.end ?? dayjs().startOf('hour').add(2, 'hour'),
              title: '',
              isAllDayEvent: args.init?.isAllDayEvent ?? false,
            };
            setCalendarEvent(newCalendarEvent);
          }
          setType(args.type);
          setIsOpen(true);
        }),
    }),
    [calendarEvents]
  );

  const handleCancel = React.useCallback(() => {
    setIsOpen(false);
    resolveFunction.current?.({ type: 'cancel' });
  }, []);

  const handleSetCalendarEvent = React.useCallback(
    (calendarEvent: CalendarEvent) => {
      setIsOpen(false);

      if (type === 'add') {
        addCalendarEvent(calendarEvent);
      } else if (type === 'edit') {
        updateCalendarEvent(calendarEvent.id, calendarEvent);
      }

      resolveFunction.current?.({ type: 'save' });
    },
    [type, addCalendarEvent, updateCalendarEvent]
  );

  const handleDelete = React.useCallback(() => {
    setIsOpen(false);

    if (calendarEvent) {
      removeCalendarEvent(calendarEvent.id);
    }

    resolveFunction.current?.({ type: 'delete' });
  }, [calendarEvent, removeCalendarEvent]);

  React.useEffect(() => {
    if (isOpen) {
      addKeyDownEvent({ id: 1, key: 'Escape', callback: handleCancel });
    } else {
      removeKeyDownEvent(1);
    }
  }, [isOpen, addKeyDownEvent, removeKeyDownEvent, handleCancel]);

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
