import { SnackbarContext } from '@/components/common/feedback/SnackbarContext';
import { CalendarContext } from '@/contexts/CalendarContext';
import dayjs from '@/libs/dayjs';
import React from 'react';
import { useForm } from 'react-hook-form';

export const useCalendarDialog = (args: {
  calendarId?: string;
  eventId?: string;
  mutate?: () => void;
}) => {
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { calendarEvents } = React.useContext(CalendarContext);

  const defaultValues = React.useMemo(() => {
    if (args.eventId) {
      const event = calendarEvents.find((event) => event.id === args.eventId);

      if (event) {
        const isAllDayEvent = event.start?.date ? true : false;

        const startDayjs = dayjs(isAllDayEvent ? event.start?.date : event.start?.dateTime);
        const endDayjs = dayjs(isAllDayEvent ? event.end?.date : event.end?.dateTime);
        return {
          calendarId: event?.calendarId || '',
          eventId: args.eventId || '',
          summary: event?.summary || '',
          isAllDayEvent: event.start?.date ? true : false,
          startDate: startDayjs.format('YYYY-MM-DD'),
          start: startDayjs.format('YYYY-MM-DDTHH:mm'),
          endDate: endDayjs.format('YYYY-MM-DD'),
          end: endDayjs.format('YYYY-MM-DDTHH:mm'),
        };
      }
    }
    return {
      calendarId: args.calendarId || '',
      eventId: '',
      summary: '',
      isAllDayEvent: false,
      startDate: dayjs().format('YYYY-MM-DD'),
      endDate: dayjs().format('YYYY-MM-DD'),
      start: `${dayjs().format('YYYY-MM-DD')}T10:00`,
      end: `${dayjs().format('YYYY-MM-DD')}T11:00`,
    };
  }, [args.calendarId, args.eventId, calendarEvents]);

  const { control, watch, setValue, handleSubmit, reset } = useForm<{
    calendarId: string;
    eventId: string;
    summary: string;
    isAllDayEvent: boolean;
    startDate: string;
    endDate: string;
    start: string;
    end: string;
  }>({ defaultValues });

  const { isAllDayEvent, start, startDate, end, endDate } = watch();

  const handleFormSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleSubmit(async (data) => {
        try {
          const isAllDayEvent = data.isAllDayEvent;

          const resource = {
            summary: data.summary,
            start: {
              dateTime: !isAllDayEvent ? dayjs(data.start).toISOString() : undefined,
              date: isAllDayEvent ? dayjs(data.startDate).format('YYYY-MM-DD') : undefined,
            },
            end: {
              dateTime: !isAllDayEvent ? dayjs(data.end).toISOString() : undefined,
              date: isAllDayEvent ? dayjs(data.endDate).format('YYYY-MM-DD') : undefined,
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

          args.mutate?.();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      })();
    },
    [handleSubmit, showSnackbar, args]
  );

  const handleDayBlur = React.useCallback(() => {
    if (!isAllDayEvent && start > end) {
      setValue('end', dayjs(start).add(1, 'hour').format('YYYY-MM-DDTHH:mm'));
    }
    if (isAllDayEvent && startDate > endDate) {
      setValue('endDate', startDate);
    }
  }, [start, end, setValue, startDate, endDate, isAllDayEvent]);

  React.useEffect(() => {
    if (isAllDayEvent) {
      setValue('start', `${startDate}T10:00`);
      setValue('end', `${endDate}T11:00`);
    } else {
      setValue('startDate', dayjs(start).format('YYYY-MM-DD'));
      setValue('endDate', dayjs(end).format('YYYY-MM-DD'));
    }
  }, [start, end, isAllDayEvent, startDate, endDate, setValue]);

  React.useEffect(() => {
    if (args.calendarId || args.eventId) {
      reset(defaultValues);
    }
  }, [args.calendarId, args.eventId, defaultValues, reset]);

  return { control, handleDayBlur, isAllDayEvent, handleFormSubmit };
};
