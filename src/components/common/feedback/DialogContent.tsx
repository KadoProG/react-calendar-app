import styles from '@/components/common/feedback/Dialog.module.scss';

interface DialogContentProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  onClose?: () => void;
  style?: React.CSSProperties;
}

export const DialogContent: React.FC<DialogContentProps> = (props) => {
  const args = {
    className: styles.dialog__content,
    onClick: (e: React.MouseEvent<HTMLDivElement | HTMLFormElement>) => e.stopPropagation(),
    onSubmit: props.onSubmit,
    style: props.style,
  };

  if (args.onSubmit) {
    return <form {...args}>{props.children}</form>;
  }
  return <div {...args}>{props.children}</div>;
};
