import dayjs from '@/libs/dayjs';
import { FetchCalendarForm } from '@/contexts/CalendarContext';
import { formatDateRange } from '@/utils/convertDayjs';
import React from 'react';
import { Control, useController, useWatch } from 'react-hook-form';
import { Button } from '@/components/common/button/Button';
import { SettingButton } from '@/components/common/button/SettingButton';
import { Link } from 'react-router-dom';
import { HEADER_HEIGHT } from '@/const/const';
import { SettingDialog } from '@/components/domains/setting/SettingDialog';
import { convertCalendarRange } from '@/utils/calendarUtils';

interface CalendarHeaderProps {
  control: Control<FetchCalendarForm>;
  user: User | null;
  config: CalendarConfig;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = (props) => {
  const [isOpenSettingDialog, setIsOpenSettingDialog] = React.useState<boolean>(false);
  const start = useWatch({ control: props.control, name: 'start' });
  const end = useWatch({ control: props.control, name: 'end' });

  const startController = useController({ control: props.control, name: 'start' });
  const endController = useController({ control: props.control, name: 'end' });

  const handleScrollDate = React.useCallback(
    (type: -1 | 1) => {
      const { start: startResult, end } = convertCalendarRange(dayjs(start), props.config, type);

      startController.field.onChange(startResult.toISOString());
      endController.field.onChange(end.toISOString());
    },
    [startController.field, endController.field, start, props.config]
  );

  const dateText = formatDateRange(dayjs(start), dayjs(end), 'month');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: HEADER_HEIGHT }}>
      <Link to="/" style={{ width: HEADER_HEIGHT, height: HEADER_HEIGHT }}>
        <img
          src="/images/icons/vite.svg"
          alt="calendar"
          style={{ width: '100%', height: '100%' }}
        />
      </Link>
      <p style={{ fontWeight: 'bold' }}>{dateText}</p>
      <Button onClick={() => handleScrollDate(-1)}>＜</Button>
      <Button onClick={() => handleScrollDate(1)}>＞</Button>
      <SettingButton style={{ marginLeft: 4 }} onClick={() => setIsOpenSettingDialog(true)} />

      <div style={{ flex: 1 }} />

      {props.user && (
        <Button width={50} style={{ padding: 2 }}>
          <img src={props.user?.imageUrl} alt="お前" width={32} height={32} />
        </Button>
      )}

      <SettingDialog isOpen={isOpenSettingDialog} onClose={() => setIsOpenSettingDialog(false)} />
    </div>
  );
};
