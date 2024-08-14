import dayjs from '@/libs/dayjs';
import { Button } from '@/components/common/button/Button';
import { DeleteButton } from '@/components/common/button/DeleteButton';
import { TextField } from '@/components/common/TextField';
import styles from '@/components/domains/CalendarConfigFormDialog.module.scss';
import React from 'react';
import { useForm } from 'react-hook-form';

interface CalendarConfigFormDialogProps {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  calendarEvent: CalendarEvent | null;
  setCalendarEvent?: (calendarEvent: CalendarEvent) => void;
}

export const CalendarConfigFormDialog: React.FC<CalendarConfigFormDialogProps> = (props) => {
  const defaultValues = React.useMemo(
    () => ({
      id: props.calendarEvent?.id ?? '',
      start: props.calendarEvent?.start.format('YYYY-MM-DDTHH:mm'),
      end: props.calendarEvent?.end.format('YYYY-MM-DDTHH:mm'),
      title: props.calendarEvent?.title ?? '',
    }),
    [props.calendarEvent]
  );

  const { control, handleSubmit, setValue } = useForm<CalendarEvent>({ defaultValues });

  React.useEffect(() => {
    if (props.open) {
      setValue('id', defaultValues.id);
      setValue('start', defaultValues.start);
      setValue('end', defaultValues.end);
      setValue('title', defaultValues.title);
    }
  }, [setValue, props.open, defaultValues]);

  const handleFormSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      handleSubmit((data) => {
        if (props.setCalendarEvent) {
          props.setCalendarEvent({
            id: data.id,
            start: dayjs(data.start),
            end: dayjs(data.end),
            title: data.title,
          });
        }
      })();
    },
    [handleSubmit, props]
  );

  return (
    <div
      className={styles.dialog}
      style={{
        display: props.open ? 'block' : 'none',
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
              <TextField
                control={control}
                name="start"
                type="datetime-local"
                required
                label="開始日時"
              />
              <TextField
                control={control}
                name="end"
                type="datetime-local"
                required
                label="終了日時"
              />
            </>
          )}
        </div>
        <div className={styles.dialog__actions}>
          <Button type="button" onClick={props.onClose}>
            キャンセル
          </Button>
          <Button type="submit">追加</Button>
        </div>
      </form>
    </div>
  );
};
