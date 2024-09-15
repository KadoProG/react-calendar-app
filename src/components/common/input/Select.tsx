import styles from '@/components/common/input/Select.module.scss';
import { FieldValues, useController, UseControllerProps } from 'react-hook-form';

type SelectProps<T extends FieldValues> = UseControllerProps<T> & {
  label?: string;
  options: { label: string; value: string }[];
  style?: React.CSSProperties;
  required?: boolean;
};

export const Select = <T extends FieldValues>(props: SelectProps<T>) => {
  const { field, fieldState } = useController<T>({
    name: props.name,
    control: props.control,
  });

  return (
    <div className={styles.container} style={props.style}>
      {props.label && (
        <div>
          <label htmlFor={props.name}>{props.label}</label>
          {props.required && <span className={styles.required}>*</span>}
        </div>
      )}
      <select {...field} className={`${styles.Input} ${fieldState.error ? styles.InputError : ''}`}>
        {props.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
