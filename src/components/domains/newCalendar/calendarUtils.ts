import { LEFT_WIDTH } from '@/const/const';
import React from 'react';

/**
 * マウスで選択された場所を取得し、左から数えたインデックスを返す
 *
 * 上部の日付・曜日が記載された部分で使用する
 */
export const getMouseSelectedCalendar = (
  e: React.MouseEvent<HTMLElement>,
  weekDisplayCount: number
) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const nowLeftPosition = e.clientX - rect.left - LEFT_WIDTH; // 現在の左位置
  const xIndex = Math.floor((nowLeftPosition / (rect.width - LEFT_WIDTH)) * weekDisplayCount);
  const yIndex = Math.floor((e.clientY - rect.top) / (rect.height / 24));

  return { xIndex, yIndex };
};
