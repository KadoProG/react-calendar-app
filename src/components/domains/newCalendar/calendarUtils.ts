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
  weekDisplayCount: number,
  divisionsPerHour: number,
  topHeight: number
) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const nowLeftPosition = e.clientX - rect.left - LEFT_WIDTH; // 現在の左位置
  const xIndex = Math.floor((nowLeftPosition / (rect.width - LEFT_WIDTH)) * weekDisplayCount);
  const nowTopPosition = e.clientY - rect.top - topHeight; // 現在の上位置
  const yIndex = Math.floor((nowTopPosition / (rect.height - topHeight)) * 24 * divisionsPerHour);

  return { xIndex, yIndex };
};
