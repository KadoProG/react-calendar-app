import dayjs from '@/libs/dayjs';
import { CalendarMenuForm } from '@/components/domains/newCalendar/CalendarMenuContext';
import { KeyDownContext } from '@/contexts/KeyDownContext';
import React from 'react';
import { useForm } from 'react-hook-form';
import { SnackbarContext } from '@/components/common/feedback/SnackbarContext';

export const useCalendarMenuForm = (args: {
  isOpen: boolean;
  onClose: () => void;
  mutate?: () => void;
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const { addKeyDownEvent, removeKeyDownEvent } = React.useContext(KeyDownContext);
  const { showSnackbar } = React.useContext(SnackbarContext);

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
    handleSubmit(async (data) => {
      setIsSubmitting(true);
      try {
        const isAllDay = data.isAllDay;
        const resource = {
          summary: data.summary,
          start: {
            dateTime: !isAllDay ? dayjs(data.start).toISOString() : undefined,
            date: isAllDay ? dayjs(data.startDate).format('YYYY-MM-DD') : undefined,
          },
          end: {
            dateTime: !isAllDay ? dayjs(data.end).toISOString() : undefined,
            date: isAllDay ? dayjs(data.endDate).format('YYYY-MM-DD') : undefined,
          },
        };

        if (data.eventId) {
          await gapi.client.calendar.events.update({
            calendarId: data.calendarId,
            eventId: data.eventId,
            resource,
          });
        } else {
          await gapi.client.calendar.events.insert({ calendarId: data.calendarId, resource });
        }

        showSnackbar({ type: 'success', message: '予定を保存しました' });

        args.onClose();
        args.mutate?.();
      } catch (e) {
        showSnackbar({ type: 'error', message: '予定の保存に失敗しました' });
        console.error(e); // eslint-disable-line no-console
      }
      setIsSubmitting(false);
    })();
  }, [handleSubmit, showSnackbar, args]);

  const handleDelete = React.useCallback(async () => {
    const eventId = watch('eventId');
    if (!eventId) {
      args.onClose();
      return;
    }

    try {
      setIsSubmitting(true);
      await gapi.client.calendar.events.delete({
        calendarId: watch('calendarId'),
        eventId,
      });

      showSnackbar({ type: 'success', message: '予定を削除しました' });

      args.onClose();
      args.mutate?.();
    } catch (e) {
      showSnackbar({ type: 'error', message: '予定の削除に失敗しました' });
      console.error(e); // eslint-disable-line no-console
    }
    setIsSubmitting(false);
  }, [watch, showSnackbar, args]);

  return { control, setValue, watch, reset, handleFormSubmit, handleDelete, isSubmitting };
};
