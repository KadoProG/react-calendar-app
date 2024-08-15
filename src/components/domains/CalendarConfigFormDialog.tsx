import dayjs from '@/libs/dayjs';
import { Button } from '@/components/common/button/Button';
import { DeleteButton } from '@/components/common/button/DeleteButton';
import { TextField } from '@/components/common/TextField';
import styles from '@/components/domains/CalendarConfigFormDialog.module.scss';
import React from 'react';
import { useForm } from 'react-hook-form';
import { CheckBox } from '@/components/common/input/CheckBox';

interface CalendarEventForm {
  id: string;
  isAllDayEvent: boolean;
  title: string;
  start: string;
  end: string;
  startDate: string;
  endDate: string;
}

interface CalendarConfigFormDialogProps {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  calendarEvent: CalendarEvent | null;
  setCalendarEvent?: (calendarEvent: CalendarEvent) => void;
}

export const CalendarConfigFormDialog: React.FC<CalendarConfigFormDialogProps> = (props) => {
  const defaultValues = React.useMemo<CalendarEventForm>(
    () => ({
      id: props.calendarEvent?.id ?? '',
      start: props.calendarEvent?.start.format('YYYY-MM-DDTHH:mm'),
      end: props.calendarEvent?.end.format('YYYY-MM-DDTHH:mm'),
      startDate: props.calendarEvent?.start.format('YYYY-MM-DD'),
      endDate: props.calendarEvent?.end.format('YYYY-MM-DD'),
      title: props.calendarEvent?.title ?? '',
      isAllDayEvent: props.calendarEvent?.isAllDayEvent ?? false,
    }),
    [props.calendarEvent]
  );

  const { control, handleSubmit, setValue, watch } = useForm<CalendarEventForm>({ defaultValues });

  React.useEffect(() => {
    if (props.open) {
      setValue('id', defaultValues.id);
      setValue('start', defaultValues.start);
      setValue('end', defaultValues.end);
      setValue('title', defaultValues.title);
      setValue('isAllDayEvent', defaultValues.isAllDayEvent);
      setValue('startDate', defaultValues.startDate);
      setValue('endDate', defaultValues.endDate);
      console.log(defaultValues);
    }
  }, [setValue, props.open, defaultValues]);

  const { isAllDayEvent, start, startDate, end, endDate } = watch();

  const handleFormSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      handleSubmit((data) => {
        const start = isAllDayEvent ? dayjs(data.startDate).startOf('day') : dayjs(data.start);
        const end = isAllDayEvent
          ? dayjs(data.endDate).startOf('day').add(1, 'day')
          : dayjs(data.end);

        const newCalendarEvent: CalendarEvent = {
          id: data.id,
          start,
          end,
          title: data.title,
          isAllDayEvent: data.isAllDayEvent,
        };

        props.setCalendarEvent?.(newCalendarEvent);
      })();
    },
    [handleSubmit, props, isAllDayEvent]
  );

  React.useEffect(() => {
    if (isAllDayEvent) {
      setValue('start', `${startDate}T10:00`);
      setValue('end', `${endDate}T11:00`);
    } else {
      setValue('startDate', dayjs(start).format('YYYY-MM-DD'));
      setValue('endDate', dayjs(end).format('YYYY-MM-DD'));
    }
  }, [start, end, isAllDayEvent, startDate, endDate, setValue]);

  return (
    <div
      className={styles.dialog}
      style={{
        display: props.open ? 'flex' : 'none',
      }}
      onClick={props.onClose}
    >
      <form
        className={styles.dialog__content}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleFormSubmit}
      >
        <div className={styles.dialog__header}>
          <h2>予定を追加</h2>
          <DeleteButton type="button" onClick={props.onDeleted} />
        </div>
        <div className={styles.dialog__body}>
          {props.open && (
            <>
              <TextField
                control={control}
                name="title"
                type="string"
                required
                label="タイトル"
                autoFocus
              />
              <CheckBox control={control} name="isAllDayEvent" label="終日" />

              <TextField
                control={control}
                name="startDate"
                type="date"
                required
                label="開始日時"
                style={{ display: isAllDayEvent ? 'block' : 'none' }}
              />
              <TextField
                control={control}
                name="endDate"
                type="date"
                required
                label="終了日時"
                style={{ display: isAllDayEvent ? 'block' : 'none' }}
              />
              <TextField
                control={control}
                name="start"
                type="datetime-local"
                required
                label="開始日時"
                style={{ display: isAllDayEvent ? 'none' : 'block' }}
              />
              <TextField
                control={control}
                name="end"
                type="datetime-local"
                required
                label="終了日時"
                style={{ display: isAllDayEvent ? 'none' : 'block' }}
              />
            </>
          )}
        </div>
        <div className={styles.dialog__actions}>
          <Button type="button" onClick={props.onClose} width={90}>
            キャンセル
          </Button>
          <Button type="submit" width={100}>
            追加
          </Button>
        </div>
      </form>
    </div>
  );
};
