import styles from '@/components/common/button/DeleteButton.module.scss';
import React from 'react';

interface DeleteButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const DeleteButton: React.FC<DeleteButtonProps> = (props) => (
  <button onClick={props.onClick} disabled={props.disabled} className={styles.deleteButton}>
    <img src="/images/icons/delete.svg" alt="Delete" />
  </button>
);
