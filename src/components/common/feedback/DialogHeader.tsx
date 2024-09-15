import React from 'react';
import styles from '@/components/common/feedback/Dialog.module.scss';
import { DeleteButton } from '@/components/common/button/DeleteButton';
import { CloseButton } from '@/components/common/button/CloseButton';

interface DialogHeaderProps {
  title: string;
  onDelete?: () => void;
  onClose?: () => void;
}

export const DialogHeader: React.FC<DialogHeaderProps> = (props) => (
  <div className={styles.dialog__header}>
    <h2>{props.title}</h2>
    {props.onDelete && <DeleteButton type="button" onClick={props.onDelete} />}
    {props.onClose && <CloseButton type="button" onClick={props.onClose} />}
  </div>
);
