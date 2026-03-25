import {
  Table,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


export const PaginationButtons = <TData,>({
  table,
  pagination,
}: {
  table: Table<TData>,
  pagination: { pageIndex: number, pageSize: number }
}) => {
  return (
    <div className='flex justify-between my-2'>
      <div className='text-gray-500'>
        {table.getFilteredRowModel().rows.length.toLocaleString()} resultados
      </div>
      <div className='flex gap-2'>
        <Button
          type="button"
          variant="outline"
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </Button>
        <Input
          className='max-w-15 text-center'
          value={pagination.pageIndex + 1}
          onChange={(e) => {
            if (!e.target.value) {
              table.setPageIndex(0);
              return;
            }
            if (isNaN(Number(e.target.value))) return;
            let value = Number(e.target.value);
            if (value < 1) value = 1;
            if (value > table.getPageCount()) value = table.getPageCount();
            table.setPageIndex(value - 1);
          }}
        />
        <Button
        type="button"
        variant="outline"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        >
          {'>'}
        </Button>
        <Button
        type="button"
        variant="outline"
        onClick={() => table.lastPage()}
        disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </Button>
        <Select
          name="pageSize"
          value={table.getState().pagination.pageSize.toString()}
          onValueChange={(e) => {
            table.setPageSize(Number(e))
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Tamaño de página</SelectLabel>
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>{pageSize}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}