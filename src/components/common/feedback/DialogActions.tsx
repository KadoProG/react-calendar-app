import styles from '@/components/common/feedback/Dialog.module.scss';
import React from 'react';

interface DialogActionsProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const DialogActions: React.FC<DialogActionsProps> = (props) => (
  <div className={styles.dialog__actions} style={props.style}>
    {props.children}
  </div>
);
