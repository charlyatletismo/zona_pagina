import { useState } from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { CalendarIcon } from "lucide-react";


export const DatePicker = ({
  borderColor,
  value,
  onChange,
  onBlur,
  startMonth,
  endMonth,
}: {
  borderColor?: string,
  value: Date | null | undefined,
  onChange: (value: Date | null | undefined) => void,
  onBlur: () => void,
  startMonth?: Date,
  endMonth?: Date,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          onBlur();
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between ${borderColor || ''}`}
        >
          <div className='w-full overflow-hidden text-left'>
            {value?.toLocaleDateString() || 'dd / mm / yyyy'}
          </div>
          <CalendarIcon className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={value || undefined}
          captionLayout="dropdown"
          startMonth={startMonth || new Date(new Date().getFullYear() - 15, 0)}
          endMonth={endMonth || new Date(new Date().getFullYear() + 5, 11)}
          onSelect={(date) => {
            // console.log("selected date", date);
            onChange(!date ? null : new Date(date));
            setOpen(false)
            onBlur();
          }}
        />
      </PopoverContent>
    </Popover>
  )
}