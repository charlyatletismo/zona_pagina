import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Trash2Icon } from 'lucide-react';


export const DeleteButton = ({
  btnText = null,
  btnIcon = <Trash2Icon className='w-4 h-4' />,
  dgTitle = "¿Estás seguro?",
  dgDescription = null,
  dgConfirmBtnText = "Eliminar",
  dgCancelBtnText = "Cancelar",
  onConfirm,
}: {
  btnText?: string | null;
  btnIcon?: React.ReactNode | null;
  dgTitle?: string | null;
  dgDescription?: string | null;
  dgConfirmBtnText?: string;
  dgCancelBtnText?: string;
  onConfirm: () => Promise<void>;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          type="button"
          className='mx-auto flex gap-2 items-center cursor-pointer'
          title="Eliminar"
          size={btnText ? "sm" : "icon-sm"}
        >
          {btnIcon}
          {btnText}
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          {dgTitle && <DialogTitle>{dgTitle}</DialogTitle>}
          {dgDescription && <DialogDescription>{dgDescription}</DialogDescription>}

          <div className='flex gap-2 justify-end mt-2'>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className='max-w-20 cursor-pointer'
              >
                {dgCancelBtnText}
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="button"
                variant="destructive"
                className='max-w-20 cursor-pointer'
                onClick={onConfirm}
              >
                {dgConfirmBtnText}
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
};
