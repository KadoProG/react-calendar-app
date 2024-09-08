import dayjs from '@/libs/dayjs';
import styles from '@/components/domains/newCalendar/CalendarBodyMainRowSelectedItem.module.scss';
import { calculateIndexDifference, splitCalendarEvents } from '@/utils/convertDayjs';

interface CalendarBodyMainRowSelectedItemProps {
  i: number;
  event: ReturnType<typeof splitCalendarEvents>[number];
  config: CalendarConfig;
  selectedStartDay: dayjs.Dayjs | null;
  selectedEndDay: dayjs.Dayjs | null;
  baseDate: dayjs.Dayjs;
}

export const CalendarBodyMainRowSelectedItem: React.FC<CalendarBodyMainRowSelectedItemProps> = (
  props
) => {
  const {
    i,
    event,
    config: { divisionsPerHour, heightPerHour },
    baseDate,
  } = props;

  const sizeIndex =
    Math.abs(calculateIndexDifference(event.splitStart, event.splitEnd, divisionsPerHour)) + 1;

  return (
    <div
      key={i}
      className={styles.selectedItem}
      style={{
        top: `${(calculateIndexDifference(baseDate.startOf('day'), event.splitStart, divisionsPerHour) * heightPerHour) / divisionsPerHour}px`,
        height: `${(sizeIndex * heightPerHour) / divisionsPerHour}px`,
      }}
    >
      <small>
        {(props.selectedStartDay! <= props.selectedEndDay!
          ? props.selectedStartDay!
          : props.selectedEndDay!
        ).format('HH:mm')}
        ~
        {(props.selectedStartDay! > props.selectedEndDay!
          ? props.selectedStartDay
          : props.selectedEndDay)!
          .add(60 / divisionsPerHour, 'minute')
          .format('HH:mm')}
      </small>
    </div>
  );
};
