import dayjs from '@/libs/dayjs';
import styles from '@/components/domains/newCalendar/CalendarDetailEditMenu.module.scss';
import { DeleteButton } from '@/components/common/button/DeleteButton';
import { CalendarMenuForm } from '@/components/domains/newCalendar/CalendarMenuContext';
import React from 'react';
import { Button } from '@/components/common/button/Button';
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { CheckBox } from '@/components/common/input/CheckBox';
import { Select } from '@/components/common/input/Select';
import { CalendarFeatLocalStorageContext } from '@/contexts/CalendarFeatLocalStorageContext';
import { TextField } from '@/components/common/input/TextField';

interface CalendarDetailEditMenuProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<CalendarMenuForm, any>;
  anchorEl: HTMLElement | null;
  setValue: UseFormSetValue<CalendarMenuForm>;
  watch: UseFormWatch<CalendarMenuForm>;
  handleFormSubmit: () => void;
  onClose: () => void;
  handleDelete: () => void;
  isSubmitting: boolean;
}

export const CalendarDetailEditMenu: React.FC<CalendarDetailEditMenuProps> = (props) => {
  const { isAllDay, start, end, startDate, endDate, eventId } = React.useMemo(
    () => props.watch(),
    [props]
  );
  const { calendars } = React.useContext(CalendarFeatLocalStorageContext);

  // endがstartより前にならないようにする
  const handleDayBlur = React.useCallback(() => {
    if (!isAllDay && start > end) {
      props.setValue('end', dayjs(start).add(1, 'hour').format('YYYY-MM-DDTHH:mm'));
    }
    if (isAllDay && startDate > endDate) {
      props.setValue('endDate', startDate);
    }
  }, [isAllDay, start, end, startDate, endDate, props]);

  // フォームの位置CSS
  const style: React.CSSProperties = React.useMemo(() => {
    if (!props.anchorEl) return { display: 'none' };
    const { top, left, width, height } = props.anchorEl.getBoundingClientRect();

    let resultLeft: number | undefined = undefined;
    let resultTop: number | undefined = undefined;

    if (300 < left) {
      resultLeft = left - 300; // 左側に300px分のスペースがあれば左側に表示
    } else if (left + width + 300 < window.innerWidth) {
      resultLeft = left + width; // 右側にスペースがあれば右側に表示
    }

    if (top + 460 < window.innerHeight) {
      resultTop = top + (!resultLeft && height + 460 + top < window.innerHeight ? height : 0); // 下側にスペースがあればその高さで表示
    } else if (top - 460 > 0) {
      resultTop = top - 460; // 上側にスペースがあれば下を基準にして表示
    }

    return { display: 'flex', top: resultTop, left: resultLeft };
  }, [props.anchorEl]);

  const handleFormSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      props.handleFormSubmit();
    },
    [props]
  );

  return (
    <div
      className={styles.dialog}
      style={{ display: props.anchorEl ? 'flex' : 'none' }}
      onClick={props.onClose}
    >
      <form
        className={styles.dialog__content}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleFormSubmit}
        style={style}
      >
        <div className={styles.dialog__header}>
          <h2>{`予定を${eventId ? '編集' : '追加'}`}</h2>
          <DeleteButton type="button" onClick={props.handleDelete} />
        </div>
        <div className={styles.dialog__body}>
          <Select
            control={props.control}
            name="calendarId"
            label="カレンダー"
            options={calendars.map((calendar) => ({
              label: calendar.primary ? '(プライマリ)' : calendar.summary || '',
              value: calendar.id || '',
            }))}
            disabled={props.isSubmitting}
          />
          <TextField
            control={props.control}
            name="summary"
            type="string"
            required
            label="タイトル"
            autoFocus
            isActiveFocus={!!props.anchorEl}
            disabled={props.isSubmitting}
          />
          <CheckBox
            control={props.control}
            name="isAllDay"
            label="終日"
            disabled={props.isSubmitting}
          />

          <TextField
            control={props.control}
            name="startDate"
            type="date"
            required
            label="開始日時"
            style={{ display: isAllDay ? 'block' : 'none' }}
            onBlur={handleDayBlur}
            disabled={props.isSubmitting}
          />
          <TextField
            control={props.control}
            name="endDate"
            type="date"
            required
            label="終了日時"
            style={{ display: isAllDay ? 'block' : 'none' }}
            onBlur={handleDayBlur}
            disabled={props.isSubmitting}
          />
          <TextField
            control={props.control}
            name="start"
            type="datetime-local"
            required
            label="開始日時"
            style={{ display: isAllDay ? 'none' : 'block' }}
            onBlur={handleDayBlur}
            disabled={props.isSubmitting}
          />
          <TextField
            control={props.control}
            name="end"
            type="datetime-local"
            required
            label="終了日時"
            style={{ display: isAllDay ? 'none' : 'block' }}
            onBlur={handleDayBlur}
            disabled={props.isSubmitting}
          />
        </div>
        <div className={styles.dialog__actions}>
          <Button type="button" onClick={props.onClose} width={90}>
            キャンセル
          </Button>
          <Button type="submit" width={100} disabled={props.isSubmitting}>
            {eventId ? '更新' : '追加'}
          </Button>
        </div>
      </form>
    </div>
  );
};
