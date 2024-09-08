import dayjs from '@/libs/dayjs';
import styles from '@/components/domains/newCalendar/CalendarDetailEditMenu.module.scss';
import { DeleteButton } from '@/components/common/button/DeleteButton';
import { CalendarMenuForm } from '@/components/domains/newCalendar/CalendarMenuContext';
import React from 'react';
import { TextField } from '@/components/common/TextField';
import { Button } from '@/components/common/button/Button';
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { CheckBox } from '@/components/common/input/CheckBox';

interface CalendarDetailEditMenuProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<CalendarMenuForm, any>;
  anchorEl: HTMLElement | null;
  setValue: UseFormSetValue<CalendarMenuForm>;
  watch: UseFormWatch<CalendarMenuForm>;
  handleFormSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

export const CalendarDetailEditMenu: React.FC<CalendarDetailEditMenuProps> = (props) => {
  const { isAllDay, start, end, startDate, endDate } = React.useMemo(() => props.watch(), [props]);

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

    return { top: resultTop, left: resultLeft };
  }, [props.anchorEl]);

  return (
    <div
      className={styles.dialog}
      style={{
        display: props.anchorEl ? 'flex' : 'none',
      }}
      onClick={props.onClose}
    >
      <form
        className={styles.dialog__content}
        onClick={(e) => e.stopPropagation()}
        onSubmit={props.handleFormSubmit}
        style={style}
      >
        <div className={styles.dialog__header}>
          <h2>予定を追加</h2>
          <DeleteButton type="button" />
        </div>
        <div className={styles.dialog__body}>
          <TextField
            control={props.control}
            name="summary"
            type="string"
            required
            label="タイトル"
            autoFocus
          />
          <CheckBox control={props.control} name="isAllDay" label="終日" />

          <TextField
            control={props.control}
            name="startDate"
            type="date"
            required
            label="開始日時"
            style={{ display: isAllDay ? 'block' : 'none' }}
            onBlur={handleDayBlur}
          />
          <TextField
            control={props.control}
            name="endDate"
            type="date"
            required
            label="終了日時"
            style={{ display: isAllDay ? 'block' : 'none' }}
            onBlur={handleDayBlur}
          />
          <TextField
            control={props.control}
            name="start"
            type="datetime-local"
            required
            label="開始日時"
            style={{ display: isAllDay ? 'none' : 'block' }}
            onBlur={handleDayBlur}
          />
          <TextField
            control={props.control}
            name="end"
            type="datetime-local"
            required
            label="終了日時"
            style={{ display: isAllDay ? 'none' : 'block' }}
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
