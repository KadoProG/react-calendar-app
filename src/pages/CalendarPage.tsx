import Calendar from '../components/Calendar';

export const CalendarPage: React.FC = () => {
  return (
    <div style={{ padding: 10, width: '100%' }}>
      <div style={{ border: '1px solid green' }}>
        <Calendar />
      </div>
    </div>
  );
};
