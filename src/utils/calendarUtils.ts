import dayjs from '@/libs/dayjs';
import { LEFT_WIDTH } from '@/const/const';
import React from 'react';

/**
 * マウスで選択された場所を取得し、左から数えたインデックスを返す
 *
 * @returns
 * - xIndex 左から数えたインデックス（0 ~ {weekDisplayCount - 1} の範囲）
 * - yIndex 上から数えたインデックス（-1 ~ 23 * divisionsPerHour の範囲）
 */
export const getMouseSelectedCalendar = (
  e: React.MouseEvent<HTMLElement>,
  scrollBase: HTMLElement,
  config: CalendarConfig,
  topHeight: number
) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const nowLeftPosition = e.clientX - rect.left - LEFT_WIDTH; // 現在の左位置
  const xIndex = Math.floor(
    (nowLeftPosition / (rect.width - LEFT_WIDTH)) * config.weekDisplayCount
  );

  if (e.clientY < rect.top + topHeight) {
    return { xIndex, yIndex: -1 };
  }
  const nowTopPosition = e.clientY - rect.top - topHeight + scrollBase.scrollTop; // 現在の上位置
  const yIndex = Math.floor(nowTopPosition / (config.heightPerHour / config.divisionsPerHour));

  return { xIndex, yIndex };
};

/**
 * カレンダーの開始・終了時間を取得する
 */
export const convertCalendarRange = (
  day: dayjs.Dayjs,
  config: CalendarConfig,
  scroll?: -1 | 1
): { start: dayjs.Dayjs; end: dayjs.Dayjs } => {
  let start: dayjs.Dayjs = day.add(config.weekDisplayCount * (scroll || 0), 'day');

  if (config.dateRangeStartTime === 'SunDay') {
    start = start.startOf('week');
  } else if (config.dateRangeStartTime === 'MonDay') {
    start = start.startOf('week').add(1, 'day');
  } else {
    start = start.startOf('day');
  }

  const end = start.add(config.weekDisplayCount - 1, 'day').endOf('day');

  return { start, end };
};

/**
 * マウスで選択された場所を取得し、左から数えたインデックスを返す
 *
 * @returns
 * - xIndex 左から数えたインデックス（0 ~ {weekDisplayCount - 1} の範囲）
 * - yIndex 上から数えたインデックス（-1 ~ 23 * divisionsPerHour の範囲）
 */
export const boolMouseSelectedCalendarBottom = (
  e: React.MouseEvent<HTMLElement>,
  scrollBase: HTMLElement,
  config: CalendarConfig,
  topHeight: number,
  end: dayjs.Dayjs,
  baseDate: dayjs.Dayjs
): boolean => {
  const rect = e.currentTarget.getBoundingClientRect();

  if (e.clientY < rect.top + topHeight) {
    const nowLeftPosition = e.clientX - rect.left; // 現在の左位置

    const endXIndex = end.diff(baseDate, 'day');

    const endPosition =
      (endXIndex * (scrollBase.clientWidth - LEFT_WIDTH)) / config.weekDisplayCount + LEFT_WIDTH;

    return nowLeftPosition > endPosition - 8 && nowLeftPosition <= endPosition;
  }

  const nowTopPosition = e.clientY - rect.top - topHeight + scrollBase.scrollTop; // 現在の上位置

  const endYIndex = (end.diff(dayjs(end).startOf('day'), 'minute') / 60) * config.divisionsPerHour;

  const endPosition = (endYIndex * config.heightPerHour) / config.divisionsPerHour;

  return nowTopPosition > endPosition - 8 && nowTopPosition <= endPosition;
};
