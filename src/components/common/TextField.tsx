import { FieldValues, UseControllerProps, useController } from 'react-hook-form';
import styles from '@/components/common/TextField.module.scss';
import React from 'react';

export type TextFieldProps<T extends FieldValues> = UseControllerProps<T> & {
  label?: string;
  /** フォーム上の名前 */
  name: string;
  /** プレースホルダー */
  placeholder?: string;
  /** 必須項目にするか */
  required?: boolean;
  /** デザインの追記 */
  style?: React.CSSProperties;
  /** inputのtype */
  type: React.HTMLInputTypeAttribute;
  /** ロード時フォームフォーカス */
  autoFocus?: boolean;
};

export const TextField = <T extends FieldValues>(props: TextFieldProps<T>) => {
  const { field, fieldState } = useController<T>({
    name: props.name,
    control: props.control,
    rules: {
      ...props.rules,
      required: props.required ? '入力必須の項目です' : undefined,
    },
  });

  return (
    <div className={styles.container} style={props.style}>
      {props.label && (
        <div>
          <label htmlFor={props.name}>{props.label}</label>
          {props.required && <span className={styles.required}>*</span>}
        </div>
      )}
      <input
        id={props.name}
        {...field}
        placeholder={props.placeholder}
        disabled={props.disabled}
        type={props.type}
        autoFocus={props.autoFocus}
        className={`${styles.Input} ${fieldState.error ? styles.InputError : ''}`}
      />
      {fieldState.error && <p className={styles.errorText}>{fieldState.error.message}</p>}
    </div>
  );
};
