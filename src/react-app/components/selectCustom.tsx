
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
  <div className={`relative ${width || 'w-full'}`}>
    <select
      id={id}
      name={name}
      className={
        `block appearance-none ${width || 'w-full'} bg-transparent dark:bg-input/30 `
        + `border ${borderColor || 'border-input'} `
        + 'shadow-xs '
        + 'px-4 py-2 pr-8 rounded-md leading-tight '
        + 'text-sm '
        + 'focus:border-primary/50 focus:shadow-primary/20'
      }
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
    >
      <option value="" disabled>Selecciona una opción</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.516 7.548a.75.75 0 1 1 1.06-1.06L10 9.94l3.424-3.452a.75.75 0 1 1 1.06 1.06l-4 4a.75.75 0 0 1-1.06 0l-4-4z"/></svg>
    </div>
  </div>
)