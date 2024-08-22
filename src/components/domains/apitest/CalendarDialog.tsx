import styles from '@/components/domains/apitest/CalendarDialog.module.scss';
import { Button } from '@/components/common/button/Button';
import { CheckBox } from '@/components/common/input/CheckBox';
import React from 'react';
import { DeleteButton } from '@/components/common/button/DeleteButton';
import { TextField } from '@/components/common/TextField';
import { CalendarContext } from '@/contexts/CalendarContext';
import { Select } from '@/components/common/input/Select';
import { useCalendarDialog } from '@/components/domains/apitest/useCalendarDialog';

interface CalendarDialogProps {
  open: boolean;
  onClose: () => void;
  calendarId?: gapi.client.calendar.CalendarListEntry['id'];
  mutate?: () => void;
}

export const CalendarDialog: React.FC<CalendarDialogProps> = (props) => {
  const { calendars } = React.useContext(CalendarContext);
  const { control, isAllDayEvent, handleDayBlur, handleFormSubmit } = useCalendarDialog({
    calendarId: props.calendarId,
  });

  return (
    <div
      className={styles.dialog}
      style={{ display: props.open ? 'flex' : 'none' }}
      onClick={props.onClose}
    >
      <form className={styles.dialog__content} onClick={handleFormSubmit}>
        <div className={styles.dialog__header}>
          <h2>予定を追加</h2>
          <DeleteButton type="button" />
        </div>
        <div className={styles.dialog__body}>
          <Select
            control={control}
            name="calendarId"
            label="カレンダー"
            options={calendars.map((calendar) => ({
              label: calendar.primary ? '(プライマリ)' : calendar.summary || '',
              value: calendar.id || '',
            }))}
          />
          <TextField
            control={control}
            name="summary"
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
            onBlur={handleDayBlur}
          />
          <TextField
            control={control}
            name="endDate"
            type="date"
            required
            label="終了日時"
            style={{ display: isAllDayEvent ? 'block' : 'none' }}
            onBlur={handleDayBlur}
          />
          <TextField
            control={control}
            name="start"
            type="datetime-local"
            required
            label="開始日時"
            style={{ display: isAllDayEvent ? 'none' : 'block' }}
            onBlur={handleDayBlur}
          />
          <TextField
            control={control}
            name="end"
            type="datetime-local"
            required
            label="終了日時"
            style={{ display: isAllDayEvent ? 'none' : 'block' }}
            onBlur={handleDayBlur}
          />
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
