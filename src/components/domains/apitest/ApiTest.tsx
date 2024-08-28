import dayjs from '@/libs/dayjs';
import { AuthContext } from '@/contexts/AuthContext';
import { CalendarContext } from '@/contexts/CalendarContext';
import React from 'react';
import { CheckBox } from '@/components/common/input/CheckBox';
import { Button } from '@/components/common/button/Button';
import { CalendarDialog } from '@/components/domains/apitest/CalendarDialog';
import { SettingDialog } from '@/components/domains/apitest/SettingDialog';
import { SettingButton } from '@/components/common/button/SettingButton';

export const ApiTest: React.FC = () => {
  const { status, user, signIn, signOut } = React.useContext(AuthContext);
  const { calendarEvents, calendars, isCalendarsLoading, isCalendarEventsLoading, control } =
    React.useContext(CalendarContext);

  const [isOpenDialog, setIsOpenDialog] = React.useState<boolean>(false);

  const [isOpenSettingDialog, setIsOpenSettingDialog] = React.useState<boolean>(false);

  const [selectedCalendarId, setSelectedCalendarId] = React.useState<string | undefined>();
  const [selectedEventId, setSelectedEventId] = React.useState<string | undefined>();

  const handleAddDialog = React.useCallback(
    (args: Partial<{ calendarId: string; eventId: string }>) => {
      setSelectedCalendarId(args.calendarId);
      setSelectedEventId(args.eventId);
      setIsOpenDialog(true);
    },
    []
  );

  return (
    <div>
      <h1>Google カレンダー一覧</h1>
      {status === 'unverified' && <p>認証中...</p>}
      <SettingButton onClick={() => setIsOpenSettingDialog(true)} />

      {status === 'unauthenticated' && <Button onClick={signIn}>サインイン</Button>}
      {status === 'authenticated' && <Button onClick={signOut}>サインアウト</Button>}

      <CheckBox name="canFetch" control={control} label="データ取得" />

      {user && <img src={user.imageUrl} />}

      {isCalendarEventsLoading && <p>イベントロード中...</p>}

      <ul>
        {calendars.map((calendar) => (
          <li
            key={calendar.id}
            style={{ background: calendar.backgroundColor, display: 'flex', alignItems: 'center' }}
          >
            {calendar.primary ? '(プライマリ)' : calendar.summary}
            <Button onClick={() => handleAddDialog({ calendarId: calendar.id })}>追加</Button>
          </li>
        ))}
      </ul>
      {isCalendarsLoading && <p>カレンダーリストロード中...</p>}

      <ul>
        {calendarEvents.map((event) => (
          <li key={event.id} style={{ display: 'flex', alignItems: 'center' }}>
            {dayjs(event.start?.dateTime).format('YYYY-MM-DD HH:mm')}〜
            {dayjs(event.end?.dateTime).format('YYYY-MM-DD HH:mm')}
            {event.summary}
            <Button onClick={() => handleAddDialog({ eventId: event.id })}>編集</Button>
          </li>
        ))}
      </ul>
      <textarea name="" id="" value={JSON.stringify(calendarEvents, null, 2)} readOnly></textarea>

      <CalendarDialog
        open={isOpenDialog}
        onClose={() => setIsOpenDialog(false)}
        calendarId={selectedCalendarId}
        eventId={selectedEventId}
      />
      <SettingDialog isOpen={isOpenSettingDialog} onClose={() => setIsOpenSettingDialog(false)} />
    </div>
  );
};
