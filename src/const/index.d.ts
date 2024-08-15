interface CalendarEvent {
  id?: string;
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
  title: string;
  isAllDayEvent: boolean;
}
