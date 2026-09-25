import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";


const SEGMENT_LENGTHS = [2, 8, 1] as const;
const SEGMENT_ERRORS = [
  "El primer segmento debe tener 2 dígitos",
  "El segundo segmento (casi siempre el DNI) debe tener 8 dígitos",
  "El último segmento (dígito verificador) debe tener 1 dígito",
];

export const CuitInput = ({
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
  value: string | null,
  onChange: (value: string | null) => void,
  onBlur: () => void,
  showError?: boolean,
  required?: boolean,
  disabled?: boolean,
}) => {
  const [errors, setErrors] = useState(["", "", ""]);
  const numberRef = useRef<HTMLInputElement>(null);
  const checkDigitRef = useRef<HTMLInputElement>(null);

  const segments = (value || '').split("-");
  const getSegment = (i: number) => segments[i] || '';

  const handleSegmentChange = (i: number, segValue: string) => {
    if (!segValue.match(/^\d*$/)) { return; } // only numbers
    const newErrors = [...errors];
    newErrors[i] = segValue.length > 0 && segValue.length < SEGMENT_LENGTHS[i]
      ? SEGMENT_ERRORS[i]
      : "";
    setErrors(newErrors);

    const newSegments = [0, 1, 2].map((j) => j === i ? segValue : getSegment(j));
    // Empty CUIT is stored as null (field is optional)
    onChange(newSegments.every((s) => s === '') ? null : newSegments.join("-"));

    // Move focus to the next segment once the current one is complete
    if (segValue.length === SEGMENT_LENGTHS[i]) {
      if (i === 0) { numberRef.current?.focus(); }
      if (i === 1) { checkDigitRef.current?.focus(); }
    }
  };

  const separator = (
    <span className={
      "inline-flex items-center px-2 "
      + "text-sm text-muted-foreground bg-muted "
      + "border border-x-0 " + (borderColor || "")}
    >
      -
    </span>
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="flex mb-2">
        <Input
          id={name}
          name={name + "_initial"}
          placeholder="XX"
          minLength={SEGMENT_LENGTHS[0]}
          maxLength={SEGMENT_LENGTHS[0]}
          value={getSegment(0)}
          onChange={(e) => handleSegmentChange(0, e.target.value)}
          onBlur={onBlur}
          className={"w-14 rounded-r-none border-r-0 " + (borderColor || "")}
          required={required}
          disabled={disabled}
        />
        {separator}
        <Input
          ref={numberRef}
          id={name + "_id"}
          name={name + "_id"}
          placeholder="XXXXXXXX"
          minLength={SEGMENT_LENGTHS[1]}
          maxLength={SEGMENT_LENGTHS[1]}
          value={getSegment(1)}
          onChange={(e) => handleSegmentChange(1, e.target.value)}
          onBlur={onBlur}
          className={"rounded-none border-x-0 " + (borderColor || "")}
          required={required}
          disabled={disabled}
        />
        {separator}
        <Input
          ref={checkDigitRef}
          id={name + "_checkDigit"}
          name={name + "_checkDigit"}
          placeholder="X"
          minLength={SEGMENT_LENGTHS[2]}
          maxLength={SEGMENT_LENGTHS[2]}
          value={getSegment(2)}
          onChange={(e) => handleSegmentChange(2, e.target.value)}
          onBlur={onBlur}
          className={"w-12 rounded-l-none border-l-0 " + (borderColor || "")}
          required={required}
          disabled={disabled}
        />
      </div>
      {showError && errors.some((e) => e) && (
        <div>
          {errors.filter((e) => e).map((e) => (
            <div key={e} className='ml-auto text-xs text-destructive'>* {e} </div>
          ))}
        </div>
      )}
    </div>
  )
}
