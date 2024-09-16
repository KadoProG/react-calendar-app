import { Button } from '@/components/common/button/Button';
import { CheckBox } from '@/components/common/input/CheckBox';
import { FormContainer } from '@/components/common/layout/FormContainer';
import { CalendarFeatLocalStorageContext } from '@/contexts/CalendarFeatLocalStorageContext';
import React from 'react';
import { useForm, useWatch } from 'react-hook-form';

/**
 * カレンダーの有効無効を設定するコンポーネント
 */
export const SettingCalendarListValid: React.FC = () => {
  const { calendars, setCalendars, mutateCalendar, isLoading } = React.useContext(
    CalendarFeatLocalStorageContext
  );

  const isResetting = React.useRef(false); // ループ対策（Reset時は更新しないように）

  const { control, reset } = useForm<{ valids: boolean[] }>({
    defaultValues: {
      valids: [],
    },
  });

  const valids = useWatch({ control, name: 'valids' });

  React.useEffect(() => {
    if (isLoading || valids.length === 0) return;

    if (isResetting.current) {
      isResetting.current = false;
      return;
    }

    setCalendars((prev) => {
      const notChange = prev.every((calendar, index) => calendar.hasValid === valids[index]);

      if (notChange) return prev;

      return prev.map((calendar, index) => ({
        ...calendar,
        hasValid: valids[index],
      }));
    });
  }, [isLoading, valids, setCalendars]);

  React.useEffect(() => {
    if (isLoading || calendars.length === 0) return;
    const valids = calendars.map((calendar) => calendar.hasValid);
    isResetting.current = true;
    reset({ valids });
  }, [isLoading, calendars, reset]);

  return (
    <FormContainer
      label="カレンダーの表示"
      left={<Button onClick={mutateCalendar}>最新を取得</Button>}
    >
      {valids.map((_, index) => (
        <CheckBox
          key={index}
          control={control}
          name={`valids.${index}`}
          label={calendars[index].summary ?? ''}
        />
      ))}
    </FormContainer>
  );
};
