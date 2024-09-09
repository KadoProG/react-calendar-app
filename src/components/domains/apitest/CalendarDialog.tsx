import { Button } from '@/components/common/button/Button';
import { CheckBox } from '@/components/common/input/CheckBox';
import React from 'react';
import { TextField } from '@/components/common/input/TextField';
import { Select } from '@/components/common/input/Select';
import { useCalendarDialog } from '@/components/domains/apitest/useCalendarDialog';
import { CalendarContext } from '@/contexts/CalendarContext';
import { DialogContainer } from '@/components/common/feedback/DialogContainer';
import { DialogContent } from '@/components/common/feedback/DialogContent';
import { DialogHeader } from '@/components/common/feedback/DialogHeader';
import { DialogBody } from '@/components/common/feedback/DialogBody';
import { DialogActions } from '@/components/common/feedback/DialogActions';

interface CalendarDialogProps {
  open: boolean;
  eventId?: gapi.client.calendar.Event['id'];
  onClose: () => void;
  calendarId?: gapi.client.calendar.CalendarListEntry['id'];
  mutate?: () => void;
}

export const CalendarDialog: React.FC<CalendarDialogProps> = (props) => {
  const { calendars } = React.useContext(CalendarContext);
  const { control, isAllDayEvent, handleDayBlur, handleFormSubmit, handleDelete } =
    useCalendarDialog({
      calendarId: props.calendarId,
      eventId: props.eventId,
      mutate: () => {
        props.mutate?.();
        props.onClose();
      },
    });

  return (
    <DialogContainer isOpen={props.open} onClose={props.onClose}>
      <DialogContent onSubmit={handleFormSubmit} style={{ maxWidth: 300 }}>
        <DialogHeader title={`予定を${props.eventId ? '編集' : '追加'}`} onDelete={handleDelete} />
        <DialogBody>
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
        </DialogBody>
        <DialogActions>
          <Button type="button" onClick={props.onClose} width={90}>
            キャンセル
          </Button>
          <Button type="submit" width={100}>
            {props.eventId ? '更新' : '追加'}
          </Button>
        </DialogActions>
      </DialogContent>
    </DialogContainer>
  );
};
