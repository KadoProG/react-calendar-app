import React from 'react';
import styles from '@/components/common/layout/FormContainer.module.scss';

interface FormContainerProps {
  /** 左側のラベルテキスト */
  label: string;
  /** 右側のコンテンツ */
  children: React.ReactNode;
  /** 左側の追加コンポーネント */
  left?: React.ReactNode;
}

export const FormContainer: React.FC<FormContainerProps> = (props) => (
  <div className={styles.FormContainer}>
    <div className={styles.FormContainer__left}>
      <p>{props.label}</p>
      {props.left}
    </div>
    <div>{props.children}</div>
  </div>
);
