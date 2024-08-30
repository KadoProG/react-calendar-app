import styles from '@/components/common/feedback/Snackbar.module.scss';
import React from 'react';

type AlertColor = 'success' | 'error' | 'info' | 'warning';

interface SnackbarContextType {
  addMessageObject: (message: string, color: AlertColor) => void;
}

export const SnackbarContext = React.createContext<SnackbarContextType>({
  addMessageObject: () => {}, // ダミー関数
});

interface SnackbarProviderProps {
  children: React.ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = (props) => {
  const [messageObjects, setMessageObjects] = React.useState<
    { message: string; color: AlertColor; disabled: boolean }[]
  >([]);

  // メッセージを追加する関数
  const addMessageObject = React.useCallback((message: string, color: AlertColor) => {
    const newMessageObject = { message, color, disabled: false };
    setMessageObjects((prev) => [...prev, newMessageObject]);
  }, []);

  const setDisabledAll = React.useCallback(() => {
    setMessageObjects((prev) =>
      prev.map((v) => {
        return { ...v, disabled: true };
      })
    );
  }, []);

  return (
    <SnackbarContext.Provider value={{ addMessageObject }}>
      {props.children}
      <div className={styles.snackbar} onClick={setDisabledAll}>
        <div className={styles.snackbar__container}>
          {messageObjects.map((v, i) => (
            <div
              key={i}
              className={`${styles.snackbar__content} ${v.disabled ? styles.force : ''} ${styles[v.color]}`}
              // style={{ backgroundColor: getColor(v.color) }}
            >
              <p>{v.message}</p>
              <span>×</span>
            </div>
          ))}
        </div>
      </div>
    </SnackbarContext.Provider>
  );
};
