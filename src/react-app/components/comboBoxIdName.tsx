import { Check, ChevronsUpDown, ScanFaceIcon, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { useState } from 'react';
import { cn, lowerAndRemoveDiacritics } from '@/lib/utils';


export const ComboBoxIdName = ({
  data,
  label,
  name,
  borderColor,
  value,
  onChange,
  onChangeSearch = () => {},
  onBlur,
  placeholder,
  valKey,
  valKeyDesc,
  valKeySetter = () => {},
}: {
  data: {id: string, name: string}[],
  label: string,
  name: string,
  borderColor?: string,
  value: string,
  onChange: (value: string) => void,
  onChangeSearch?: (value: string) => void,
  onBlur: () => void,
  placeholder?: string,
  valKey?: string,
  valKeyDesc?: string,
  valKeySetter?: (value: string) => void,
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
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
              {value !== valKey
                ? (data.find(d => d.id === value)?.name || '...')
                : valKeyDesc || '...'
                }
            </div>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Command
            filter={(value, search) => {
              if (
                lowerAndRemoveDiacritics(value)
                  .includes(lowerAndRemoveDiacritics(search))) return 1
              return 0
            }}
          >
            {value &&
              <div
                className="flex items-center justify-end p-2 bg-red-100 cursor-pointer hover:bg-red-200 border-b border-red-200"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                  onBlur();
                }}
              >
                 <span className="text-xs text-red-900 mr-2 font-semibold">Borrar selección</span>
                 <Trash2 className="text-red-600 w-4 h-4" />
              </div>
            }
            <CommandInput
              placeholder={placeholder || "Buscar..."}
              onChangeCapture={(e) => {
                setSearchValue(e.currentTarget.value);
                onChangeSearch(e.currentTarget.value);
              }}
            />
            <CommandList>
              <CommandEmpty
                className={
                  'text-center text-wrap text-sm '
                  + 'm-2 px-4 py-2 rounded '
                  + (valKey ? 'hover:bg-amber-100 cursor-pointer ' : '')
                }
                onClick={() => {
                  onChange(valKey || '');
                  valKeySetter(searchValue);
                  setOpen(false);
                  onBlur();
                }}
              >
                <div>
                  No se encontraron resultados
                </div>
                {valKey &&
                  <div>
                    <div>
                      Solicitar crear el dato
                    </div>
                    <ScanFaceIcon className="inline-block mt-2 mb-1 w-4 h-4 animate-bounce" />
                  </div>
                }
              </CommandEmpty>
              <CommandGroup className='relative'>
                {data.map((element) => (
                  <CommandItem
                    key={element.id}
                    value={element.id}
                    onSelect={(value) => {
                      onChange(value);
                      setOpen(false);
                      onBlur();
                    }}
                    className={value === element.id ? "bg-green-100" : ""}
                  >
                    {element.name}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === element.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
