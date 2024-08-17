import dayjs from '@/libs/dayjs';
import React from 'react';

interface CalendarConfigContextValue {
  config: CalendarConfig;
  baseDate: dayjs.Dayjs;
  setBaseDate: (date: dayjs.Dayjs) => void;
}

export const CalendarConfigContext = React.createContext<CalendarConfigContextValue>({
  config: {
    divisionsPerHour: 4,
    heightPerHour: 40,
    weekDisplayCount: 7,
  },
  baseDate: dayjs(),
  setBaseDate: () => {},
});

export const CalendarConfigProvider: React.FC<{ children: React.ReactNode }> = (props) => {
  const context = React.useContext(CalendarConfigContext);
  const config = context.config;
  const [baseDate, setBaseDate] = React.useState<dayjs.Dayjs>(dayjs());

  return (
    <CalendarConfigContext.Provider value={{ config, baseDate, setBaseDate }}>
      {props.children}
    </CalendarConfigContext.Provider>
  );
};
