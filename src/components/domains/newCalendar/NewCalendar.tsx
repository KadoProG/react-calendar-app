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

      // 終日イベントの上でマウスダウンした場合の処理
      if (yIndex < 0) {
        const resultDate = start.add(xIndex, 'day');
        setSelectedStartDay(resultDate);
        setSelectedEndDay(resultDate);
        isMouseDownRef.current = 'allday';
        return;
      }

      // 通常のイベントの上でマウスダウンした場合の処理
      const resultDate = start.add(xIndex, 'day').add(yIndex / config.divisionsPerHour, 'hour');
      setSelectedStartDay(resultDate);
      setSelectedEndDay(resultDate);
      isMouseDownRef.current = 'timely';
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

      if (isMouseDownRef.current === 'allday') {
        const resultDate = start.add(xIndex, 'day');
        setSelectedEndDay(resultDate);
        return;
      }

      const resultDate = start.add(xIndex, 'day').add(yIndex / config.divisionsPerHour, 'hour');
      setSelectedEndDay(resultDate);
    },
    [start, config, topHeight, dragEventItem]
  );

  const handleMouseUp = React.useCallback(
    async (e: React.MouseEvent) => {
      if (!isDragging) return;

      if (!selectedStartDay || !selectedEndDay) return;

      const resultStartDay = selectedStartDay <= selectedEndDay ? selectedStartDay : selectedEndDay;
      const resultEndDay = (
        selectedStartDay > selectedEndDay ? selectedStartDay : selectedEndDay
      ).add(60 / config.divisionsPerHour, 'minute');

      if (dragEventItem) {
        await openMenu({
          anchorEl: e.target as HTMLElement,
          start: resultStartDay,
          end: resultEndDay,
          isAllDay: dragEventItem.event.start?.date ? true : false,
          calendarId: dragEventItem.event.calendarId,
          eventId: dragEventItem.event.id ?? '',
          summary: dragEventItem.event.summary ?? '',
        });
      } else {
        await openMenu({
          anchorEl: e.target as HTMLElement,
          start: resultStartDay,
          end: resultEndDay,
          isAllDay: isMouseDownRef.current === 'allday',
          calendarId: user?.email ?? '',
          eventId: '',
          summary: '',
        });
      }

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
