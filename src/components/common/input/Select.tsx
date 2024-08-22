import { FieldValues, useController, UseControllerProps } from 'react-hook-form';

type SelectProps<T extends FieldValues> = UseControllerProps<T> & {
  label: string;
  options: { label: string; value: string }[];
  style?: React.CSSProperties;
};

export const Select = <T extends FieldValues>(props: SelectProps<T>) => {
  const { field } = useController<T>({
    name: props.name,
    control: props.control,
  });

  return (
    <div style={props.style}>
      <label>{props.label}</label>
      <select {...field}>
        {props.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
