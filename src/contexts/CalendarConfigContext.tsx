import dayjs from '@/libs/dayjs';
import React from 'react';

interface CalendarConfig {
  /**
   * １時間を何分割するか
   * - 1: 1時間ごと
   * - 2: 30分ごと
   * - 3: 20分ごと
   * - 4: 15分ごと
   */
  divisionsPerHour: number;
  /**
   * １時間あたりの高さ
   */
  heightPerHour: number;
  /**
   * １画面の表示数
   */
  weekDisplayCount: number;
}

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
