import dayjs from '@/libs/dayjs';
import React from 'react';
import { useForm } from 'react-hook-form';

export const useCalendarDialog = (args: { calendarId?: string }) => {
  const { control, watch, setValue } = useForm<{
    calendarId: string;
    summary: string;
    isAllDayEvent: boolean;
    startDate: string;
    endDate: string;
    start: string;
    end: string;
  }>({
    defaultValues: {
      calendarId: args.calendarId || '',
      summary: '',
      isAllDayEvent: false,
      startDate: dayjs().format('YYYY-MM-DD'),
      endDate: dayjs().format('YYYY-MM-DD'),
      start: `${dayjs().format('YYYY-MM-DD')}T10:00`,
      end: `${dayjs().format('YYYY-MM-DD')}T11:00`,
    },
  });

  const { isAllDayEvent, start, startDate, end, endDate } = watch();

  const handleFormSubmit = React.useCallback((e: React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
  }, []);

  React.useEffect(() => {
    if (isAllDayEvent) {
      setValue('start', `${startDate}T10:00`);
      setValue('end', `${endDate}T11:00`);
    } else {
      setValue('startDate', dayjs(start).format('YYYY-MM-DD'));
      setValue('endDate', dayjs(end).format('YYYY-MM-DD'));
    }
  }, [start, end, isAllDayEvent, startDate, endDate, setValue]);

  const handleDayBlur = React.useCallback(() => {
    if (!isAllDayEvent && start > end) {
      setValue('end', dayjs(start).add(1, 'hour').format('YYYY-MM-DDTHH:mm'));
    }
    if (isAllDayEvent && startDate > endDate) {
      setValue('endDate', startDate);
    }
  }, [start, end, setValue, startDate, endDate, isAllDayEvent]);

  React.useEffect(() => {
    if (args.calendarId) {
      setValue('calendarId', args.calendarId);
    }
  }, [args.calendarId, setValue]);

  return { control, handleDayBlur, isAllDayEvent, handleFormSubmit };
};
