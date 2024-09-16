import { Button } from '@/components/common/button/Button';
import styles from '@/components/domains/newCalendar/CalendarHeaderUserMenuButton.module.scss';
import { AuthContext } from '@/contexts/AuthContext';
import React from 'react';

export const CalendarHeaderUserMenuButton: React.FC = () => {
  const { user, signIn, signOut } = React.useContext(AuthContext);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  return (
    <>
      <Button style={{ padding: 2 }} onClick={() => setIsOpen(true)}>
        <img
          src={user ? user.imageUrl : '/images/icons/guest.png'}
          alt={user ? user.name : 'ゲスト'}
          width={32}
          height={32}
        />
      </Button>
      <div
        className={styles.dialog}
        onClick={() => setIsOpen(false)}
        style={{ display: isOpen ? 'flex' : 'none' }}
      >
        <div className={styles.dialog__content} onClick={(e) => e.stopPropagation()}>
          <Button onClick={() => (user ? signOut() : signIn())}>
            {user ? 'ログアウト' : 'ログイン'}
          </Button>
        </div>
      </div>
    </>
  );
};
