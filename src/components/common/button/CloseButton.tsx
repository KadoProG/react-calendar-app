import styles from '@/components/common/button/CloseButton.module.scss';
import React from 'react';

interface CloseButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  type?: HTMLButtonElement['type'];
  style?: React.CSSProperties;
}

export const CloseButton: React.FC<CloseButtonProps> = (props) => (
  <button
    onClick={props.onClick}
    disabled={props.disabled}
    className={styles.closeButton}
    type={props.type}
    style={props.style}
  >
    <img src="/images/icons/close.svg" alt="Close" />
  </button>
);
