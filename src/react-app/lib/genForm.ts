import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const { fieldContext, formContext } = createFormHookContexts()


export const { useAppForm } = createFormHook({
  fieldComponents: {
    Input,
    Label,
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  },
  formComponents: {
    Button,
  },
  fieldContext,
  formContext,
});

