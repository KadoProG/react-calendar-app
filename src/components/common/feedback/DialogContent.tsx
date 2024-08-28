import styles from '@/components/common/feedback/Dialog.module.scss';

interface DialogContentProps {
  children: React.ReactNode;
  onSubmit?: () => void;
}

export const DialogContent: React.FC<DialogContentProps> = (props) => {
  return (
    <div
      className={styles.dialog__content}
      onClick={(e) => e.stopPropagation()}
      onSubmit={props.onSubmit}
    >
      {props.children}
    </div>
  );
};
