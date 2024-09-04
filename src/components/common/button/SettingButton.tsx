import styles from '@/components/common/button/SettingButton.module.scss';
import React from 'react';

interface SettingButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  type?: HTMLButtonElement['type'];
  style?: React.CSSProperties;
}

export const SettingButton: React.FC<SettingButtonProps> = (props) => (
  <button
    onClick={props.onClick}
    disabled={props.disabled}
    className={styles.button}
    type={props.type}
    style={props.style}
  >
    <img src="/images/icons/setting.svg" alt="Setting" />
  </button>
);
