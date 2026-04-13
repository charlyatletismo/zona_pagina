import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";


export const PhoneInput = ({
  label,
  name,
  borderColor,
  value,
  onChange,
  onBlur,
  showError = true,
  required = false,
  disabled = false,
} : {
  label: string,
  name: string,
  borderColor?: string,
  value: string,
  onChange: (value: string) => void,
  onBlur: () => void,
  showError?: boolean,
  required?: boolean,
  disabled?: boolean,
}) => {
  const [errorCC, setErrorCC] = useState("");
  const [errorNum, setErrorNum] = useState("");

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="flex mb-2">
        <span className={
          "inline-flex items-center px-3 "
          + "text-sm text-muted-foreground bg-muted "
          + "rounded-l-md border border-r-0 "
          + (borderColor || "")}
        >
          +
        </span>
        <Input
          id={name + "_countryCode"}
          name={name + "_countryCode"}
          placeholder="54"
          maxLength={3}
          value={(value || '').split("_")[0] || ''}
          onChange={(e) => {
            if (!e.target.value.match(/^\d*$/)) { return; } // only numbers
            if (e.target.value.length < 2) {
              setErrorCC("El código de país debe tener al menos 2 dígitos")
            } else {
              setErrorCC("");
            };
            onChange((e.target.value || '') + "_9_" + ((value || '').split("_")[2] || ''))
          }}
          onBlur={onBlur}
          className={"w-16 rounded-none border-x-0 " + (borderColor || '')}
          required={required}
          disabled={disabled}
        />
        <span className={
          "inline-flex items-center px-3 "
          + "text-sm text-muted-foreground bg-muted "
          + "border border-x-0 " + (borderColor || "")}
        >
          9
        </span>
        <Input
          id={name}
          name={name}
          placeholder="celular"
          minLength={10}
          maxLength={10}
          value={(value || '').split("_")[2] || ''}
          onChange={(e) => {
            if (!e.target.value.match(/^\d*$/)) { return; } // only numbers
            if (e.target.value.length < 10) {
              setErrorNum("El número de celular debe tener 10 dígitos")
            } else {
              setErrorNum("");
            };
            onChange(((value || '').split("_")[0] || '') + "_9_" + (e.target.value || ''))
          }}
          onBlur={onBlur}
          className={"rounded-l-none border-l-0 " + (borderColor || "")}
          required={required}
          disabled={disabled}
        />
      </div>
      {showError && (errorCC || errorNum) && (
        <div>
          {errorCC && <div className='ml-auto text-xs text-destructive'>* {errorCC} </div>}
          {errorNum && <div className='ml-auto text-xs text-destructive'>* {errorNum} </div>}
        </div>
      )}
    </div>
  )
}
