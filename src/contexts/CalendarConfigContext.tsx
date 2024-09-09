import dayjs from '@/libs/dayjs';
import React from 'react';
import { Control, useForm, UseFormReset } from 'react-hook-form';

interface CalendarConfigContextValue {
  config: CalendarConfig;
  baseDate: dayjs.Dayjs;
  setBaseDate: (date: dayjs.Dayjs) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<CalendarConfig, any>;
  reset: UseFormReset<CalendarConfig>;
}

export const CalendarConfigContext = React.createContext<CalendarConfigContextValue>({
  config: {
    divisionsPerHour: 4,
    heightPerHour: 40,
    weekDisplayCount: 7,
    dateRangeStartTime: 'SunDay',
  },
  control: {} as Control<CalendarConfig>,
  baseDate: dayjs(),
  setBaseDate: () => {},
  reset: () => {},
});

export const CalendarConfigProvider: React.FC<{ children: React.ReactNode }> = (props) => {
  const [baseDate, setBaseDate] = React.useState<dayjs.Dayjs>(dayjs());

  const { control, watch, reset } = useForm<CalendarConfig>({
    defaultValues: {
      divisionsPerHour: 4,
      heightPerHour: 40,
      weekDisplayCount: 7,
      dateRangeStartTime: 'SunDay',
    },
  });

  const watchConfig = watch();

  const value = React.useMemo(
    () => ({ config: watchConfig, control, baseDate, setBaseDate, reset }),
    [watchConfig, control, baseDate, setBaseDate, reset]
  );

  return (
    <CalendarConfigContext.Provider value={value}>{props.children}</CalendarConfigContext.Provider>
  );
};
