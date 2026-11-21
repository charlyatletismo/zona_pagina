import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { CalendarIcon, ChevronLeftIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "year" | "month" | "day";

const LOCALE = "es-AR";

const MONTHS = Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i, 1).toLocaleString(LOCALE, { month: "short" }).replace(".", "")
);

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Date picker meant for birth dates: the user picks the year first,
 * then the month, and finally the day.
 */
export const BirthDatePicker = ({
  borderColor,
  value,
  onChange,
  onBlur,
  startMonth,
  endMonth,
  defaultYear,
}: {
  borderColor?: string,
  value: Date | null | undefined,
  onChange: (value: Date | null | undefined) => void,
  onBlur: () => void,
  /** Earliest selectable month. Defaults to 120 years ago. */
  startMonth?: Date,
  /** Latest selectable month. Defaults to the current month. */
  endMonth?: Date,
  /** Year scrolled into view when there's no value yet. Defaults to 30 years ago. */
  defaultYear?: number,
}) => {
  const today = new Date();
  const minDate = startMonth || new Date(today.getFullYear() - 120, 0, 1);
  const maxDate = endMonth
    ? new Date(endMonth.getFullYear(), endMonth.getMonth() + 1, 0)
    : today;
  const minYear = minDate.getFullYear();
  const maxYear = maxDate.getFullYear();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("year");
  const [year, setYear] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);

  const years: number[] = [];
  for (let y = maxYear; y >= minYear; y--) years.push(y);

  const isMonthDisabled = (y: number, m: number) =>
    new Date(y, m + 1, 0) < minDate || new Date(y, m, 1) > maxDate;

  const handleOpenChange = (o: boolean) => {
    setOpen(o);
    if (o) {
      // Always start from the year step
      setStep("year");
      setYear(value ? value.getFullYear() : null);
      setMonth(value ? value.getMonth() : null);
    } else {
      onBlur();
    }
  };

  // Scroll the selected (or default) year into view
  const yearListRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open || step !== "year") return;
    const target = year ?? defaultYear ?? today.getFullYear() - 30;
    // Wait for the popover content to be mounted
    const id = requestAnimationFrame(() => {
      const el = yearListRef.current?.querySelector<HTMLElement>(`[data-year="${target}"]`);
      el?.scrollIntoView({ block: "center" });
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step]);

  const header = (title: string, onBack?: () => void) => (
    <div className="flex items-center gap-1 h-8">
      {onBack ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={onBack}
          aria-label="Volver"
        >
          <ChevronLeftIcon />
        </Button>
      ) : (
        <div className="size-8" />
      )}
      <div className="flex-1 text-center text-sm font-medium">{title}</div>
      <div className="size-8" />
    </div>
  );

  const stepper = (
    <div className="flex justify-center gap-1 text-xs text-muted-foreground">
      {(["year", "month", "day"] as Step[]).map((s, i) => (
        <span
          key={s}
          className={cn(step === s && "text-foreground font-medium")}
        >
          {i > 0 && <span className="mx-1">›</span>}
          {s === "year" ? "Año" : s === "month" ? "Mes" : "Día"}
        </span>
      ))}
    </div>
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
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
      <PopoverContent className="w-auto overflow-hidden p-3" align="start">
        <div className="flex flex-col gap-3 w-[15.5rem]">
          {stepper}

          {step === "year" && (
            <>
              {header("Elegí el año")}
              <div
                ref={yearListRef}
                className="grid grid-cols-4 gap-1 h-64 overflow-y-auto pr-1"
              >
                {years.map((y) => (
                  <Button
                    key={y}
                    type="button"
                    data-year={y}
                    variant={y === year ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      setYear(y);
                      if (month !== null && isMonthDisabled(y, month)) setMonth(null);
                      setStep("month");
                    }}
                  >
                    {y}
                  </Button>
                ))}
              </div>
            </>
          )}

          {step === "month" && year !== null && (
            <>
              {header(`Elegí el mes de ${year}`, () => setStep("year"))}
              <div className="grid grid-cols-3 gap-2">
                {MONTHS.map((name, m) => (
                  <Button
                    key={m}
                    type="button"
                    variant={m === month ? "default" : "outline"}
                    disabled={isMonthDisabled(year, m)}
                    onClick={() => {
                      setMonth(m);
                      setStep("day");
                    }}
                  >
                    {capitalize(name)}
                  </Button>
                ))}
              </div>
            </>
          )}

          {step === "day" && year !== null && month !== null && (
            <>
              {header("Elegí el día", () => setStep("month"))}
              <Calendar
                mode="single"
                className="p-0 mx-auto"
                month={new Date(year, month, 1)}
                hideNavigation
                showOutsideDays={false}
                selected={value || undefined}
                disabled={[{ before: minDate }, { after: maxDate }]}
                formatters={{
                  formatCaption: (date) =>
                    capitalize(date.toLocaleString(LOCALE, { month: "long", year: "numeric" })),
                }}
                onSelect={(date) => {
                  onChange(!date ? null : new Date(date));
                  setOpen(false);
                  onBlur();
                }}
              />
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
