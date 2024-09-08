import dayjs from '@/libs/dayjs';
import { FetchCalendarForm } from '@/contexts/CalendarContext';
import { formatDateRange } from '@/utils/convertDayjs';
import React from 'react';
import { Control, useController, useWatch } from 'react-hook-form';
import { Button } from '@/components/common/button/Button';
import { SettingButton } from '@/components/common/button/SettingButton';
import { Link } from 'react-router-dom';
import { HEADER_HEIGHT } from '@/const/const';

interface CalendarHeaderProps {
  control: Control<FetchCalendarForm>;
  user: User | null;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = (props) => {
  const start = useWatch({ control: props.control, name: 'start' });
  const end = useWatch({ control: props.control, name: 'end' });

  const startController = useController({ control: props.control, name: 'start' });
  const endController = useController({ control: props.control, name: 'end' });

  const handleScrollDate = React.useCallback(
    (type: -1 | 1) => {
      const prev = dayjs(start).add(7 * type, 'day');
      startController.field.onChange(prev.toISOString());
      endController.field.onChange(prev.endOf('day').add(6, 'day').toISOString());
    },
    [startController, start, endController]
  );

  const dateText = formatDateRange(dayjs(start), dayjs(end), 'month');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: HEADER_HEIGHT }}>
      <Link to="/" style={{ width: 38, height: 38 }}>
        <img
          src="/images/icons/vite.svg"
          alt="calendar"
          style={{ width: '100%', height: '100%' }}
        />
      </Link>
      <p style={{ fontWeight: 'bold' }}>{dateText}</p>
      <Button onClick={() => handleScrollDate(-1)}>＜</Button>
      <Button onClick={() => handleScrollDate(1)}>＞</Button>
      <SettingButton style={{ marginLeft: 4 }} />

      <div style={{ flex: 1 }} />

      {props.user && (
        <Button width={50} style={{ padding: 2 }}>
          <img src={props.user?.imageUrl} alt="お前" width={32} height={32} />
        </Button>
      )}
    </div>
  );
};
