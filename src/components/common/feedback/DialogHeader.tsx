import React from 'react';
import styles from '@/components/common/feedback/Dialog.module.scss';
import { DeleteButton } from '@/components/common/button/DeleteButton';

interface DialogHeaderProps {
  title: string;
  onDelete?: () => void;
}

export const DialogHeader: React.FC<DialogHeaderProps> = (props) => {
  return (
    <div className={styles.dialog__header}>
      <h2>{props.title}</h2>
      {props.onDelete && <DeleteButton type="button" onClick={props.onDelete} />}
    </div>
  );
};
