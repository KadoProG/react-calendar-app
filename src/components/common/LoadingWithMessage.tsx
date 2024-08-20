import styles from '@/components/common/LoadingWithMessage.module.scss';
import React from 'react';

interface LoadingWithMessageProps {
  message?: string;
}

/**
 * メッセージ付きローディング
 */
export const LoadingWithMessage: React.FC<LoadingWithMessageProps> = (props) => (
  <div className={styles.loadingWithMessage}>
    <div className={styles.loadingWithMessage__bottom}>
      <div className={styles.loadingWithMessage__bottom__image}>
        <img src="/images/icons/react.svg" alt="React" />
        <img src="/images/icons/vite.svg" alt="Vite" />
      </div>
      <div className={styles.loadingWithMessage__bottom__message}>
        <p>{props.message}</p>
      </div>
    </div>
  </div>
);
