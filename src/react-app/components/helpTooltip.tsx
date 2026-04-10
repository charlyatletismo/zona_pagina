import {
  CircleQuestionMarkIcon,
} from 'lucide-react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';


export const HelpTooltip = ({ content }: { content: string }) => {
  return (
    <Popover>
      <PopoverTrigger className='cursor-pointer hover:text-primary'>
        <CircleQuestionMarkIcon className='w-4 h-4' />
      </PopoverTrigger>
      <PopoverContent className='bg-background p-3 rounded-md border'>
        <p className='text-sm'>{content}</p>
      </PopoverContent>
    </Popover>
  )
}
