import { Button } from '@/components/common/button/Button';
import { Divider } from '@/components/common/dataDisplay/Divider';
import styles from '@/components/domains/newCalendar/CalendarHeaderUserMenuButton.module.scss';
import { AuthContext } from '@/contexts/AuthContext';
import { KeyDownContext } from '@/contexts/KeyDownContext';
import React from 'react';
import { Link } from 'react-router-dom';

export const CalendarHeaderUserMenuButton: React.FC = () => {
  const { user, signIn, signOut } = React.useContext(AuthContext);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const { addKeyDownEvent, removeKeyDownEvent } = React.useContext(KeyDownContext);

  React.useEffect(() => {
    if (isOpen) {
      addKeyDownEvent({
        id: 2,
        key: 'Escape',
        callback: () => setIsOpen(false),
      });
    } else {
      removeKeyDownEvent(2);
    }
  }, [addKeyDownEvent, removeKeyDownEvent, isOpen]);

  return (
    <>
      <Button style={{ padding: 2 }} onClick={() => setIsOpen((prev) => !prev)}>
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
          <div className={styles.links}>
            <div className={styles.buttonContainerRight}>
              <Button onClick={() => (user ? signOut() : signIn())}>
                {user ? 'ログアウト' : 'ログイン'}
              </Button>
            </div>
            <Divider />
            <p>
              GitHub：
              <Link to="https://github.com/KadoProG/react-calendar-app" target="_blank">
                KadoProG/react-calendar-app
              </Link>
            </p>
            <p>
              ポートフォリオ：
              <Link to="https://sub3.fast5-blog.com" target="_blank">
                sub3.fast5-blog.com
              </Link>
            </p>
            <p>
              X：
              <Link to="https://x.com/KadoUniversity" target="_blank">
                KadoUniversity
              </Link>
            </p>
            <Divider />
          </div>
          <p className={styles.copyright}>&copy; KadoBloG 2024</p>
        </div>
      </div>
    </>
  );
};
