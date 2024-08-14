import styles from '@/components/common/button/Button.module.scss';
import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  type?: HTMLButtonElement['type'];
  children: React.ReactNode;
  width?: React.CSSProperties['width'];
}

export const Button: React.FC<ButtonProps> = (props) => (
  <button
    onClick={props.onClick}
    disabled={props.disabled}
    type={props.type}
    className={styles.button}
    style={{ width: props.width }}
  >
    {props.children}
  </button>
);
