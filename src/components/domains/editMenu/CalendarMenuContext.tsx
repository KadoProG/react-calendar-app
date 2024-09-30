import { CalendarEditMenu } from '@/components/domains/editMenu/CalendarEditMenu';
import { useCalendarMenuForm } from '@/components/domains/editMenu/useCalendarMenuForm';
import { CalendarContext } from '@/contexts/CalendarContext';
import dayjs from '@/libs/dayjs';
import React from 'react';

interface OpenMenuArgs {
  anchorEl: HTMLElement | null;
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
  isAllDay?: boolean;
  eventId: string;
  calendarId: string;
  summary: string;
}

export interface CalendarMenuForm {
  summary: string;
  start: string;
  end: string;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  eventId: string;
  calendarId: string;
}

interface CalendarMenuContextValue {
  openMenu: (arg: OpenMenuArgs) => Promise<void>;
}

export const CalendarMenuContext = React.createContext<CalendarMenuContextValue>({
  openMenu: async () => {},
});

export const CalendarMenuProvider: React.FC<{ children: React.ReactNode }> = (props) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const resolveFunction = React.useRef<() => void>(() => {});
  const { mutate } = React.useContext(CalendarContext);

  const onClose = React.useCallback(() => {
    if (resolveFunction.current) {
      resolveFunction.current();
    }
    setAnchorEl(null);
  }, []);

  const { control, setValue, watch, reset, handleFormSubmit, handleDelete, isSubmitting } =
    useCalendarMenuForm({
      isOpen: !!anchorEl,
      onClose,
      mutate,
    });

  const openMenu = React.useCallback(
    async (args: OpenMenuArgs) =>
      new Promise<void>((resolve) => {
        resolveFunction.current = resolve;
        setAnchorEl(args.anchorEl);
        reset({
          summary: args.summary,
          start: args.start.format('YYYY-MM-DDTHH:mm'),
          end: args.end.format('YYYY-MM-DDTHH:mm'),
          startDate: args.start.format('YYYY-MM-DD'),
          endDate: args.end.format('YYYY-MM-DD'),
          isAllDay: args.isAllDay ?? false,
          eventId: args.eventId ?? '',
          calendarId: args.calendarId ?? '',
        });
      }),
    [reset]
  );

  const value = React.useMemo(() => ({ openMenu }), [openMenu]);

  return (
    <CalendarMenuContext.Provider value={value}>
      <div style={{ position: 'relative' }}>
        {props.children}
        <CalendarEditMenu
          isSubmitting={isSubmitting}
          anchorEl={anchorEl}
          control={control}
          setValue={setValue}
          watch={watch}
          handleFormSubmit={handleFormSubmit}
          onClose={onClose}
          handleDelete={handleDelete}
        />
      </div>
    </CalendarMenuContext.Provider>
  );
};
