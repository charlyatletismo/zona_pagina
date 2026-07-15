import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


export const SelectCustom = ({
  id,
  name,
  options,
  value,
  borderColor,
  width,
  onChange,
  onBlur = () => {},
  disabled = false,
} : {
  id: string,
  name: string,
  options: {value: string, label: string}[],
  value: string,
  borderColor?: string,
  width?: string,
  onChange: (value: string) => void,
  onBlur?: () => void,
  disabled?: boolean,
}) => (
  <Select
    name={name}
    value={value}
    onValueChange={(e) => onChange(e)}
    onOpenChange={(open) => {
      if (!open) {
        onBlur();
      }
    }}
    disabled={disabled}
  >
    <SelectTrigger
      id={id}
      className={`${width || 'w-full'} ${borderColor || ''}`}
    >
      <SelectValue placeholder="..." />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Selecciona una opción</SelectLabel>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  </Select>
)
