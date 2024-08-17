import { Calendar } from '@/components/domains/Calendar';

export const CalendarPage: React.FC = () => {
  return (
    <div style={{ padding: 10, width: '100%', height: '100svh' }}>
      <div
        style={{
          border: '1px solid green',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Calendar />
      </div>
    </div>
  );
};
