import styles from '@/components/common/button/DeleteButton.module.scss';
import React from 'react';

interface DeleteButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  type?: HTMLButtonElement['type'];
  style?: React.CSSProperties;
}

export const DeleteButton: React.FC<DeleteButtonProps> = (props) => (
  <button
    onClick={props.onClick}
    disabled={props.disabled}
    className={styles.deleteButton}
    type={props.type}
    style={props.style}
  >
    <img src="/images/icons/delete.svg" alt="Delete" />
  </button>
);
