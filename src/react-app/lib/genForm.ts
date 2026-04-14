import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from '@/components/ui/textarea';
import { PhoneInput } from '@/components/phoneInput';
import { ComboBoxIdName } from '@/components/comboBoxIdName';
import { DatePicker } from '@/components/datePicker';
import { DateTimePicker } from '@/components/datetimePicker';
import { Switch } from '@/components/ui/switch';
import { SelectCustom } from '@/components/selectCustom';


const { fieldContext, formContext } = createFormHookContexts()


export const { useAppForm } = createFormHook({
  fieldComponents: {
    Input,
    Label,
    Calendar,
    Textarea,
    PhoneInput,
    ComboBoxIdName,
    DatePicker,
    DateTimePicker,
    Switch,

    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,

    SelectCustom,

    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,

    Popover,
    PopoverContent,
    PopoverTrigger,
  },
  formComponents: {
    Button,
  },
  fieldContext,
  formContext,
});

