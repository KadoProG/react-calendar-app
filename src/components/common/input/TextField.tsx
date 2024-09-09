import { FieldValues, UseControllerProps, useController } from 'react-hook-form';
import styles from '@/components/common/input/TextField.module.scss';
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
  /** フィールドフォーカス解除時の動作 */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** フィールドが有効か否か */
  isActiveFocus?: boolean;
};

export const TextField = <T extends FieldValues>(props: TextFieldProps<T>) => {
  const ref = React.useRef<HTMLInputElement>(null);
  const { field, fieldState } = useController<T>({
    name: props.name,
    control: props.control,
    rules: {
      ...props.rules,
      required: props.required ? '入力必須の項目です' : undefined,
    },
  });

  React.useEffect(() => {
    if (props.isActiveFocus) {
      ref.current?.focus();
    }
  }, [props.isActiveFocus]);

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
        ref={ref}
        placeholder={props.placeholder}
        disabled={props.disabled}
        type={props.type}
        autoFocus={props.autoFocus}
        className={`${styles.Input} ${fieldState.error ? styles.InputError : ''}`}
        onBlur={props.onBlur}
      />
      {fieldState.error && <p className={styles.errorText}>{fieldState.error.message}</p>}
    </div>
  );
};
