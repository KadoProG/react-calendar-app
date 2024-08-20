import dayjs from '@/libs/dayjs';
import { AuthContext } from '@/contexts/AuthContext';
import { CalendarContext } from '@/contexts/CalendarContext';
import React from 'react';

export const ApiTest: React.FC = () => {
  const { status, user, signIn, signOut } = React.useContext(AuthContext);
  const { calendarEvents, isCalendarsLoading, isCalendarEventsLoading } =
    React.useContext(CalendarContext);
  return (
    <div>
      <h1>Google カレンダー一覧</h1>
      {status === 'unverified' && <p>認証中...</p>}

      {status === 'unauthenticated' && <button onClick={signIn}>サインイン</button>}
      {status === 'authenticated' && <button onClick={signOut}>サインアウト</button>}

      {user && <img src={user.imageUrl} />}

      {isCalendarEventsLoading && <p>イベントロード中...</p>}
      {isCalendarsLoading && <p>カレンダーリストロード中...</p>}

      <ul>
        {calendarEvents.map((event) => (
          <li key={event.id}>
            {dayjs(event.start?.dateTime).format('YYYY-MM-DD HH:mm')}〜
            {dayjs(event.end?.dateTime).format('YYYY-MM-DD HH:mm')}
            {event.summary}
          </li>
        ))}
      </ul>
      <textarea name="" id="" value={JSON.stringify(calendarEvents)} readOnly></textarea>
    </div>
  );
};
