import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div>
      <h1>Home</h1>
      <Link to="/calendar">Calendar</Link>
    </div>
  );
};
