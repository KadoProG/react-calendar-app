export const getMouseSelectedCalendar = (
  e: React.MouseEvent<HTMLElement>,
  divisionsPerHour: number
) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const y = e.clientY - rect.top; // カレンダーの上端からの距離
  const indexDivision = Math.floor((y / rect.height) * (24 * divisionsPerHour));

  return { indexDivision, rect };
};
