import { CheckBox } from '@/components/common/input/CheckBox';
import { FormContainer } from '@/components/common/layout/FormContainer';
import { CalendarFeatLocalStorageContext } from '@/contexts/CalendarFeatLocalStorageContext';
import React from 'react';
import { useForm, useWatch } from 'react-hook-form';

/**
 * カレンダーの有効無効を設定するコンポーネント
 */
export const SettingCalendarListValid: React.FC = () => {
  const { calendars, setCalendars } = React.useContext(CalendarFeatLocalStorageContext);
  const { control, reset } = useForm<{ valids: boolean[] }>({
    defaultValues: {
      valids: calendars.map((calendar) => calendar.hasValid),
    },
  });

  const valids = useWatch({ control, name: 'valids' });

  React.useEffect(() => {
    if (valids.length === 0) return;
    const notChange = calendars.every((calendar, index) => {
      return calendar.hasValid === valids[index];
    });

    if (notChange) return;

    const newCalendars = calendars.map((calendar, index) => ({
      ...calendar,
      hasValid: valids[index],
    }));

    setCalendars(newCalendars);
  }, [valids, calendars, setCalendars]);

  React.useEffect(() => {
    if (calendars.length === 0) return;
    const valids = calendars.map((calendar) => calendar.hasValid);
    reset({ valids });
    console.log('reset');
  }, [calendars, reset]);
  return (
    <FormContainer label="カレンダーの表示">
      {calendars.map((calendar, index) => (
        <CheckBox
          key={calendar.id ?? index}
          control={control}
          name={`valids.${index}`}
          label={calendar.summary ?? ''}
        />
      ))}
    </FormContainer>
  );
};
