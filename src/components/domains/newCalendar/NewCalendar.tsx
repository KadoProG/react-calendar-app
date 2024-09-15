import dayjs from '@/libs/dayjs';
import React from 'react';
import { CalendarHeader } from '@/components/domains/newCalendar/CalendarHeader';
import { CalendarBodyTop } from '@/components/domains/newCalendar/CalendarBodyTop';
import { CalendarBodyMain } from '@/components/domains/newCalendar/CalendarBodyMain';
import { getMouseSelectedCalendar } from '@/components/domains/newCalendar/calendarUtils';
import { CalendarContext } from '@/contexts/CalendarContext';
import { useWatch } from 'react-hook-form';
import { KeyDownContext } from '@/contexts/KeyDownContext';
import { CalendarMenuContext } from '@/components/domains/newCalendar/CalendarMenuContext';
import { AuthContext } from '@/contexts/AuthContext';
import { calculateIndexDifference } from '@/utils/convertDayjs';

export const NewCalendar: React.FC = () => {
  const { openMenu } = React.useContext(CalendarMenuContext);
  const { user } = React.useContext(AuthContext);
  const { control, calendarEvents, config } = React.useContext(CalendarContext);
  const { addKeyDownEvent, removeKeyDownEvent } = React.useContext(KeyDownContext);

  const start = dayjs(useWatch({ control, name: 'start' })).startOf('day');

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const [selectedStartDay, setSelectedStartDay] = React.useState<dayjs.Dayjs | null>(null);
  const [selectedEndDay, setSelectedEndDay] = React.useState<dayjs.Dayjs | null>(null);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);

  const [topHeight, setTopHeight] = React.useState<number>(0);

  const isMouseDownRef = React.useRef<'allday' | 'timely' | null>(null);

  // イベントドラッグ時に格納される変数
  const [dragEventItem, setDragEventItem] = React.useState<{
    event: CalendarEventWithCalendarId;
    ySizeIndex: number;
    yDiff: number;
  } | null>(null);

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isMouseDownRef.current) return;
      const { xIndex, yIndex } = getMouseSelectedCalendar(e, scrollRef.current!, config, topHeight);

      // イベントの上でマウスダウンした場合の処理
      if (e.target instanceof HTMLElement && e.target.id.includes('calendarEvent__')) {
        const eventId = e.target.id.replace('calendarEvent__', '');
        const event = calendarEvents.find((event) => event.id === eventId);
        if (!event) return;

        setSelectedStartDay(dayjs(event.start?.dateTime ?? event.start?.date));
        setSelectedEndDay(dayjs(event.end?.dateTime ?? event.end?.date));
        isMouseDownRef.current = event.start?.date ? 'allday' : 'timely';

        const ySizeIndex =
          (dayjs(event.end?.dateTime).diff(dayjs(event.start?.dateTime), 'minute') / 60) *
          config.divisionsPerHour;

        const yDiff =
          isMouseDownRef.current === 'allday'
            ? 0
            : yIndex -
              calculateIndexDifference(
                dayjs(event.start?.dateTime).startOf('day'),
                dayjs(event.start?.dateTime ?? event.start?.date),
                config.divisionsPerHour
              );

        setDragEventItem({ event, ySizeIndex, yDiff });
        return;
      }

      let resultDate: dayjs.Dayjs;

      if (yIndex < 0) {
        // 終日イベントの上でマウスダウンした場合の処理
        resultDate = start.add(xIndex, 'day');
        isMouseDownRef.current = 'allday';
      } else {
        // 通常のイベントの上でマウスダウンした場合の処理
        resultDate = start.add(xIndex, 'day').add(yIndex / config.divisionsPerHour, 'hour');
        isMouseDownRef.current = 'timely';
      }

      setSelectedStartDay(resultDate);
      setSelectedEndDay(resultDate);
    },
    [start, topHeight, config, calendarEvents]
  );

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isMouseDownRef.current) return;
      setIsDragging(true);

      const { xIndex, yIndex } = getMouseSelectedCalendar(e, scrollRef.current!, config, topHeight);

      // イベントドラッグ中の処理
      if (dragEventItem) {
        const resultStart = start
          .add(xIndex, 'day')
          .add((yIndex - dragEventItem.yDiff) / config.divisionsPerHour, 'hour');
        const resultEnd = resultStart.add(
          ((dragEventItem.ySizeIndex - 1) * 60) / config.divisionsPerHour,
          'minute'
        );

        setSelectedStartDay(resultStart);
        setSelectedEndDay(resultEnd);
        return;
      }

      // 終日イベントのデフォルト値
      let resultDate: dayjs.Dayjs = start.add(xIndex, 'day');

      if (isMouseDownRef.current === 'timely') {
        // 通常のイベントの計算
        resultDate = resultDate.add(yIndex / config.divisionsPerHour, 'hour');
      }

      setSelectedEndDay(resultDate);
    },
    [start, config, topHeight, dragEventItem]
  );

  const handleMouseUp = React.useCallback(
    async (e: React.MouseEvent) => {
      if (!isDragging) return;

      if (!selectedStartDay || !selectedEndDay) return;

      const resultStart = selectedStartDay <= selectedEndDay ? selectedStartDay : selectedEndDay;
      const resultEnd = (selectedStartDay > selectedEndDay ? selectedStartDay : selectedEndDay).add(
        60 / config.divisionsPerHour,
        'minute'
      );

      const menuArgs = {
        anchorEl: e.target as HTMLElement,
        start: resultStart,
        end: resultEnd,
        isAllDay: dragEventItem
          ? !!dragEventItem.event?.start?.date
          : isMouseDownRef.current === 'allday',
        calendarId: dragEventItem ? dragEventItem.event.calendarId : (user?.email ?? ''),
        eventId: dragEventItem ? (dragEventItem.event.id ?? '') : '',
        summary: dragEventItem ? (dragEventItem.event.summary ?? '') : '',
      };

      await openMenu(menuArgs);

      isMouseDownRef.current = null;
      setIsDragging(false);
      setDragEventItem(null);
    },
    [selectedStartDay, selectedEndDay, isDragging, config, openMenu, user, dragEventItem]
  );

  React.useEffect(() => {
    addKeyDownEvent({
      id: 0,
      key: 'Escape',
      callback: () => {
        isMouseDownRef.current = null;
        setIsDragging(false);
        setDragEventItem(null);
      },
    });
    return () => {
      removeKeyDownEvent(0);
    };
  }, [addKeyDownEvent, removeKeyDownEvent]);

  return (
    <div style={{ height: '100svh', display: 'flex', flexDirection: 'column' }}>
      <CalendarHeader control={control} user={user} config={config} />

      {/* カレンダー本体（ドラッグイベントの範囲） */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <CalendarBodyTop
          setTopHeight={setTopHeight}
          start={start}
          calendarEvents={calendarEvents}
          selectedStartDay={selectedStartDay}
          selectedEndDay={selectedEndDay}
          isDragging={isDragging && isMouseDownRef.current === 'allday'}
          config={config}
        />
        <div
          ref={scrollRef}
          style={{
            height: '100%',
            overflow: 'scroll',
            position: 'relative',
          }}
        >
          <CalendarBodyMain
            start={start}
            calendarEvents={calendarEvents}
            selectedStartDay={selectedStartDay}
            selectedEndDay={selectedEndDay}
            isDragging={isDragging && isMouseDownRef.current === 'timely'}
            config={config}
            dragEventItem={dragEventItem}
          />
        </div>
      </div>
    </div>
  );
};
