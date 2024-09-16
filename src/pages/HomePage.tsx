import { Button } from '@/components/common/button/Button';

export const HomePage: React.FC = () => (
  <div style={{ display: 'flex', width: 200, gap: 4, flexDirection: 'column' }}>
    <h1>Home</h1>
    <Button href="/new-calendar">NewCalendar</Button>
  </div>
);
