import { CalendarDetailEditMenu } from '@/components/domains/newCalendar/CalendarDetailEditMenu';
import { useCalendarMenuForm } from '@/components/domains/newCalendar/useCalendarMenuForm';
import dayjs from '@/libs/dayjs';
import React from 'react';

interface OpenMenuArgs {
  anchorEl: HTMLElement;
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

  const onClose = React.useCallback(() => {
    if (resolveFunction.current) {
      resolveFunction.current();
    }
    setAnchorEl(null);
  }, []);

  const { control, setValue, watch, reset, handleFormSubmit } = useCalendarMenuForm({
    isOpen: !!anchorEl,
    onClose,
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
        <CalendarDetailEditMenu
          anchorEl={anchorEl}
          control={control}
          setValue={setValue}
          watch={watch}
          handleFormSubmit={handleFormSubmit}
          onClose={onClose}
        />
      </div>
    </CalendarMenuContext.Provider>
  );
};
