import styles from '@/components/common/feedback/Dialog.module.scss';
import React from 'react';

interface DialogContentProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const DialogBody: React.FC<DialogContentProps> = (props) => (
  <div className={styles.dialog__body} style={props.style}>
    {props.children}
  </div>
);
