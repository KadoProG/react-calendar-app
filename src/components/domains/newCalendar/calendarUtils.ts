import React from 'react';

/**
 * マウスで選択された場所を取得し、左から数えたインデックスを返す
 *
 * 上部の日付・曜日が記載された部分で使用する
 */
export const getMouseSelectedCalendar = (
  e: React.MouseEvent<HTMLElement>,
  leftWidth: number,
  weekDisplayCount: number
) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const nowLeftPosition = e.clientX - rect.left - leftWidth; // 現在の左位置
  const xIndex = Math.floor((nowLeftPosition / (rect.width - leftWidth)) * weekDisplayCount);

  return { xIndex };
};
