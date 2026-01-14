import { DatePicker } from "./datePicker";
import { Input } from "@/components/ui/input";


export const DateTimePicker = ({
  name,
  value,
  borderColor = '',
  onChange,
  onBlur,
} : {
  name: string,
  value: Date | null | undefined,
  borderColor?: string,
  onChange: (value: Date | null | undefined) => void,
  onBlur: () => void,
}) => {
  return (
    <div className='space-y-2'>
      <DatePicker
        borderColor={borderColor}
        value={value}
        onChange={(d) => {
          if (d && value) {
            d = new Date(
              d.toDateString()
              + " "
              + value?.toTimeString().slice(0, 5)
            )
          };
          onChange(d || null);
        }}
        onBlur={onBlur}
      />
      <Input
        id={name + "_time"}
        name={name + "_time"}
        type="time"
        value={value ? value.toTimeString().slice(0, 5) : ''}
        className={borderColor}
        onBlur={onBlur}
        onChange={(e) => {
          if (value) {
            onChange(
              new Date(
                value.toDateString()
                + ' '
                + e.target.value)
            );
          }
        }}
      />
    </div>
  );
}
