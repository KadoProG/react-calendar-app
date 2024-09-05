import dayjs from '@/libs/dayjs';
import { AuthContext } from '@/contexts/AuthContext';
import { CalendarContext } from '@/contexts/CalendarContext';
import { formatDateRange } from '@/utils/convertDayjs';
import React from 'react';
import { useController, useWatch } from 'react-hook-form';
import { Button } from '@/components/common/button/Button';
import { SettingButton } from '@/components/common/button/SettingButton';

export const CalendarHeader: React.FC = () => {
  const { user } = React.useContext(AuthContext);
  const { control } = React.useContext(CalendarContext);

  const start = useWatch({ control, name: 'start' });
  const end = useWatch({ control, name: 'end' });

  const startController = useController({ control, name: 'start' });
  const endController = useController({ control, name: 'end' });

  const handleScrollDate = React.useCallback(
    (type: -1 | 1) => {
      const prev = dayjs(start).add(7 * type, 'day');
      startController.field.onChange(prev.toISOString());
      endController.field.onChange(prev.add(6, 'day').toISOString());
    },
    [startController, start, endController]
  );

  const dateText = formatDateRange(dayjs(start), dayjs(end), 'month');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div style={{ width: 38, height: 38 }}>
        <img
          src="/images/icons/vite.svg"
          alt="calendar"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <p style={{ fontWeight: 'bold' }}>{dateText}</p>
      <Button onClick={() => handleScrollDate(-1)}>＜</Button>
      <Button onClick={() => handleScrollDate(1)}>＞</Button>
      <SettingButton style={{ marginLeft: 4 }} />

      <div style={{ flex: 1 }} />

      {user && (
        <Button width={50} style={{ padding: 2 }}>
          <img src={user?.imageUrl} alt="お前" width={32} height={32} />
        </Button>
      )}
    </div>
  );
};
