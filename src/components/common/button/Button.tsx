import styles from '@/components/common/button/Button.module.scss';
import React from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  type?: HTMLButtonElement['type'];
  children: React.ReactNode;
  href?: string;
  width?: React.CSSProperties['width'];
}

export const Button: React.FC<ButtonProps> = (props) => {
  if (props.href) {
    return (
      <Link to={props.href} className={styles.button} style={{ width: props.width }}>
        {props.children}
      </Link>
    );
  }
  <button
    onClick={props.onClick}
    disabled={props.disabled}
    type={props.type}
    className={styles.button}
    style={{ width: props.width }}
  >
    {props.children}
  </button>;
};
