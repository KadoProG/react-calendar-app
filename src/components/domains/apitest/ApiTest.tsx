import dayjs from '@/libs/dayjs';
import { AuthContext } from '@/contexts/AuthContext';
import { CalendarContext } from '@/contexts/CalendarContext';
import React from 'react';
import { CheckBox } from '@/components/common/input/CheckBox';
import { Button } from '@/components/common/button/Button';
import { CalendarDialog } from '@/components/domains/apitest/CalendarDialog';

export const ApiTest: React.FC = () => {
  const { status, user, signIn, signOut } = React.useContext(AuthContext);
  const { calendarEvents, calendars, isCalendarsLoading, isCalendarEventsLoading, control } =
    React.useContext(CalendarContext);

  const [isOpenDialog, setIsOpenDialog] = React.useState<boolean>(false);

  const [selectedCalendarId, setSelectedCalendarId] = React.useState<string | undefined>();

  const handleAddDialog = React.useCallback((calendarId?: string) => {
    setSelectedCalendarId(calendarId);
    setIsOpenDialog(true);
  }, []);

  return (
    <div>
      <h1>Google カレンダー一覧</h1>
      {status === 'unverified' && <p>認証中...</p>}

      {status === 'unauthenticated' && <button onClick={signIn}>サインイン</button>}
      {status === 'authenticated' && <button onClick={signOut}>サインアウト</button>}

      <CheckBox name="canFetch" control={control} label="データ取得" />

      {user && <img src={user.imageUrl} />}

      {isCalendarEventsLoading && <p>イベントロード中...</p>}

      <ul>
        {calendars.map((event) => (
          <li
            key={event.id}
            style={{ background: event.backgroundColor, display: 'flex', alignItems: 'center' }}
          >
            {event.primary ? '(プライマリ)' : event.summary}
            <Button onClick={() => handleAddDialog(event.id)}>追加</Button>
          </li>
        ))}
      </ul>
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

      <CalendarDialog
        open={isOpenDialog}
        onClose={() => setIsOpenDialog(false)}
        calendarId={selectedCalendarId}
      />
    </div>
  );
};
