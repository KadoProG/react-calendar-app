import styles from '@/components/common/input/CheckBox.module.scss';
import { FieldValues, useController, UseControllerProps } from 'react-hook-form';

type CheckBoxProps<T extends FieldValues> = UseControllerProps<T> & {
  label: string;
  /** デザインの追記 */
  style?: React.CSSProperties;
};

export const CheckBox = <T extends FieldValues>(props: CheckBoxProps<T>) => {
  const { fieldState, field } = useController<T>({
    name: props.name,
    control: props.control,
  });
  return (
    <div className={styles.container} style={props.style}>
      <input
        type="checkbox"
        {...field}
        id={props.name}
        className={styles.CheckBox}
        checked={field.value}
      />
      <label htmlFor={props.name} className={styles.Label}>
        {props.label}
      </label>
      {fieldState.error && <p className={styles.errorText}>{fieldState.error.message}</p>}
    </div>
  );
};
