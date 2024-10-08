import React from 'react';
import dayjs from '@/libs/dayjs';
import { KeyDownContext } from '@/contexts/KeyDownContext';
import { AuthContext } from '@/contexts/AuthContext';
import { calculateIndexDifference } from '@/utils/convertDayjs';
import { boolMouseSelectedCalendarBottom, getMouseSelectedCalendar } from '@/utils/calendarUtils';
import { CalendarMenuContext } from '@/components/domains/editMenu/CalendarMenuContext';

export const useCalendarDragAndDrop = (
  scrollRef: React.RefObject<HTMLDivElement>,
  topHeight: number,
  start: dayjs.Dayjs,
  calendarEvents: CalendarEventWithCalendarId[],
  config: CalendarConfig
) => {
  const { openMenu } = React.useContext(CalendarMenuContext);
  const { user } = React.useContext(AuthContext);
  const { addKeyDownEvent, removeKeyDownEvent } = React.useContext(KeyDownContext);

  const [selectedStartDay, setSelectedStartDay] = React.useState<dayjs.Dayjs | null>(null);
  const [selectedEndDay, setSelectedEndDay] = React.useState<dayjs.Dayjs | null>(null);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const isMouseDownRef = React.useRef<'allday' | 'timely' | null>(null);

  const [dragEventItem, setDragEventItem] = React.useState<{
    event: CalendarEventWithCalendarId;
    xSizeIndex: number;
    ySizeIndex: number;
    yDiff: number;
    isBottom?: boolean;
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

        isMouseDownRef.current = event.start?.date ? 'allday' : 'timely';

        const start = dayjs(event.start?.dateTime || event.start?.date);
        const end = dayjs(event.end?.dateTime || event.end?.date);

        const resultEnd =
          isMouseDownRef.current === 'allday'
            ? end.add(-1, 'day')
            : end.add(-60 / config.divisionsPerHour, 'minute');

        setSelectedStartDay(start);
        setSelectedEndDay(resultEnd);

        const ySizeIndex =
          (dayjs(event.end?.dateTime).diff(dayjs(event.start?.dateTime), 'minute') / 60) *
          config.divisionsPerHour;

        const xSizeIndex = dayjs(event.end?.date).diff(dayjs(event.start?.date), 'day');

        const yDiff =
          isMouseDownRef.current === 'allday'
            ? 0
            : yIndex -
              calculateIndexDifference(
                dayjs(event.start?.dateTime).startOf('day'),
                dayjs(event.start?.dateTime ?? event.start?.date),
                config.divisionsPerHour
              );

        setDragEventItem({
          event,
          ySizeIndex,
          yDiff,
          xSizeIndex,
          isBottom: boolMouseSelectedCalendarBottom(
            e,
            scrollRef.current!,
            config,
            topHeight,
            end,
            start
          ),
        });
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
    [start, config, topHeight, calendarEvents, scrollRef]
  );

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isMouseDownRef.current) return;
      setIsDragging(true);

      const { xIndex, yIndex } = getMouseSelectedCalendar(e, scrollRef.current!, config, topHeight);

      // イベントドラッグ中の処理
      if (dragEventItem) {
        if (dragEventItem.isBottom) {
          // 終日イベントのデフォルト値
          let resultDate: dayjs.Dayjs = start.add(xIndex, 'day');

          if (isMouseDownRef.current === 'timely') {
            // 通常のイベントの計算
            resultDate = resultDate.add(yIndex / config.divisionsPerHour, 'hour');
          }
          setSelectedEndDay(resultDate);

          return;
        }
        // 終日イベントの場合
        if (dragEventItem.event.start?.date) {
          const resultStart = start.add(xIndex, 'day');

          setSelectedStartDay(resultStart);
          setSelectedEndDay(resultStart.add(dragEventItem.xSizeIndex - 1, 'day'));
          return;
        }
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
    [start, config, topHeight, dragEventItem, scrollRef]
  );

  const handleMouseUp = React.useCallback(
    async (e: React.MouseEvent) => {
      if (!isDragging && !dragEventItem) {
        isMouseDownRef.current = null;
        setSelectedStartDay(null);
        setSelectedEndDay(null);
        setDragEventItem(null);
        return;
      }

      if (!selectedStartDay || !selectedEndDay) return;

      const resultStart = selectedStartDay <= selectedEndDay ? selectedStartDay : selectedEndDay;
      const resultEnd = (selectedStartDay > selectedEndDay ? selectedStartDay : selectedEndDay).add(
        60 / config.divisionsPerHour,
        'minute'
      );

      const menuProps = {
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

      await openMenu(menuProps);

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

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    selectedStartDay,
    selectedEndDay,
    isDragging,
    dragEventItem,
    user,
    isMouseDownRef,
    start,
  };
};
