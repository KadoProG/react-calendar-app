import { CalendarMenuForm } from '@/components/domains/newCalendar/CalendarMenuContext';
import { KeyDownContext } from '@/contexts/KeyDownContext';
import React from 'react';
import { useForm } from 'react-hook-form';

export const useCalendarMenuForm = (args: { isOpen: boolean; onClose: () => void }) => {
  const { addKeyDownEvent, removeKeyDownEvent } = React.useContext(KeyDownContext);

  const { control, setValue, watch, reset, handleSubmit } = useForm<CalendarMenuForm>({
    defaultValues: {
      summary: '',
      start: '',
      end: '',
      startDate: '',
      endDate: '',
      isAllDay: false,
    },
  });

  React.useEffect(() => {
    if (args.isOpen) {
      addKeyDownEvent({ id: 1, key: 'Escape', callback: args.onClose });
    } else {
      removeKeyDownEvent(1);
    }
  }, [args.isOpen, addKeyDownEvent, removeKeyDownEvent, args.onClose]);

  const handleFormSubmit = React.useCallback(() => {
    handleSubmit((data) => {
      console.log(data); // eslint-disable-line no-console
    })();
  }, [handleSubmit]);

  return { control, setValue, watch, reset, handleFormSubmit };
};
