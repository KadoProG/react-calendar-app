import { CalendarDetailEditMenu } from '@/components/domains/newCalendar/CalendarDetailEditMenu';
import { KeyDownContext } from '@/contexts/KeyDownContext';
import dayjs from '@/libs/dayjs';
import React from 'react';
import { useForm } from 'react-hook-form';

interface OpenMenuArgs {
  anchorEl: HTMLElement;
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
  isAllDay?: boolean;
}

export interface CalendarMenuForm {
  summary: string;
  start: string;
  end: string;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
}

interface CalendarMenuContextValue {
  openMenu: (arg: OpenMenuArgs) => Promise<void>;
}

export const CalendarMenuContext = React.createContext<CalendarMenuContextValue>({
  openMenu: async () => {},
});

export const CalendarMenuProvider: React.FC<{ children: React.ReactNode }> = (props) => {
  const { addKeyDownEvent, removeKeyDownEvent } = React.useContext(KeyDownContext);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const resolveFunction = React.useRef<() => void>(() => {});

  const { control, setValue, watch, reset } = useForm<CalendarMenuForm>({
    defaultValues: {
      summary: '',
      start: '',
      end: '',
      startDate: '',
      endDate: '',
      isAllDay: false,
    },
  });

  const openMenu = React.useCallback(
    async (args: OpenMenuArgs) =>
      new Promise<void>((resolve) => {
        resolveFunction.current = resolve;
        setAnchorEl(args.anchorEl);
        reset({
          summary: '',
          start: args.start.format('YYYY-MM-DDTHH:mm'),
          end: args.end.format('YYYY-MM-DDTHH:mm'),
          startDate: args.start.format('YYYY-MM-DD'),
          endDate: args.end.format('YYYY-MM-DD'),
          isAllDay: args.isAllDay ?? false,
        });
      }),
    [reset]
  );

  const onClose = React.useCallback(() => {
    if (resolveFunction.current) {
      resolveFunction.current();
    }
    setAnchorEl(null);
  }, []);

  const value = React.useMemo(() => ({ openMenu }), [openMenu]);

  React.useEffect(() => {
    if (anchorEl) {
      addKeyDownEvent({ id: 1, key: 'Escape', callback: onClose });
    } else {
      removeKeyDownEvent(1);
    }
  }, [anchorEl, addKeyDownEvent, removeKeyDownEvent, onClose]);

  return (
    <CalendarMenuContext.Provider value={value}>
      <div style={{ position: 'relative' }}>
        {props.children}
        <CalendarDetailEditMenu
          anchorEl={anchorEl}
          control={control}
          setValue={setValue}
          watch={watch}
          handleFormSubmit={() => {}}
          onClose={onClose}
        />
      </div>
    </CalendarMenuContext.Provider>
  );
};
