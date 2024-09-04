import dayjs from '@/libs/dayjs';
import { CalendarContext } from '@/contexts/CalendarContext';
import { formatDateRange } from '@/utils/convertDayjs';
import React from 'react';
import { useWatch } from 'react-hook-form';
import { Button } from '@/components/common/button/Button';

export const NewCalendar: React.FC = () => {
  const { control } = React.useContext(CalendarContext);

  const start = useWatch({ control, name: 'start' });
  const end = useWatch({ control, name: 'end' });

  const dateText = formatDateRange(dayjs(start), dayjs(end));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div style={{ width: 37.5, height: 37.5 }}>
        <img
          src="/images/icons/vite.svg"
          alt="calendar"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <p style={{ fontWeight: 'bold' }}>{dateText}</p>
      <Button>＜</Button>
      <Button>＞</Button>
    </div>
  );
};
