import dayjs from '@/libs/dayjs';
import { LEFT_WIDTH } from '@/const/const';
import React from 'react';

/**
 * マウスで選択された場所を取得し、左から数えたインデックスを返す
 *
 * @returns {xIndex: number, yIndex: number}
 * - xIndex: 左から数えたインデックス（0 ~ {weekDisplayCount - 1} の範囲）
 * - yIndex: 上から数えたインデックス（-1 ~ 23 * divisionsPerHour の範囲）
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
  config: CalendarConfig
): { start: dayjs.Dayjs; end: dayjs.Dayjs } => {
  let start: dayjs.Dayjs = day;
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
